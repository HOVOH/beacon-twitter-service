import { Tweet } from "../twitter/entities/tweet.entity";
import { CriticalDataError, TransformerPipe } from "@hovoh/ts-data-pipeline";
import { HttpClient } from "../http/http-client";
import { TopicsPipe } from "./TopicsPipe";
import { TopicsAssertionsPipe } from "./TopicsAssertionsPipe";

export class TopicsRule extends TransformerPipe<Tweet, Tweet> {
    topicsPipe: TopicsPipe;
    topicsAssertion: TopicsAssertionsPipe;
    constructor(url: string) {
        super();
        this.topicsPipe = new TopicsPipe(url);
    }

    async transform(tweet: Tweet): Promise<Tweet>{
        tweet = await this.topicsPipe.evalTopics(tweet);
        TopicsAssertionsPipe.assertRelevantTopic(tweet);
        return tweet;
    }
}
