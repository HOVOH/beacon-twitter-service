import { Injectable } from "@nestjs/common";
import { EnvironmentService } from "@hovoh/nestjs-environment-module";
import { IEnv } from "../../app.module";
import { HttpClient } from "../../http/http-client";
import { FULL_USER_FIELDS, IUser } from "./user";
import { FULL_TWEET_FIELDS, ITweet } from "./tweet";
import { IPaginatedResponse, IResponse } from "./response";
import { ApplicationError } from "@hovoh/nestjs-application-error";
import { USER_NOT_FOUND } from "../errors.code";

export const TWITTER_API_LINK = 'https://api.twitter.com/';

@Injectable()
export class TwitterApi {

  fetchClient: HttpClient;

  constructor({ env }: EnvironmentService<IEnv>) {
    this.fetchClient = new HttpClient(
      TWITTER_API_LINK,
      env.TWITTER_BEARER_TOKEN,
    );
  }

  async getUsers(usernames: string){
    usernames = usernames.replace("@", "");
    try {
      const response: IResponse<IUser[]> = await this.fetchClient.get("2/users/by", {
        usernames:usernames,
        "user.fields": FULL_USER_FIELDS
      });
      return response.data;
    } catch (ignored) {
      throw new ApplicationError(USER_NOT_FOUND);
    }
  }

  //
  // https://api.twitter.com/2/users/:id/tweets?tweet.fields=created_at&expansions=author_id&user.fields=created_at&max_results=5
  //
  async getUsersTweetsHistory(id: string, startTime?: Date, endTime?: Date, limit = 100): Promise<ITweet[]>{
    const iTweets: ITweet[] = [];
    let hasNext = true;
    const query: any = {
      "tweet.fields": FULL_TWEET_FIELDS,
      "max_results": limit,
    }
    while (hasNext){
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

}
