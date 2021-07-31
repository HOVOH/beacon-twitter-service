import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Tweet } from "./entities/tweet.entity";
import { MongoRepository } from "typeorm";
import { keySetFilter, KeysetPage, MongoQueryBuilder } from "@hovoh/nestjs-api-lib";
import {ObjectId} from 'mongodb';

export interface TweetQuery{
  minScore?: number,
  withTags?: string[],
  ids?: string[],
  hasTopics?: string[],
  noTopicsLabelled?: boolean,
  isLabelled: boolean,
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

  constructor(@InjectRepository(Tweet) private tweetsRepository: MongoRepository<Tweet>) {
  }

  async save(tweet: Tweet): Promise<Tweet>{
    return this.tweetsRepository.save(tweet);
  }

  async saveMany(tweets: Tweet[]): Promise<Tweet[]>{
    return this.tweetsRepository.save(tweets);
  }

  async query(filter: TweetQuery, page?: KeysetPage<TweetsOrderBy>){
    const builder = new MongoQueryBuilder()
    builder.addIf(filter.minScore, (minScore) => ({
      where: {
        "meta.score":{ $gt: minScore}
      }
    })).addIf(filter.withTags && filter.withTags.length > 0, () => ({
      where: {
        "meta._tags": {$in: filter.withTags}
      }
    })).addIf(filter.ids, (ids) => ({
      where: {
        "tweetId": {$in: ids}
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
    )).add(this.pageToQuery(page))
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
}
