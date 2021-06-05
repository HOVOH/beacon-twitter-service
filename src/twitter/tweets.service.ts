import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Tweet } from "./entities/tweet.entity";
import { MongoRepository } from "typeorm";
import { KeysetPage } from "@hovoh/nestjs-api-lib";
import { MongoQueryBuilder } from "../utils/mongoQueryBuilder";
import {ObjectId} from 'mongodb';

export interface TweetQuery{
  minScore?: number,
  withTags?: string[],
  ids?: string[],
  hasTopics?: string[],
  noTopicsLabelled?: boolean,
  isLabelled: boolean,
}

@Injectable()
export class TweetsService {

  constructor(@InjectRepository(Tweet) private tweetsRepository: MongoRepository<Tweet>) {
  }

  async save(tweet: Tweet): Promise<Tweet>{
    return this.tweetsRepository.save(tweet);
  }

  async query(filter: TweetQuery, page?: KeysetPage){
    const builder = new MongoQueryBuilder()
    builder.add(filter.minScore, (minScore) => ({
      where: {
        "meta.score":{ $gt: minScore}
      }
    })).add(filter.withTags, (tags) => ({
      where: {
        "meta._tags": {$in: tags}
      }
    })).add(filter.ids, (ids) => ({
      where: {
        "tweetId": {$in: ids}
      }
    })).add(filter.noTopicsLabelled, () => ({
      where: {
        $or:[
          {
            "meta._topics": {$exists: false}
          },
          {
            "meta._topics": {$size: 0}
          }
        ]
      }
    })).add(filter.isLabelled, () => (
      {
        where: {
          "meta._topics": { $exists: true }
        }
      }
    )).add(page.keyset, (token) => ({
      where:{
        "_id": {
          $gt: new ObjectId(token)
        }
      }
    })).add(page.size, (size) =>({
      take: size,
    }));
    return this.tweetsRepository.find(builder.query)
  }

  async findByTweetId(tweetId: string): Promise<Tweet> {
    return this.tweetsRepository.findOne({tweetId});
  }
}
