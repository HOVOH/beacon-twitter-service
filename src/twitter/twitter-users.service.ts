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
import { TagTwitterUserPipe } from "../pipeline/TagTwitterUserPipe";
import { TagTweetPipe } from "../pipeline/TagTweetPipe";
import { IMPORTED_TAG } from "./tags";
import { keySetFilter, KeysetPage, MongoQueryBuilder } from "@hovoh/nestjs-api-lib";
import { ObjectId } from "mongodb";

const ID_FIELD = "id";

export interface TwitterUserUniqueKeys {
  userId: string,
  id: ObjectID,
  username: string,
}

export interface UserQuery {
  withTags?: string[]
}

@Injectable()
export class TwitterUsersService{

  constructor(@InjectRepository(TwitterUser)
              private twitterUsersRepo: Repository<TwitterUser>,
              private twitterApi: TwitterApi,
              private saveTweetPipe: SaveTweetPipe,
              @Inject(forwardRef(() => SaveTwitterUserPipe))
              private saveTwitterUserPipe: SaveTwitterUserPipe
  ) {

  }

  lookUpPipeline() {
    return new BatchPipeline<IUser, TwitterUser>([
      new RawTwitterUserPipe(),
      this.saveTwitterUserPipe
    ]);
  }

  tweetsImportPipelineFactory () {
    return new BatchPipeline<ITweet, Tweet>([
      new RawTweetPipe(),
      new ProcessingPipe<Tweet>(0, [
        new LanguageRule()
        //topicsRule
      ]),
      new TagTweetPipe([IMPORTED_TAG]),
      this.saveTweetPipe
    ]);

  }

  twitterUsersImportPipelineFactory () {
    return new BatchPipeline<IUser, TwitterUser>([
      new RawTwitterUserPipe(),
      new TagTwitterUserPipe([IMPORTED_TAG]),
      this.saveTwitterUserPipe,
    ])
  }

  findOne(user: Partial<TwitterUser>){
    if (isObjectEmpty(user)) return null;
    return this.twitterUsersRepo.findOne(user);
  }

  save(user: TwitterUser){
    if (isObjectEmpty(user)) return null;
    return this.twitterUsersRepo.save(user);
  }

  async upsert(latest: TwitterUser): Promise<TwitterUser>{
    if (isObjectEmpty(latest)) return null;
    const user = await this.mergeWithRecords(latest);
    return this.save(user);
  }

  async mergeWithRecords(user: TwitterUser): Promise<TwitterUser>{
    const foundUser = await this.findOne({userId: user.userId});
    if (foundUser){
      foundUser.mergeChange(user);
      return foundUser;
    }
    return user;
  }

  async update(keys: Partial<TwitterUserUniqueKeys>, data: Partial<TwitterUser>){
    if (isObjectEmpty(data)) return null;
    return this.twitterUsersRepo.update(keys, data);
  }

  async addTags(keys: Partial<TwitterUserUniqueKeys>, tags: string[]){
    const user = await this.findOne(keys);
    user.addTags(...tags)
    return this.save(user);
  }

  async removeTags(keys: Partial<TwitterUserUniqueKeys>, tags: string[]){
    const user = await this.findOne(keys);
    user.removeTags(...tags);
    return this.save(user);
  }

  async lookupUsers(usernames: string){
    return this.lookUpPipeline()
      .process(await this.twitterApi.getUsers(usernames))
  }

  async importUsers(usernames: string){
    const iUsers = await this.twitterApi.getUsers(usernames);
    const users = await this.twitterUsersImportPipelineFactory().process(iUsers);
    const iTweets = await Promise.all(users.map( user => this.twitterApi.getUsersTweetsHistory(user.userId)));
    await this.tweetsImportPipelineFactory().process(iTweets.flatMap(iTweets => iTweets));
    return users;
  }

  async getFollowing(user: TwitterUser): Promise<TwitterUser[]>{
    const paginationScroller = this.twitterApi.getFollowings(user.userId);
    const following = await paginationScroller.get();
    return following.map(iUser => TwitterUser.fromIUser(iUser));
  }

  async query(filter: UserQuery, page?: KeysetPage<"id">){
    const builder = new MongoQueryBuilder()
    builder.addIf(filter.withTags.length > 0, () => ({
      where: {
        "_tags": {$in: filter.withTags}
      }
    })).add(this.pageToQuery(page))
    return this.twitterUsersRepo.find(builder.query)
  }

  pageToQuery(page: KeysetPage<string>){
    if (!page) return {}
    return keySetFilter(page, (field, value) =>{
      if (!value) return null;
      if (field === ID_FIELD){
        return new ObjectId(value)
      }
      return value;
    })
  }

}
