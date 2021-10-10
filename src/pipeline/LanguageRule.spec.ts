import { LanguageRule } from "./LanguageRule";
import { tweetFactory } from "../twitter/entities/factories/tweet.factory";

describe("LanguageRule", ()=>{
  let rule: LanguageRule;

  beforeEach(() => {
    rule = new LanguageRule();
  })

  it("Should add the lang field", async () => {
    let tweet = tweetFactory({text: "The four horsemen rode into the sunset"});
    tweet = await rule.transform(tweet);
    expect(tweet.lang).toBeDefined();
  })

  it("Should throw if lang not supported", async () => {
    expect.assertions(1);
    const tweet = tweetFactory({text:"Вот я и вернулся в этот мир!"});
    tweet.lang = "ru"
    return rule.transform(tweet).catch(error => {
      expect(error.message).toBe("Language not supported")
    });
  })
  it("Should throw if lang undefined or null", async () => {
    expect.assertions(1);
    const tweet = tweetFactory({text:"Вот я и вернулся в этот мир!"});
    tweet.lang = null;
    return rule.transform(tweet).catch(error => {
      expect(error.message).toBe("Language not supported")
    });
  })
})
