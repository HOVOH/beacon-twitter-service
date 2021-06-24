import { TransformerPipe } from "@hovoh/ts-data-pipeline";
import { Tweet } from "../twitter/entities/tweet.entity";

export class TagTweetPipe extends TransformerPipe<Tweet, Tweet>{

  tags: string[] = []

  constructor(tags: string[]) {
    super();
    this.tags = tags;
  }

  transform(tweet: Tweet): Promise<Tweet> {
    tweet.meta.addTags(...this.tags);
    return Promise.resolve(tweet);
  }
}
