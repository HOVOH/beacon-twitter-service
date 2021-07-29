import { Injectable, Logger } from "@nestjs/common";
import { EnvironmentService } from '@hovoh/nestjs-environment-module';
import { IEnv } from '../app.module';
import { HttpClient } from '../http/http-client';
import { ITweetSample } from "./api/tweet-sample";
import { EventService } from "../events/event.service";
import {
  FULL_TWEET_FIELDS, ITweet,
  TWEET_AUTHOR_ID
} from "./api/tweet";
import { FULL_USER_FIELDS, IUser } from "./api/user";
import { TWITTER_API_LINK } from "./api/twitter-api.service";
import { Tweet } from "./entities/tweet.entity";
import { TwitterUser } from "./entities/twitter-user.entity";
import { SampleTweetEvent } from "./events/sample-tweet.event";
import { BatchPipeline, JsonParserPipe, ProcessingPipe, MapPipe } from "@hovoh/ts-data-pipeline";
import { RawTweetPipe } from "../pipeline/RawTweetPipe";
import { LanguageRule } from "../pipeline/LanguageRule";
import { TopicsRule } from "../pipeline/TopicsRule";
import { SaveTweetPipe } from "../pipeline/SaveTweetPipe";
import { GetAuthorPipe } from "../pipeline/GetAuthorPipe";
import { RawTwitterUserPipe } from "../pipeline/RawTwitterUserPipe";
import { SaveTwitterUserPipe } from "../pipeline/SaveTwitterUserPipe";

@Injectable()
export class TwitterSamplingService {
  static readonly NAME = "TwitterSamplingService";

  fetchClient: HttpClient;
  private readonly logger = new Logger(TwitterSamplingService.name);
  tweetAnalysisUrl: string;

  constructor({ env }: EnvironmentService<IEnv>,
              private eventEmitter: EventService,
              private saveTweetPipe: SaveTweetPipe,
              private saveTwitterUserPipe: SaveTwitterUserPipe
              ) {
    this.fetchClient = new HttpClient(
      TWITTER_API_LINK,
      env.TWITTER_BEARER_TOKEN,
    );
    this.tweetAnalysisUrl = env.TWEET_ANALYSIS_URL;
    if (env.ENABLE_TWEET_SAMPLING){
      this.startTweetSampling();
    }
  }

  tweetsPipelineFactory() {
    return new BatchPipeline<string|ITweetSample|ITweet, Tweet>([
      new JsonParserPipe<ITweetSample>(),
      new MapPipe((tweetSample:ITweetSample) => tweetSample.data),
      new RawTweetPipe(),
      new ProcessingPipe<Tweet>(1,[
        new LanguageRule(),
        new TopicsRule(this.tweetAnalysisUrl)
      ]),
      this.saveTweetPipe
    ])
  }

  twitterUsersPipelineFactory() {
    return new BatchPipeline<string|ITweetSample|IUser, TwitterUser>([
      new JsonParserPipe<ITweetSample>(),
      new GetAuthorPipe(),
      new RawTwitterUserPipe(),
      this.saveTwitterUserPipe,
    ])
  }

  async startTweetSampling() {
    this.logger.log("Starting tweet sample")
    await this.fetchClient.stream(
      '2/tweets/sample/stream',
      {
        'tweet.fields': FULL_TWEET_FIELDS,
        "expansions": TWEET_AUTHOR_ID,
        'user.fields': FULL_USER_FIELDS,
      },
      async (jsonTweet: string) => {
        try{
          if (jsonTweet){
            const tweet = (await this.tweetsPipelineFactory().process([jsonTweet]))[0];
            const user = (await this.twitterUsersPipelineFactory().process([jsonTweet]))[0];
            this.eventEmitter.emit(new SampleTweetEvent(tweet, user));
          }
        } catch (error){
          if (!error.healthThresholdNotReached){
            this.logger.error(error.message+". TweetSample: "+jsonTweet);
            console.log(error.stack)
          }
        }
      },
      (error) => this.logger.error("Stream error "+error.message),
      ()=> {
        this.logger.log("Twitter sampling stream closed. Waiting 1 min before restart");
        const timer = new Promise(res => setTimeout(res, 60000));
        timer.then(() => this.startTweetSampling())
      }
    );
  }

  async getSampleTweet() {
    return this.fetchClient.get('2/tweets/search/recent', {
      query: 'from:twitterdev',
    });
  }


}
