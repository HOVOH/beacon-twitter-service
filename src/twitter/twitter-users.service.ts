import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { InjectRepository } from "@nestjs/typeorm";
import { TwitterUser } from "./entities/twitter-user.entity";
import { ObjectID, Repository } from "typeorm";
import { isObjectEmpty } from "../utils/utils";
import { TwitterApi } from "./api/twitter-api.service";
import { Tweet } from "./entities/tweet.entity";
import { BatchPipeline, ProcessingPipe } from "@hovoh/ts-data-pipeline";
import { ITweet } from "./api/tweet";
import { RawTweetPipe } from "../pipeline/RawTweetPipe";
import { LanguageRule } from "../pipeline/LanguageRule";
import { IUser } from "./api/user";
import { RawTwitterUserPipe } from "../pipeline/RawTwitterUserPipe";
import { SaveTweetPipe } from "../pipeline/SaveTweetPipe";
import { SaveTwitterUserPipe } from "../pipeline/SaveTwitterUserPipe";
import { TopicsService } from "./topics.service";
import { TagTwitterUserPipe } from "../pipeline/TagTwitterUserPipe";
import { TagTweetPipe } from "../pipeline/TagTweetPipe";

export interface IUserUniqueKeys {
  userId: string,
  id: ObjectID,
  username: string,
}

@Injectable()
export class TwitterUsersService{

  lookUpPipeline: () => BatchPipeline<IUser, TwitterUser>
  twitterUsersImportPipelineFactory: () => BatchPipeline<IUser, TwitterUser>
  tweetsImportPipelineFactory: () => BatchPipeline<ITweet, Tweet>

  constructor(private eventEmitter: EventEmitter2,
              @InjectRepository(TwitterUser)
              private twitterUsersRepository: Repository<TwitterUser>,
              private twitterApi: TwitterApi,
              private saveTweetPipe: SaveTweetPipe,
              @Inject(forwardRef(() => SaveTwitterUserPipe))
              private saveTwitterUserPipe: SaveTwitterUserPipe,
              topicsRule: TopicsService
  ) {

    this.lookUpPipeline = () => (new BatchPipeline<IUser, TwitterUser>([
      new RawTwitterUserPipe(),
      saveTwitterUserPipe
    ]))
    this.tweetsImportPipelineFactory = () => (new BatchPipeline<ITweet, Tweet>([
      new RawTweetPipe(),
      new ProcessingPipe<Tweet>(0,[
        new LanguageRule(),
        //topicsRule
      ]),
      new TagTweetPipe(["imported"]),
      saveTweetPipe
    ]))

    this.twitterUsersImportPipelineFactory = () => (new BatchPipeline<IUser, TwitterUser>([
      new RawTwitterUserPipe(),
      new TagTwitterUserPipe(["imported"]),
      saveTwitterUserPipe,
    ]))
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
    return this.lookUpPipeline()
      .process(await this.twitterApi.getUsers(usernames))
  }

  async importUsers(usernames: string, tags: string[] = []){
    const iUsers = await this.twitterApi.getUsers(usernames);
    const users = await this.twitterUsersImportPipelineFactory().process(iUsers);

    const iTweets = await Promise.all(users.map( user => this.twitterApi.getUsersTweetsHistory(user.userId)));
    await this.tweetsImportPipelineFactory().process(iTweets.flatMap(iTweets => iTweets));
    // iTweets.flatMap(iTweets => iTweets)
    //   .map(Tweet.fromITweet)
    //   .map(tweet => {
    //     tweet.meta.addTags(IMPORTED_TAG);
    //     return tweet;
    //   })
    //   //.map(tweet => this.tweetPipeline.process(tweet));
    return users;
  }

}
