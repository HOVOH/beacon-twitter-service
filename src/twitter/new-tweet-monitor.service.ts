import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import EventEmitter from "events";
import { TwitterUsersService } from "./twitter-users.service";
import { TwitterUser } from "./entities/twitter-user.entity";
import { IMPORTED_TAG } from "./tags";
import { TweetsService } from "./tweets.service";
import { BatchPipeline, JsonParserPipe, MapPipe, ProcessingPipe } from "@hovoh/ts-data-pipeline";
import { ITweetSample } from "./api/tweet-sample";
import { ITweet } from "./api/tweet";
import { Tweet } from "./entities/tweet.entity";
import { RawTweetPipe } from "../pipeline/RawTweetPipe";
import { LanguageRule } from "../pipeline/LanguageRule";
import { TopicsRule } from "../pipeline/TopicsRule";
import { SaveTweetPipe } from "../pipeline/SaveTweetPipe";
import { EnvironmentService } from "@hovoh/nestjs-environment-module";
import { IEnv } from "../app.module";
import { EventService } from "../events/event.service";
import { NewTweetEvent } from "./events/new-tweet.event";

const NEXT_EVENT = "next";

@Injectable()
export class NewTweetMonitor implements OnModuleInit{
  static readonly NAME = "NewTweetMonitor";
  private events: EventEmitter;
  private queue: TwitterUser[];
  private readonly tweetAnalysisUrl:string;
  private logger = new Logger(NewTweetMonitor.NAME);
  private started = false;

  constructor(private usersService: TwitterUsersService,
              private tweetsService: TweetsService,
              private eventService: EventService,
              {env}:EnvironmentService<IEnv>) {
    this.events = new EventEmitter();
    this.events.on(NEXT_EVENT, () => this.exec());
    this.tweetAnalysisUrl = env.TWEET_ANALYSIS_URL;
  }

  async onModuleInit() {
    this.queue = await this.usersService.query({withTags: [IMPORTED_TAG]});
  }

  start(){
    this.started = true;
    this.events.emit(NEXT_EVENT);
  }

  tweetsPipelineFactory() {
    return new BatchPipeline<ITweet, Tweet>([
      new RawTweetPipe(),
      new ProcessingPipe<Tweet>(1,[
        new LanguageRule(),
        new TopicsRule(this.tweetAnalysisUrl)
      ]),
      new SaveTweetPipe(this.tweetsService)
    ])
  }

  async exec() {
    try {
      const user = this.queue.shift();
      const newTweets = await this.tweetsService.fetchLatestTweet(user);
      const tweets = await this.tweetsPipelineFactory().process(newTweets);
      tweets.forEach(tweet => this.eventService.emit(new NewTweetEvent(tweet, user)));
    } catch (error){
      if (!error.healthThresholdNotReached){
        this.logger.error(error.message);
        console.log(error.stack)
      }
    }
    this.events.emit(NEXT_EVENT);
  }

}
