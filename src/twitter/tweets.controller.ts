import { Body, Controller, Get, Param, Put, Query, UseGuards } from "@nestjs/common";
import { KeysetPage } from "@hovoh/nestjs-api-lib";
import { TweetsFilter } from "./requests/tweets.filter";
import { TweetsService } from "./tweets.service";
import { AccessTokenGuard, ReqSession, Session } from "@hovoh/nestjs-authentication-lib";
import { KeysetResults } from "@hovoh/nestjs-api-lib/dist/KeysetResults";
import { split } from "../utils/utils";

@Controller('api/v1/twitter/tweets')
@UseGuards(AccessTokenGuard)
export class TweetsController {

  constructor(private tweetsService: TweetsService) {
  }

  @Get()
  async getTweets(@Query() page: KeysetPage, @Query() filter: TweetsFilter){
    const tweets = await this.tweetsService.query({
      minScore: filter.minScore,
      withTags: split(filter.tags),
      ids: split(filter.ids),
      hasTopics: split(filter.hasTopics),
      noTopicsLabelled: filter.noTopicsLabelled
    }, page);
    return new KeysetResults(tweets);
  }

  @Put(":id/meta/topics")
  async addTopics(@ReqSession() session: Session, @Body("topics") topics: string[], @Param("id") tweetId: string){
    const tweet = await this.tweetsService.findByTweetId(tweetId);
    tweet.meta.addTopic(session.userUuid, topics);
    return this.tweetsService.save(tweet);
  }

}
