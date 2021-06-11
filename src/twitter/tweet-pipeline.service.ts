import { Injectable, Logger } from "@nestjs/common";
import { Tweet } from "./entities/tweet.entity";
import cld from "cld";
import { plainToClass } from "class-transformer";
import { LangCode, LanguageDetectionResults } from "../labeling/language-detection-results.entity";
import { TweetsService } from "./tweets.service";
import { HttpClient } from "../http/http-client";
import { EnvironmentService } from "@hovoh/nestjs-environment-module";
import { IEnv } from "../app.module";
//import { ExitProcess } from "../pipeline/ExitProcess";
//import { BadData } from "../pipeline/BadDataError";

@Injectable()
export class TweetPipeline {

  supportedLanguages: LangCode[] = ["en", "fr", "es"];
  tweetAnalysisClient: HttpClient;

  private readonly logger = new Logger(TweetPipeline.name);

  constructor(private tweetsService: TweetsService, {env}:EnvironmentService<IEnv>) {
    this.tweetAnalysisClient = new HttpClient(env.TWEET_ANALYSIS_URL)
  }

  async process(tweet: Tweet): Promise<Tweet>{
    try {
      tweet = await this.detectLanguage(tweet)
      this.assertSupportedLang(tweet);
      tweet = await this.getTopics(tweet);
      this.assertRelevantTopic(tweet);
      return await this.tweetsService.save(tweet);
    } catch (e){
      if (e.exitProcess){
        //throw new BadData(e.message)
      } else {
        this.logger.log(e.message);
        throw e
      }
    }
  }

  async detectLanguage(tweet: Tweet): Promise<Tweet>{
    try{
      const detectionResult = await cld.detect(tweet.text);
      tweet.meta.lang = plainToClass(LanguageDetectionResults, detectionResult);
      return tweet;
    } catch (languageIdFailure){
      //throw new ExitProcess(languageIdFailure.message);
    }
  }

  assertSupportedLang(tweet: Tweet){
    if (!tweet.meta.lang.reliable || !tweet.meta.lang.isOneOf(this.supportedLanguages)){
      //throw new ExitProcess("Language not supported");
    }
  }

  async getTopics(tweet: Tweet){
    const response = await this.tweetAnalysisClient.post("",{}, {text: tweet.text});
    tweet.meta.topicsScore = response.score;
    return tweet;
  }

  assertRelevantTopic(tweet: Tweet){
    if (Object.keys(tweet.meta.topicsScore).length === 0){
      //throw new ExitProcess("No relevant topics")
    }
  }

}
