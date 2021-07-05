import { Tweet } from "../twitter/entities/tweet.entity";
import { CriticalDataError, IRule } from "@hovoh/ts-data-pipeline";
import { HttpClient } from "../http/http-client";

export class TopicsRule implements IRule<Tweet> {
    tweetAnalysisClient: HttpClient;
    constructor(url: string) {
        this.tweetAnalysisClient = new HttpClient(url)
    }

    async apply(tweet: Tweet): Promise<Tweet>{
        const response = await this.tweetAnalysisClient.post("", {}, { text: tweet.text });
        tweet.meta.topicsScore = response.score;
        this.assertRelevantTopic(tweet);
        return tweet;
    }

    assertRelevantTopic(tweet: Tweet){
        const topics = tweet.meta.topicsScore
        if (Object.keys(topics).length === 0 || !Object.keys(topics).find(key => topics[key] >= 0.1)){
            throw new CriticalDataError("No relevant topics")
        }
    }
}
