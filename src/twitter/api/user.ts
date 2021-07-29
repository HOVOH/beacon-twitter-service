import { fieldsConcat } from "./utils";
import * as faker from 'faker';

export const USER_CREATED_AT = "created_at";
export const USER_VERIFIED = "verified";
export const USER_ENTITIES = "entities";
export const USER_PINNED_TWEET = "pinned_tweet_id";
export const USER_PROTECTED = "protected";
export const USER_PUBLIC_METRICS = "public_metrics";
export const USER_WITHHELD = "withheld";
export const USER_DESCRIPTION = "description";

export const FULL_USER_FIELDS = fieldsConcat(
  USER_CREATED_AT,
  USER_VERIFIED,
  USER_ENTITIES,
  USER_PINNED_TWEET,
  USER_PROTECTED,
  USER_PUBLIC_METRICS,
  USER_WITHHELD,
  USER_DESCRIPTION
);

export interface IUserPublicMetrics{
  followers_count: number,
  following_count: number,
  tweet_count: number,
  listed_count: number,
}

export interface IUser {
  created_at: string,
  id: string,
  username: string,
  name: string,
  verified: boolean,
  protected: boolean,
  public_metrics: IUserPublicMetrics,
  withheld: boolean,
  pinned_tweet_id?: string,
  description: string
}

export const iUserPublicMetricsFactory = (override?: Partial<IUserPublicMetrics>) => {
  return Object.assign({
    followers_count: faker.datatype.number({max: 1000}),
    following_count: faker.datatype.number({max: 1000}),
    tweet_count: faker.datatype.number({max: 1000}),
    listed_count: faker.datatype.number({max: 1000})
  }, override) as IUserPublicMetrics;
}

export const iTwitterUserFactory = (user?: Partial<IUser>) => {
  const fakeUser: IUser = {
    created_at: (new Date()).toISOString(),
    id: faker.datatype.number({max: 1000000})+"",
    username: faker.internet.userName(),
    name: faker.internet.userName(),
    verified: false,
    protected: false,
    public_metrics: iUserPublicMetricsFactory(),
    withheld: false,
    pinned_tweet_id: faker.datatype.number({max: 1000000}),
    description: faker.lorem.sentence(),
  }
  return Object.assign(fakeUser, user) as IUser;
}
