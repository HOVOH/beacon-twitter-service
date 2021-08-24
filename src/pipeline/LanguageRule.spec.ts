import { LanguageRule } from "./LanguageRule";
import { tweetFactory } from "../twitter/entities/factories/tweet.factory";

describe("LanguageRule", ()=>{
  let rule: LanguageRule;

  beforeEach(() => {
    rule = new LanguageRule();
  })

  it("Should add the lang field", async () => {
    const tweet = tweetFactory({text: "The four horsemen rode into the sunset"});
    const cldTweet = await rule.transform(tweet);
    expect(cldTweet.meta.lang).toBeDefined();
    expect(cldTweet.meta.lang.isOneOf(["en"])).toBeTruthy();
  })

  it("Should throw if lang not supported", async () => {
    expect.assertions(1);
    const tweet = tweetFactory({text:"Вот я и вернулся в этот мир!"});
    return rule.transform(tweet).catch(error => {
      expect(error.message).toBe("Language not supported")
    });
  })
})
