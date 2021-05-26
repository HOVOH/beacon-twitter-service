import { Injectable, Logger } from "@nestjs/common";
import { Tweet } from "./entities/tweet.entity";
import cld from "cld";
import { plainToClass } from 'class-transformer';
import { LanguageDetectionResults, LangCode } from "../labeling/language-detection-results.entity";
import { TweetsService } from "./tweets.service";

@Injectable()
export class TweetPipeline {

  supportedLanguages: LangCode[] = ["en", "fr", "es"];

  private readonly logger = new Logger(TweetPipeline.name);

  constructor(private tweetsService: TweetsService) {
  }

  async process(tweet: Tweet): Promise<Tweet>{
    try {
      tweet = await this.detectLanguage(tweet)
      this.assertSupportedLang(tweet);
      return await this.tweetsService.save(tweet);
    } catch (e){
      this.logger.log(e.message)
    }
  }

  async detectLanguage(tweet: Tweet): Promise<Tweet>{
    const detectionResult = await cld.detect(tweet.text);
    tweet.meta.lang = plainToClass(LanguageDetectionResults, detectionResult);
    return tweet;
  }

  assertSupportedLang(tweet: Tweet){
    if (!tweet.meta.lang.reliable || !tweet.meta.lang.isOneOf(this.supportedLanguages)){
      throw new Error("Language not supported");
    }
    return tweet;
  }

}
