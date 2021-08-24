import { CriticalDataError, TransformerPipe } from "@hovoh/ts-data-pipeline";
import { Tweet } from "../twitter/entities/tweet.entity";
import { plainToClass } from "class-transformer";
import { LangCode, LanguageDetectionResults } from "../labeling/language-detection-results.entity";
import cld from "cld";

const supportedLanguages: LangCode[] = ["en", "fr", "es"];

export class LanguageRule extends TransformerPipe<Tweet, Tweet>  {

  async transform(tweet:Tweet): Promise<Tweet>{
    try{
      const detectionResult = await cld.detect(tweet.text);
      tweet.meta.lang = plainToClass(LanguageDetectionResults, detectionResult);
    } catch (languageIdFailure){
      throw new CriticalDataError(languageIdFailure.message, tweet.text);
    }
    this.assertSupportedLang(tweet);
    return tweet;
  }

  assertSupportedLang(tweet: Tweet)
  {
    if (!tweet.meta.lang.reliable || !tweet.meta.lang.isOneOf(supportedLanguages)) {
      throw new CriticalDataError("Language not supported", tweet.meta.lang);
    }
  }
}
