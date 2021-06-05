import { Body, Controller, Get, Param, Put, Query, Req, Res, UseGuards } from "@nestjs/common";
import { KeysetPage, serialize } from "@hovoh/nestjs-api-lib";
import { TweetsFilter } from "./requests/tweets.filter";
import { TweetsService } from "./tweets.service";
import { AccessTokenGuard, Public, ReqSession, Session } from "@hovoh/nestjs-authentication-lib";
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
      noTopicsLabelled: filter.noTopicsLabelled,
      isLabelled: filter.isLabelled
    }, page);
    return new KeysetResults(tweets);
  }

  @Put(":id/meta/topics")
  async addTopics(@ReqSession() session: Session, @Body("topics") topics: string[], @Param("id") tweetId: string){
    const tweet = await this.tweetsService.findByTweetId(tweetId);
    tweet.meta.addTopic(session.userUuid, topics);
    return this.tweetsService.save(tweet);
  }

  @Get("download")
  @Public()
  async download(/*@Req() req, @Res() res*/){
    const tweets = serialize(await this.tweetsService.getLabelled());
    return tweets

  }

}
