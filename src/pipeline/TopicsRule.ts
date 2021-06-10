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
        if (Object.keys(tweet.meta.topicsScore).length === 0){
            throw new CriticalDataError("No relevant topics")
        }
    }
}
