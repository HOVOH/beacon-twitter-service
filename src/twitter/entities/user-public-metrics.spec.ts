import { UserPublicMetrics, userPublicMetricsFactory } from "./user-public-metrics.entity";

describe("UserPublicMetrics", () => {
  it("compare() should return 0 if metrics are equal", () => {
    const metrics = userPublicMetricsFactory();
    expect(UserPublicMetrics.compare(metrics, metrics)).toEqual(0);
  })

  it("equal() should return true if metrics are equal", () => {
    const metrics = userPublicMetricsFactory();
    expect(UserPublicMetrics.equal(metrics, metrics)).toBe(true);
  })

  it("equal() should return false if not equal", () => {
    const metrics0 = userPublicMetricsFactory();
    const metrics1 = userPublicMetricsFactory({followerCount: metrics0.followerCount+1});
    expect(UserPublicMetrics.equal(metrics0, metrics1)).toBe(false);
  })

  it("compare() should return >0 if metrics1 has more follower", () => {
    const metrics0 = userPublicMetricsFactory();
    const metrics1 = userPublicMetricsFactory({followerCount: metrics0.followerCount+1});
    expect(UserPublicMetrics.compare(metrics0, metrics1)).toBeGreaterThan(0);
  })

  it("compare() should return <0 if metrics1 has less follower", () => {
    const metrics0 = userPublicMetricsFactory();
    const metrics1 = userPublicMetricsFactory({followerCount: metrics0.followerCount-1});
    expect(UserPublicMetrics.compare(metrics0, metrics1)).toBeLessThan(0);
  })

})
