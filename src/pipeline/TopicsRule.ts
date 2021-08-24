import { Tweet } from "../twitter/entities/tweet.entity";
import { CriticalDataError, TransformerPipe } from "@hovoh/ts-data-pipeline";
import { HttpClient } from "../http/http-client";

export class TopicsRule extends TransformerPipe<Tweet, Tweet> {
    tweetAnalysisClient: HttpClient;
    constructor(url: string) {
        super();
        this.tweetAnalysisClient = new HttpClient(url)
    }

    async transform(tweet: Tweet): Promise<Tweet>{
        const response = await this.tweetAnalysisClient.post("", {}, { text: tweet.text });
        tweet.meta.topicsScore = response.score;
        this.assertRelevantTopic(tweet);
        return tweet;
    }

    assertRelevantTopic(tweet: Tweet){
        const topics = tweet.meta.topicsScore
        if (Object.keys(topics).length === 0 || !Object.keys(topics).find(key => topics[key] >= 0.03)){
            throw new CriticalDataError("No relevant topics", tweet.text);
        }
    }
}
