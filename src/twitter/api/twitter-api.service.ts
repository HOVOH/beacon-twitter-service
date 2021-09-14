import { Injectable, Logger } from "@nestjs/common";
import { EnvironmentService } from "@hovoh/nestjs-environment-module";
import { IEnv } from "../../app.module";
import { HttpClient } from "../../http/http-client";
import { FULL_USER_FIELDS, IUser } from "./user";
import { FULL_TWEET_FIELDS, ITweet } from "./tweet";
import { IPaginatedResponse, IResponse } from "./response";
import { ApplicationError } from "@hovoh/nestjs-application-error";
import { UNEXPECTED_ERROR, USER_NOT_FOUND } from "../errors.code";
import { RateLimiter } from "limiter";
import { PaginationScroller } from "./PaginationScroller";

export const TWITTER_API_LINK = 'https://api.twitter.com/';
const RATE_LIMIT_WINDOW = 900000;

@Injectable()
export class TwitterApi {

  static readonly NAME = "TwitterApi";
  fetchClient: HttpClient;
  followRateLimiter: RateLimiter;
  tweetTimelineRateLimiter: RateLimiter;
  logger = new Logger(TwitterApi.NAME);

  constructor({ env }: EnvironmentService<IEnv>) {
    this.fetchClient = new HttpClient(
      TWITTER_API_LINK,
      env.TWITTER_BEARER_TOKEN,
    );
    this.followRateLimiter = new RateLimiter({
      tokensPerInterval: 15,
      interval: RATE_LIMIT_WINDOW,
      fireImmediately: true,
    })
    this.tweetTimelineRateLimiter = new RateLimiter({
      tokensPerInterval: 1500,
      interval: RATE_LIMIT_WINDOW,
      fireImmediately: true,
    })
  }

  async getUsers(usernames: string){
    usernames = usernames.replace("@", "");
    let response: IResponse<IUser[]>;
    try {
      response = await this.fetchClient.get("2/users/by", {
        usernames:usernames,
        "user.fields": FULL_USER_FIELDS
      });
    } catch (ignored) {
      throw new ApplicationError(UNEXPECTED_ERROR);
    }
    if (response.errors) {
      if (response.errors.find(error => error.parameter === "username")){
        throw new ApplicationError(USER_NOT_FOUND);
      } else {
        throw new ApplicationError(UNEXPECTED_ERROR);
      }
    }
    return response.data;
  }

  async getUser(tid: string){
    let response: IResponse<IUser>;
    try {
      response = await this.fetchClient.get("2/users/"+tid, {
        "user.fields": FULL_USER_FIELDS
      });
    } catch (error) {
      const errorReponse = error as Response;
      this.logger.error("getUser failed for tid: "+tid)
      console.log(errorReponse);
      throw new ApplicationError(UNEXPECTED_ERROR);
    }
    if (response.errors) {
      if (response.errors.find(error => error.parameter === "id")){
        throw new ApplicationError(USER_NOT_FOUND);
      } else {
        throw new ApplicationError(UNEXPECTED_ERROR);
      }
    }
    return response.data;
  }

  getUsersTweetsHistory(id: string, query?: {"tweet.fields"?: string, since_id?: string}, maxNumber = 1000): Promise<ITweet[]>{
    const paginationScroller = new PaginationScroller<ITweet>(this.fetchClient, this.tweetTimelineRateLimiter, 900);
    query = Object.assign({
      "tweet.fields": FULL_TWEET_FIELDS,
      "max_results": 100,
    }, query)
    paginationScroller.setPath(`2/users/${id}/tweets`)
      .setQuery(query)
      .setMaxBufferSize(maxNumber)
      .onRateLimit(() => this.logger.log("User timeline endpoint has reach rate limit"));
    return paginationScroller.get();
  }

  getFollowings(id: string, limit = 1000) {
    const paginationScroller = new PaginationScroller<IUser>(
      this.fetchClient,
      this.followRateLimiter,
      15
    );
    const query: any = {
      "max_results": limit,
    }
    paginationScroller.setPath(`2/users/${id}/following`)
      .setQuery(query)
      .onRateLimit(() => this.logger.log("Following endpoint has reach rate limit"))
    return paginationScroller;
  }

}
