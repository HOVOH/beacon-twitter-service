import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Tweet } from "./entities/tweet.entity";
import { MongoRepository } from "typeorm";
import { keySetFilter, KeysetPage, MongoQueryBuilder } from "@hovoh/nestjs-api-lib";
import {ObjectId} from 'mongodb';
import { TwitterUser } from "./entities/twitter-user.entity";
import { TwitterApi } from "./api/twitter-api.service";
import { DateTime } from "luxon";
import { isObjectEmpty } from "../utils/utils";
import { ApplicationError } from "@hovoh/nestjs-application-error";

export interface TweetQuery{
  minScore?: number,
  withTags?: string[],
  ids?: string[],
  hasTopics?: string[],
  noTopicsLabelled?: boolean,
  isLabelled?: boolean,
  authorId?: string,
}

const CREATED_AT_FIELD = "createdAt";
const ID_FIELD = "_id"

const orderableMembers = [
  CREATED_AT_FIELD,
  ID_FIELD
] as const;

export type TweetsOrderBy = typeof orderableMembers[number];

@Injectable()
export class TweetsService {

  constructor(@InjectRepository(Tweet)
              public tweetsRepository: MongoRepository<Tweet>,
              private twitterApi: TwitterApi) {
  }

  async save(tweet: Tweet): Promise<Tweet>{
    return this.tweetsRepository.save(tweet);
  }

  async saveMany(tweets: Tweet[]): Promise<Tweet[]>{
    return this.tweetsRepository.save(tweets);
  }

  async query(filter: TweetQuery, page?: KeysetPage<TweetsOrderBy>){
    const builder = new MongoQueryBuilder()
    builder.addIf(filter.minScore, () => ({
      where: {
        "meta.score":{ $gt: filter.minScore}
      }
    })).addIf(filter.withTags && filter.withTags.length > 0, () => ({
      where: {
        "meta._tags": {$in: filter.withTags}
      }
    })).addIf(filter.ids, () => ({
      where: {
        "tweetId": {$in: filter.ids}
      }
    })).addIf(filter.noTopicsLabelled, () => ({
      where: {
        "meta._topics": {$exists: false}
      }
    })).addIf(filter.isLabelled, () => (
      {
        where: {
          "meta._topics": { $exists: true }
        }
      }
    )).addIf(filter.authorId, ()=>(
      {
        where: {
          authorId: filter.authorId
        }
      }
    )).addIf(page, () => this.pageToQuery(page))
    return this.tweetsRepository.find(builder.query)
  }

  pageToQuery(page: KeysetPage<string>){
    return keySetFilter(page, (field, value) =>{
      if (!value) return null;
      if (field === CREATED_AT_FIELD){
        return new Date(value)
      } if (field === ID_FIELD){
        return new ObjectId(value)
      }
      return value;
    })
  }

  async findByTweetId(tweetId: string): Promise<Tweet> {
    return this.tweetsRepository.findOne({tweetId});
  }

  async fetchLatestTweet(user: TwitterUser){
    const lastTweets = await this.query({
      authorId: user.userId
    }, {
      orderBy: CREATED_AT_FIELD,
      size: 1,
      order: "DES"
    });
    if (lastTweets.length > 0){
      return this.twitterApi.getUsersTweetsHistory(
        user.userId, {
          since_id: lastTweets[0].tweetId
        })
    } else {
      console.log("No latest tweet for authorId", user.userId);
      return this.twitterApi.getUsersTweetsHistory(user.userId);
    }
  }

  async purgeUselessTweets() {
    return await this.delete({
       foundBefore: DateTime.now().minus({day: 7}).toJSDate()
    })
  }

  async delete(query: {
    authorsTids?: string[],
    includeTagged?: boolean,
    includeLabelled?: true,
    foundBefore?: Date
  }){
    const queryBuilder= new MongoQueryBuilder();
    queryBuilder.addIf(Array.isArray(query.authorsTids) && query.authorsTids.length > 0, ()=>({
      authorId: {$in: query.authorsTids}
    })).addIf(!query.includeTagged, () => ({
      "meta._tags.0": {$exists: false}
    })).addIf(!query.includeLabelled, () => ({
      "meta._topics": {$exists: false}
    })).addIf(Boolean(query.foundBefore), ()=> ({
      foundAt: { $lt: query.foundBefore },
    }))
    if (isObjectEmpty(queryBuilder.query)){
      throw new ApplicationError("query_too_broad");
    }
    return this.tweetsRepository.deleteMany(queryBuilder.query);
  }

  getDisctinctAuthorTids(): Promise<string[]>{
    return this.tweetsRepository.distinct("authorId", {});
  }
}
