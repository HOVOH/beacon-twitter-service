import { Injectable, Logger } from "@nestjs/common";
import { EnvironmentService } from '@hovoh/nestjs-environment-module';
import { IEnv } from '../app.module';
import { HttpClient } from '../http/http-client';
import { ITweetSample } from "./api/tweet-sample";
import { EventService } from "../events/event.service";
import {
  FULL_TWEET_FIELDS,
  TWEET_AUTHOR_ID,
} from "./api/tweet";
import { FULL_USER_FIELDS } from "./api/user";
import { TWITTER_API_LINK } from "./api/twitter-api.service";
import { Tweet } from "./entities/tweet.entity";
import { TwitterUser } from "./entities/twitter-user.entity";
import { SampleTweetEvent } from "./events/sample-tweet.event";
import { TweetPipeline } from "./tweet-pipeline.service";
import { TwitterUserPipeline } from "./user-pipeline.service";


@Injectable()
export class TwitterSamplingService {
  static readonly NAME = "TwitterSamplingService";

  fetchClient: HttpClient;
  private readonly logger = new Logger(TwitterSamplingService.name);

  constructor({ env }: EnvironmentService<IEnv>,
              private eventEmitter: EventService,
              private tweetsPipeline: TweetPipeline,
              private twitterUserPipeline: TwitterUserPipeline
              ) {
    this.fetchClient = new HttpClient(
      TWITTER_API_LINK,
      env.TWITTER_BEARER_TOKEN,
    );
    //this.startTweetSampling();
  }

  async startTweetSampling() {
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
            const iTweet = JSON.parse(jsonTweet) as ITweetSample;
            let tweet = Tweet.fromITweetSample(iTweet);
            tweet = await this.tweetsPipeline.process(tweet);
            const iUser = iTweet.includes.users.find(user => tweet.authorId === user.id);
            let user = TwitterUser.fromIUser(iUser);
            user = await this.twitterUserPipeline.process(user);
            this.eventEmitter.emit(new SampleTweetEvent(tweet, user));
          }
        } catch (jsonParseError){
          this.logger.error(jsonParseError.message+". String: "+jsonTweet);
        }
      },
      (error) => this.logger.error("Stream error"+error.message),
      ()=> this.logger.log("Twitter sampling stream closed")
    );
  }

  async getSampleTweet() {
    return this.fetchClient.get('2/tweets/search/recent', {
      query: 'from:twitterdev',
    });
  }


}
