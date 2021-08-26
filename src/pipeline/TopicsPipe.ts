import { TransformerPipe } from "@hovoh/ts-data-pipeline";
import { Tweet } from "../twitter/entities/tweet.entity";
import { HttpClient } from "../http/http-client";

export class TopicsPipe extends TransformerPipe<Tweet, Tweet> {
  tweetAnalysisClient: HttpClient;
  constructor(url: string) {
    super();
    this.tweetAnalysisClient = new HttpClient(url)
  }

  async transform(tweet: Tweet): Promise<Tweet>{
    return this.evalTopics(tweet);
  }

  async evalTopics(tweet:Tweet):Promise<Tweet>{
    const response = await this.tweetAnalysisClient.post("", {}, { text: tweet.text });
    tweet.meta.topicsScore = response.score;
    return tweet;
  }
}