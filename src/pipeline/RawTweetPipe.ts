import { ITweet } from "../twitter/api/tweet";
import { Tweet } from "../twitter/entities/tweet.entity";
import { TransformerPipe } from "@hovoh/ts-data-pipeline";

export class RawTweetPipe extends TransformerPipe<ITweet, Tweet>{
  async transform(iTweet: ITweet): Promise<Tweet> {
      return Tweet.fromITweet(iTweet);
  }
}
