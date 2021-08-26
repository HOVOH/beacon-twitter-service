import { HttpClient } from "../http/http-client";
import { TopicsRule } from "./TopicsRule";
import { tweetFactory } from "../twitter/entities/factories/tweet.factory";

describe("TopicsRule", () => {


  it("Should get topics from service", async () => {
    const rule = new TopicsRule("http://127.0.0.1:9000/");
    // @ts-ignore
    rule.topicsPipe.tweetAnalysisClient = {
      post: (p, q) => {return Promise.resolve({score:{test: 100}})}
    }
    const tweet = tweetFactory();
    const processedTweet = await rule.transform(tweet);
    expect(processedTweet.meta.topicsScore.test).toBe(100);
  })

  it("Should throw if no topics detected", async () => {
    const rule = new TopicsRule("http://127.0.0.1:9000/");
    // @ts-ignore
    rule.topicsPipe.tweetAnalysisClient = {
      post: (p, q) => {return Promise.resolve({score:{}})}
    }
    expect.assertions(1)
    const tweet = tweetFactory();
    try {
      const processedTweet = await rule.transform(tweet);
    } catch (error) {
      expect(error.critical).toBe(true);
    }
  })

})