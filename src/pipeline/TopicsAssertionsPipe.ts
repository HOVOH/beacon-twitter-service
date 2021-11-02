import { Tweet } from "../twitter/entities/tweet.entity";
import { CriticalDataError, TransformerPipe } from "@hovoh/ts-data-pipeline";

const TOPICS_NAME = ["crypto", "defi", "NFT"]

export class TopicsAssertionsPipe extends TransformerPipe<Tweet, Tweet> {
  constructor() {
    super();
  }

  async transform(tweet: Tweet): Promise<Tweet>{
    TopicsAssertionsPipe.assertRelevantTopic(tweet);
    return tweet;
  }

  static assertRelevantTopic(tweet: Tweet){
    const annotations = tweet.meta.annotations ?? [];
    const topics = annotations
      .filter(annotation => TOPICS_NAME.includes(annotation.name))
      .filter(topic => topic.value && topic.uncertainty < 0.05);
    if (topics.length === 0){
      throw new CriticalDataError("No relevant topics", tweet.text);
    }
  }
}
