import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import EventEmitter from "events";
import { TwitterUsersService } from "./twitter-users.service";
import { TwitterUser } from "./entities/twitter-user.entity";
import { IMPORTED_TAG } from "./tags";
import { TweetsService } from "./tweets.service";
import { PipelineFactory } from "@hovoh/ts-data-pipeline";
import { ITweet } from "./api/tweet";
import { Tweet } from "./entities/tweet.entity";
import { RawTweetPipe } from "../pipeline/RawTweetPipe";
import { LanguageRule } from "../pipeline/LanguageRule";
import { SaveTweetPipe } from "../pipeline/SaveTweetPipe";
import { EnvironmentService } from "@hovoh/nestjs-environment-module";
import { IEnv } from "../app.module";
import { EventService } from "../events/event.service";
import { NewTweetEvent } from "./events/new-tweet.event";
import { ITweetSample } from "./api/tweet-sample";
import { TagTweetPipe } from "../pipeline/TagTweetPipe";
import { TopicsPipe } from "../pipeline/TopicsPipe";
import { TopicsAssertionsPipe } from "../pipeline/TopicsAssertionsPipe";

const NEXT_EVENT = "next";

@Injectable()
export class NewTweetMonitor implements OnModuleInit{
  static readonly NAME = "NewTweetMonitor";
  private events: EventEmitter;
  private queue: TwitterUser[];
  private readonly tweetAnalysisUrl:string;
  private logger = new Logger(NewTweetMonitor.NAME);
  private started = false;
  tweetsPipelineFactory: PipelineFactory<any, Tweet>

  constructor(private usersService: TwitterUsersService,
              private tweetsService: TweetsService,
              private eventService: EventService,
              {env}:EnvironmentService<IEnv>) {
    this.events = new EventEmitter();
    this.events.on(NEXT_EVENT, () => this.exec());
    this.tweetAnalysisUrl = env.TWEET_ANALYSIS_URL;
    this.tweetsPipelineFactory = new PipelineFactory<string|ITweetSample|ITweet, Tweet>(() => [
     {
        name: "cast",
        pipe: new RawTweetPipe(),
      }, {
        name: "assert_lang",
        pipe: new LanguageRule(),
      }, {
        name: "analyse_topics",
        pipe: new TopicsPipe(this.tweetAnalysisUrl),
      }, {
        name: "tag_tweets",
        pipe: new TagTweetPipe([IMPORTED_TAG])
      },{
        name: "save",
        pipe: new SaveTweetPipe(this.tweetsService.tweetsRepository)
      }
    ], 0);
  }

  async onModuleInit() {
    this.queue = await this.usersService.query({withTags: [IMPORTED_TAG]});
    this.start();
  }

  start(){
    this.logger.log("Started monitoring new tweets");
    this.started = true;
    this.events.emit(NEXT_EVENT);
  }

  async exec() {
    const user = this.queue.shift();
    try {
      const newTweets = await this.tweetsService.fetchLatestTweet(user);
      const {data: tweets} = await this.tweetsPipelineFactory.process(newTweets);
      tweets.forEach(tweet => this.eventService.emit(new NewTweetEvent(tweet, user)));
    } catch (error){
      if (error.status === 503) {
        this.logger.error("Twitter's timeline endpoint unavailable (503)");
      } else if (error.status) {
        this.logger.error(`TwitterAPI response: ${error.statusText} (${error.status})`)
      }else {
        this.logger.error(error.message);
        console.log(error);
      }
    }
    this.queue.push(user);
    this.events.emit(NEXT_EVENT);
  }

}
