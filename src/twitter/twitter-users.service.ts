import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { InjectRepository } from "@nestjs/typeorm";
import { TwitterUser } from "./entities/twitter-user.entity";
import { ObjectID, Repository } from "typeorm";
import { isObjectEmpty } from "../utils/utils";
import { TwitterApi } from "./api/twitter-api.service";
import { TwitterUserPipeline } from "./user-pipeline.service";
import { Tweet } from "./entities/tweet.entity";
import { TweetPipeline } from "./tweet-pipeline.service";
import { IMPORTED_TAG } from "./entities/tags";

export interface IUserUniqueKeys {
  userId: string,
  id: ObjectID,
  username: string,
}

@Injectable()
export class TwitterUsers{

  constructor(private eventEmitter: EventEmitter2,
              @InjectRepository(TwitterUser)
              private twitterUsersRepository: Repository<TwitterUser>,
              private twitterApi: TwitterApi,
              @Inject(forwardRef(() => TwitterUserPipeline))
              private userPipeline: TwitterUserPipeline,
              private tweetPipeline: TweetPipeline,
  ) {
  }

  async mergeWithRecords(user: TwitterUser): Promise<TwitterUser>{
    const foundUser = await this.findOne({userId: user.userId});
    if (foundUser){
      foundUser.mergeChange(user);
      return foundUser;
    }
    return user;
  }

  findOne(user: Partial<TwitterUser>){
    if (isObjectEmpty(user)) return null;
    return this.twitterUsersRepository.findOne(user);
  }

  save(user: TwitterUser){
    if (isObjectEmpty(user)) return null;
    return this.twitterUsersRepository.save(user);
  }

  async upsert(latest: TwitterUser): Promise<TwitterUser>{
    if (isObjectEmpty(latest)) return null;
    const user = await this.mergeWithRecords(latest);
    return this.save(user);
  }

  async update(keys: Partial<IUserUniqueKeys>, data: Partial<TwitterUser>){
    if (isObjectEmpty(data)) return null;
    return this.twitterUsersRepository.update(keys, data);
  }

  async addTags(keys: Partial<IUserUniqueKeys>, tags: string[]){
    const user = await this.findOne(keys);
    user.addTags(...tags)
    return this.save(user);
  }

  async removeTags(keys: Partial<IUserUniqueKeys>, tags: string[]){
    const user = await this.findOne(keys);
    user.removeTags(...tags);
    return this.save(user);
  }

  async lookupUsers(usernames: string){
    return Promise.all(
      (await this.twitterApi.getUsers(usernames))
        .map(TwitterUser.fromIUser)
        .map(user=> this.userPipeline.process(user)))
  }

  async importUsers(usernames: string){
    const iUsers = await this.twitterApi.getUsers(usernames);
    const users = await Promise.all(
      iUsers
      .map(TwitterUser.fromIUser)
      .map(twitterUser => {
        twitterUser.addTags(IMPORTED_TAG);
        return twitterUser;
      })
      .map(user=> this.userPipeline.process(user)));

    const iTweets = await Promise.all(users.map( user => this.twitterApi.getUsersTweetsHistory(user.userId)));
    iTweets.flatMap(iTweets => iTweets)
      .map(Tweet.fromITweet)
      .map(tweet => {
        tweet.meta.addTags(IMPORTED_TAG);
        return tweet;
      })
      .map(tweet => this.tweetPipeline.process(tweet));
    return users;
  }

}
