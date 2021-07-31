import { Column, CreateDateColumn, Entity, ObjectID, ObjectIdColumn, UpdateDateColumn } from "typeorm";
import { TimeSeries } from "../../utils/timeseries.entity";
import { Tweet } from "./tweet.entity";
import { IUser } from "../api/user";
import { IUpdatable } from "../../utils/comparables";
import { Exclude, Expose } from "class-transformer";
import { ApplicationError } from "@hovoh/nestjs-application-error";
import { ID_ARE_NOT_EQUAL } from "../errors.code";
import { HasTags } from "../../utils/HasTags";
import { UserPublicMetrics } from "./user-public-metrics.entity";

type TweetOrTweetId = Tweet|{tweetId: string};

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
  private readonly _nameHistory: TimeSeries<string>

  @Column(type => TimeSeries)
  private _descriptionHistory: TimeSeries<string>

  @Column()
  createdAt:Date

  @Column(type => TimeSeries)
  private readonly _pinnedTweet?: TimeSeries<TweetOrTweetId>

  @CreateDateColumn() public foundAt: Date;
  @UpdateDateColumn() public updatedAt: Date;

  @Column(type => TimeSeries)
  private readonly _metricsHistory: TimeSeries<UserPublicMetrics>;

  @Column()
  followingTids: string[]

  @Column(type => TimeSeries)
  _followingTidsHistory: TimeSeries<{
    add: string[],
    removed: string[]
  }>

  constructor() {
    super();
    this._nameHistory = new TimeSeries<string>();
    this._descriptionHistory = new TimeSeries<string>();
    this._pinnedTweet = new TimeSeries<Tweet | {tweetId: string}>();
    this._metricsHistory = new TimeSeries<UserPublicMetrics>();
    this._followingTidsHistory = new TimeSeries<{add: string[]; removed: string[]}>();
  }

  @Expose()
  get name():string{
    return this._nameHistory.last().rightOrDefault(null);
  }

  get nameHistory(): TimeSeries<string> {
    return this._nameHistory;
  }

  @Expose()
  get description():string{
    return this._descriptionHistory.last().rightOrDefault(null);
  }

  get descriptionHistory(): TimeSeries<string>{
    return this._nameHistory;
  }

  @Expose()
  get pinnedTweet(){
    return this._pinnedTweet.last().rightOrDefault(null);
  }

  get pinnedTweetHistory(){
    return this._pinnedTweet;
  }

  @Expose()
  get publicMetrics(){
    return this._metricsHistory.last().rightOrDefault(null);
  }

  get publicMetricsHistory(){
    return this._metricsHistory;
  }

  get followingTidsHistory(){
    if (!this._followingTidsHistory){
      this._followingTidsHistory = new TimeSeries<{add: string[]; removed: string[]}>();
    }
    return this._followingTidsHistory;
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
    if (user.name){
      twitterUser._nameHistory.add(new Date(), user.name);
    }
    twitterUser.userId = user.id;
    twitterUser.username = user.username;
    twitterUser.verified = user.verified;
    twitterUser.protected = user.protected;
    if (user.pinned_tweet_id){
      twitterUser.updatePinnedTweet( { tweetId: user.pinned_tweet_id });
    }
    if (user.public_metrics){
      twitterUser.updatePublicMetrics(UserPublicMetrics.fromIUserPublicMetrics(user.public_metrics))
    }
    if (user.description){
      twitterUser.updateDescription(user.description);
    }
    return twitterUser;
  }

  mergeChange(newVersion: TwitterUser): void {
    if (this.userId !== newVersion.userId){
      throw new ApplicationError(ID_ARE_NOT_EQUAL);
    }
    if (newVersion.description && this.description !== newVersion.description){
      this.updateDescription(newVersion.description)
    }
    if (newVersion.name && this.name !== newVersion.name){
      this.updateName(newVersion.name);
    }
    if (this.pinnedTweet?.tweetId !== newVersion.pinnedTweet?.tweetId){
      this.updatePinnedTweet(newVersion.pinnedTweet);
    }
    if ((!this.publicMetrics && newVersion.publicMetrics)||
      (newVersion.publicMetrics && !UserPublicMetrics.equal(this.publicMetrics, newVersion.publicMetrics))){
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
