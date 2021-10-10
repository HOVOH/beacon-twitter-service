import { CriticalDataError, TransformerPipe } from "@hovoh/ts-data-pipeline";
import { Tweet } from "../twitter/entities/tweet.entity";
import { LangCode } from "../labeling/language-detection-results.entity";

const supportedLanguages: LangCode[] = ["en"];
const isLangSupported = (tweetLang: string) => {
  return Boolean(
    tweetLang &&
    supportedLanguages.find(lang => lang === tweetLang)
  );
}

export class LanguageRule extends TransformerPipe<Tweet, Tweet>  {

  async transform(tweet:Tweet): Promise<Tweet>{
    this.assertSupportedLang(tweet);
    return tweet;
  }

  assertSupportedLang(tweet: Tweet)
  {
    if (!isLangSupported(tweet.lang)) {
      throw new CriticalDataError(
        "Language not supported",
        { lang: tweet.lang, text: tweet.text }
        );
    }
  }
}
