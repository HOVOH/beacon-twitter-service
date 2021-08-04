import { fieldsConcat } from "./utils";
import * as faker from 'faker';

export const TWEET_AUTHOR_ID = "author_id"
export const TWEET_CREATED_AT = "created_at"
export const TWEET_CONVERSATION_ID = "conversation_id"
export const TWEET_SOURCE = "source"
export const TWEET_ENTITIES = "entities"
export const TWEET_REFERENCED_TWEETS = "referenced_tweets"

export const  FULL_TWEET_FIELDS = fieldsConcat(
  TWEET_AUTHOR_ID,
  TWEET_CREATED_AT,
  TWEET_CONVERSATION_ID,
  TWEET_SOURCE,
  TWEET_ENTITIES,
  TWEET_REFERENCED_TWEETS
);

export interface Entities{
  hashtags: IHashtag[],
  mentions: IMention[],
  urls: IUrl[],
}

export interface IHashtag {
  start: number,
  end: number,
  tag: string,
}

export interface IMention{
  start: number,
  end: number,
  username: string,
}

export interface IUrl {
  start: number,
  end:number,
  url: string,
  expanded_url: string,
  display_url: string,
  title: string,
  description: string,
  unwound_url: string,
}

export interface ITweetReference {
  type: "replied_to"|"quoted",
  id: string,
}

export interface ITweet {
  text: string,
  id: string,
  author_id: string,
  created_at: string,
  source: string,
  entities?: Entities,
  conversation_id?: string,
  in_reply_to_user_id?: string,
  referenced_tweets?: ITweetReference[]
}

export const iTweetFactory = (iTweet?: Partial<ITweet>) => {
  const fakeTweet:ITweet = {
    text: faker.lorem.sentence(),
    id: faker.datatype.number({max: 1000000})+"",
    author_id: faker.datatype.number({max: 1000000})+"",
    created_at: (new Date).toISOString(),
    source: "factory",
}
  return Object.assign(fakeTweet, iTweet) as ITweet;
}
