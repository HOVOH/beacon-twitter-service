import { Column, CreateDateColumn, Entity, ObjectID, ObjectIdColumn, UpdateDateColumn } from "typeorm";
import { TimeSeries } from "../../utils/timeseries.entity";
import { Tweet } from "./tweet.entity";
import { IUser, IUserPublicMetrics } from "../api/user";
import { IUpdatable } from "../../utils/comparables";
import { Exclude, Expose } from "class-transformer";
import { ApplicationError } from "@hovoh/nestjs-application-error";
import { ID_ARE_NOT_EQUAL } from "../errors.code";
import { HasTags } from "../../utils/HasTags";

type TweetOrTweetId = Tweet|{tweetId: string};

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
    return o0.followingCount - o1.followerCount ||
      o0.tweetCount - o1.tweetCount ||
      o0.followingCount - o1.followingCount;
  }

  static equal(m0: UserPublicMetrics, m1: UserPublicMetrics): boolean {
    return UserPublicMetrics.compare(m0, m1) == 0;
  }

}

@Entity()
export class TwitterUser extends HasTags implements IUpdatable<TwitterUser>{

  @ObjectIdColumn()
  @Exclude()
  id: ObjectID;

  @Column()
  userId: string;

  @Column()
  score: number;

  @Column()
  forceMonitor: boolean;

  @Column()
  verified: boolean;

  @Column()
  protected: boolean;

  @Column()
  username: string

  @Column(type => TimeSeries)
  private _nameHistory: TimeSeries<string>

  @Column(type => TimeSeries)
  private _descriptionHistory: TimeSeries<string>

  @Column()
  createdAt:Date

  @Column(type => TimeSeries)
  private _pinnedTweet?: TimeSeries<TweetOrTweetId>

  @CreateDateColumn() public foundAt: Date;
  @UpdateDateColumn() public updatedAt: Date;

  @Column(type => TimeSeries)
  private _metricsHistory: TimeSeries<UserPublicMetrics>;

  constructor() {
    super();
    this._nameHistory = new TimeSeries<string>();
    this._descriptionHistory = new TimeSeries<string>();
    this._pinnedTweet = new TimeSeries<Tweet | {tweetId: string}>();
    this._metricsHistory = new TimeSeries<UserPublicMetrics>();
  }

  @Expose()
  get name():string{
    return this._nameHistory.last().rightOrDefault(null);
  }

  @Expose()
  get description():string{
    return this._descriptionHistory.last().rightOrDefault(null);
  }

  @Expose()
  get pinnedTweet(){
    return this._pinnedTweet.last().rightOrDefault(null);
  }

  @Expose()
  get publicMetrics(){
    return this._metricsHistory.last().rightOrDefault(null);
  }

  updateName(name: string){
    this._nameHistory.add(new Date(), name);
  }

  updateDescription(description: string){
    this._descriptionHistory.add(new Date(), description);
  }

  updatePinnedTweet(tweet: TweetOrTweetId){
    this._pinnedTweet.add(new Date(), tweet);
  }

  updatePublicMetrics(metrics: UserPublicMetrics){
    this._metricsHistory.add(new Date(), metrics);
  }

  static fromIUser(user: IUser): TwitterUser{
    const twitterUser = new TwitterUser();
    twitterUser._nameHistory.add(new Date(), user.name);
    twitterUser.userId = user.id;
    twitterUser.username = user.username;
    twitterUser.verified = user.verified;
    twitterUser.protected = user.protected;
    twitterUser.updatePinnedTweet( { tweetId: user.pinned_tweet_id });
    twitterUser.updatePublicMetrics(UserPublicMetrics.fromIUserPublicMetrics(user.public_metrics))
    twitterUser.updateDescription(user.description);
    return twitterUser;
  }

  mergeChange(newVersion: TwitterUser): void {
    if (this.userId !== newVersion.userId){
      throw new ApplicationError(ID_ARE_NOT_EQUAL);
    }
    if (this.description !== newVersion.description){
      this.updateDescription(newVersion.description)
    }
    if (this.name !== newVersion.name){
      this.updateName(newVersion.name);
    }
    if (this.pinnedTweet.tweetId !== newVersion.pinnedTweet.tweetId){
      this.updatePinnedTweet(newVersion.pinnedTweet);
    }
    if (!UserPublicMetrics.equal(this.publicMetrics, newVersion.publicMetrics)){
      this.updatePublicMetrics(newVersion.publicMetrics);
    }
    this.addTags(...newVersion.tags);
  }

  needsUpdate(comparedTo: TwitterUser): boolean {
    return this.description !== comparedTo.description ||
      this.name !== comparedTo.name ||
      this.pinnedTweet !== comparedTo.pinnedTweet ||
      !UserPublicMetrics.equal(this.publicMetrics, comparedTo.publicMetrics);
  }

}
