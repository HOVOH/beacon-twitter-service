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

  it("Should throw if max confidence is below 0.03", async () => {
    const rule = new TopicsRule("http://127.0.0.1:9000/");
    // @ts-ignore
    rule.topicsPipe.tweetAnalysisClient = {
      post: (p, q) => {return Promise.resolve({score:{ test: 0.02}})}
    }
    expect.assertions(1)
    const tweet = tweetFactory();
    try {
      const processedTweet = await rule.transform(tweet);
    } catch (error) {
      expect(error.critical).toBe(true);
    }
  })

  it("Should not throw if min confidence is below 0.03 and max over 0.03", async () => {
    const rule = new TopicsRule("http://127.0.0.1:9000/");
    // @ts-ignore
    rule.topicsPipe.tweetAnalysisClient = {
      post: (p, q) => {return Promise.resolve({score:{ below: 0.02, above: 0.04}})}
    }
    const tweet = tweetFactory();
    const processedTweet = await rule.transform(tweet);
    expect(processedTweet.meta.topicsScore.above).toBe(0.04);
  })

})
