import { Column, Entity } from "typeorm";
import { IUserPublicMetrics, iUserPublicMetricsFactory } from "../api/user";

@Entity()
export class UserPublicMetrics {
  @Column()
  followerCount: number

  @Column()
  followingCount: number

  @Column()
  tweetCount: number

  @Column()
  listedCount: number;

  static fromIUserPublicMetrics(iMetrics: IUserPublicMetrics){
    const metrics = new UserPublicMetrics();
    metrics.followerCount = iMetrics.followers_count;
    metrics.followingCount = iMetrics.following_count;
    metrics.tweetCount = iMetrics.tweet_count;
    metrics.listedCount = iMetrics.listed_count;
    return metrics
  }

  static compare(o0:UserPublicMetrics,o1: UserPublicMetrics): number {
    return o1.followerCount - o0.followerCount  ||
      o1.tweetCount - o0.tweetCount  ||
      o1.followingCount - o0.followingCount;
  }

  static equal(m0: UserPublicMetrics, m1: UserPublicMetrics): boolean {
    return UserPublicMetrics.compare(m0, m1) === 0;
  }

}

export const userPublicMetricsFactory = (override?: Partial<UserPublicMetrics>)=> {
  return Object.assign(
    UserPublicMetrics.fromIUserPublicMetrics(iUserPublicMetricsFactory()),
    override
  );
}
