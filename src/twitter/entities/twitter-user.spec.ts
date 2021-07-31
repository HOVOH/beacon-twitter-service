import { twitterUserFactory } from "./factories/twitter-user.factory";
import { ID_ARE_NOT_EQUAL } from "../errors.code";
import { UserPublicMetrics, userPublicMetricsFactory } from "./user-public-metrics.entity";
import { iTwitterUserFactory } from "../api/user";
import { TwitterUser } from "./twitter-user.entity";

describe("TwitterUser", () => {
  it("mergeChange() should throw ids are different", () => {
    const user0 = twitterUserFactory();
    const user1 = twitterUserFactory();
    expect(() => user0.mergeChange(user1)).toThrow(ID_ARE_NOT_EQUAL);
  })

  it("mergeChange() should append description to history", () => {
    const user0 = twitterUserFactory();
    const user1 = twitterUserFactory({userId: user0.userId});
    user0.mergeChange(user1);
    expect(user0.description).toEqual(user1.description);
    expect(user0.descriptionHistory.length).toEqual(2);
  })

  it("mergeChange() should append name to history", () => {
    const user0 = twitterUserFactory();
    const user1 = twitterUserFactory({userId: user0.userId});
    user0.mergeChange(user1);
    expect(user0.name).toEqual(user1.name);
    expect(user0.nameHistory.length).toEqual(2)
  })

  it("mergeChange() should append pinned tweet", () => {
    const user0 = twitterUserFactory();
    const user1 = twitterUserFactory({userId: user0.userId});
    user0.mergeChange(user1);
    expect(user0.pinnedTweet).toEqual(user1.pinnedTweet);
    expect(user0.pinnedTweetHistory.length).toEqual(2);
  })

  it("mergeChange() should append public metrics history", () => {
    const user0 = twitterUserFactory();
    const user1 = twitterUserFactory({userId: user0.userId});
    user0.mergeChange(user1);
    expect(UserPublicMetrics.equal(user0.publicMetrics, user1.publicMetrics)).toBe(true);
    expect(user0.publicMetricsHistory.length).toEqual(2)
  })

  it("mergeChange() should merge tags", () => {
    const user0 = twitterUserFactory();
    user0.addTags("test0");
    const user1 = twitterUserFactory({userId: user0.userId});
    user1.addTags("test1");
    user0.mergeChange(user1);
    expect(user0.tags).toEqual(["test0", "test1"]);
  })

  it("mergeChange() should not merge if it's the same", () => {
    const user0 = twitterUserFactory();
    user0.mergeChange(user0);
    expect(user0.descriptionHistory.length).toEqual(1);
    expect(user0.nameHistory.length).toEqual(1);
    expect(user0.pinnedTweetHistory.length).toEqual(1);
    expect(user0.publicMetricsHistory.length).toEqual(1);
  })

  it("mergeChange() should handle nulls", () => {
    const user0 = TwitterUser.fromIUser(iTwitterUserFactory({
      description: null,
      name: null,
      pinned_tweet_id: null,
      public_metrics: null,
    }))
    expect(user0.descriptionHistory.length).toEqual(0);
    expect(user0.nameHistory.length).toEqual(0);
    expect(user0.pinnedTweetHistory.length).toEqual(0);
    expect(user0.publicMetricsHistory.length).toEqual(0);
    user0.mergeChange(user0);
    expect(user0.descriptionHistory.length).toEqual(0);
    expect(user0.nameHistory.length).toEqual(0);
    expect(user0.pinnedTweetHistory.length).toEqual(0);
    expect(user0.publicMetricsHistory.length).toEqual(0);
  })

  it("publicMetrics() should return last in history", () => {
    const user = twitterUserFactory();
    const metrics = userPublicMetricsFactory();
    user.updatePublicMetrics(metrics);
    expect(user.publicMetrics.followerCount).toEqual(metrics.followerCount);
  })
})
