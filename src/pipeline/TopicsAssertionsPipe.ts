import { Tweet } from "../twitter/entities/tweet.entity";
import { CriticalDataError, TransformerPipe } from "@hovoh/ts-data-pipeline";
import { HttpClient } from "../http/http-client";
import { TopicsPipe } from "./TopicsPipe";

export class TopicsAssertionsPipe extends TransformerPipe<Tweet, Tweet> {
  constructor() {
    super();
  }

  async transform(tweet: Tweet): Promise<Tweet>{
    TopicsAssertionsPipe.assertRelevantTopic(tweet);
    return tweet;
  }

  static assertRelevantTopic(tweet: Tweet){
    const topics = tweet.meta.topicsScore
    if (Object.keys(topics).length === 0 || !Object.keys(topics).find(key => topics[key] >= 0.03)){
      throw new CriticalDataError("No relevant topics", tweet.text);
    }
  }
}