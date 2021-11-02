import { HttpClient } from "../http/http-client";
import { TopicsRule } from "./TopicsRule";
import { tweetFactory } from "../twitter/entities/factories/tweet.factory";
import { TopicsAssertionsPipe } from "./TopicsAssertionsPipe";
import { AxiosInstance } from "axios";

const response =

describe("TopicsRule", () => {


  it("Should get topics from service", async () => {
    const rule = new TopicsRule("http://127.0.0.1:9100/");
    // @ts-ignore
    rule.topicsPipe.axios = {
      post: (p, data, config) => {return Promise.resolve(
        { data: { annotations: [{ name: "crypto", predictions: [true], uncertainties: [0] }] }})
      }
    } as AxiosInstance;
    const tweet = tweetFactory();
    const processedTweet = await rule.transform(tweet);
    expect(processedTweet.meta.annotations[0].name).toEqual("crypto");
    expect(processedTweet.meta.annotations[0].value).toEqual(true);
  })

  it("Should throw if no topics detected", async () => {
    const rule = new TopicsRule("http://127.0.0.1:9000/");
    // @ts-ignore
    rule.topicsPipe.axios = {
      post: (p, data, config) => {return Promise.resolve(
        {
        data:{
          annotations:[{ name: "crypto", predictions: [false], uncertainties: [0] }]
        }
      }
        )}
    } as AxiosInstance;
    expect.assertions(1)
    const tweet = tweetFactory();
    try {
      const processedTweet = await rule.transform(tweet);
    } catch (error) {
      expect(error.critical).toBe(true);
    }
  })
})

describe("TopicsAssertion", () => {
  it("Should throw if topics is undefined", async () => {
    const tweet = tweetFactory();
    try {
      const processedTweet = await TopicsAssertionsPipe.assertRelevantTopic(tweet);
    } catch (error) {
      expect(error.critical).toBe(true);
    }
  })
})
