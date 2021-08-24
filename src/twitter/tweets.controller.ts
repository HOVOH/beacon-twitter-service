import { Body, Controller, Delete, Get, Param, Put, Query, Req, Res, UseGuards } from "@nestjs/common";
import { KeysetPage, serialize } from "@hovoh/nestjs-api-lib";
import { TweetsFilter } from "./requests/tweets.filter";
import { TweetsOrderBy, TweetsService } from "./tweets.service";
import { AccessTokenGuard, ReqSession, Session } from "@hovoh/nestjs-authentication-lib";
import { KeysetResults } from "@hovoh/nestjs-api-lib/dist/KeysetResults";
import { split } from "../utils/utils";
import { Tweet } from "./entities/tweet.entity";
import { DeleteTweetsFilter } from "./requests/delete-tweets.filter";

@Controller('api/v1/twitter/tweets')
@UseGuards(AccessTokenGuard)
export class TweetsController {

  constructor(private tweetsService: TweetsService) {
  }

  @Get()
  async getTweets(@Query() page: KeysetPage<TweetsOrderBy>, @Query() filter: TweetsFilter){
    const tweets = await this.tweetsService.query({
      minScore: filter.minScore,
      withTags: split(filter.tags),
      ids: split(filter.ids),
      hasTopics: split(filter.hasTopics),
      noTopicsLabelled: filter.noTopicsLabelled,
      isLabelled: filter.isLabelled
    }, page);
    return new KeysetResults<Tweet>(tweets, (tweet)=> tweet.createdAt.toISOString());
  }

  @Put(":id/meta/topics")
  async addTopics(@ReqSession() session: Session, @Body("topics") topics: string[], @Param("id") tweetId: string){
    const tweet = await this.tweetsService.findByTweetId(tweetId);
    tweet.meta.addTopic(session.userUuid, topics);
    return this.tweetsService.save(tweet);
  }

  @Delete()
  async deleteTweets(@Query() filter: DeleteTweetsFilter){
    console.log(split(filter.authorTids))
    const result = await this.tweetsService.delete({
      authorsTids: split(filter.authorTids),
      includeTagged: Boolean(filter.includeTagged)
    })
    return {deletedCount: result.deletedCount}
  }

}
