import { Injectable } from "@nestjs/common";
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

  fetchClient: HttpClient;
  followRateLimiter: RateLimiter;

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

  //
  // https://api.twitter.com/2/users/:id/tweets?tweet.fields=created_at&expansions=author_id&user.fields=created_at&max_results=5
  //
  async getUsersTweetsHistory(id: string, startTime?: Date, endTime?: Date, limit = 100, maxNumber = 1000): Promise<ITweet[]>{
    const iTweets: ITweet[] = [];
    let hasNext = true;
    const query: any = {
      "tweet.fields": FULL_TWEET_FIELDS,
      "max_results": limit,
    }
    for (let page = 0; hasNext && page * limit < maxNumber; page+=1){
      const response: IPaginatedResponse<ITweet[]> = await this.fetchClient.get(`2/users/${id}/tweets?`, query)
      if (response.meta.result_count > 0){
        iTweets.push(...response.data);
      }
      if (response.meta.next_token){
        query.pagination_token = response.meta.next_token
      } else {
        hasNext = false;
      }
    }
    return iTweets;
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
    paginationScroller.setParams(`2/users/${id}/following`,query)
    return paginationScroller;
  }

}
