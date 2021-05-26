import { Tweet } from "../entities/tweet.entity";
import {Event} from "../../events/event";
import { TWEET_PROCESSED } from "./events";
import { TwitterUser } from "../entities/twitter-user.entity";

export class SampleTweetEvent extends Event<{tweet: Tweet, author: TwitterUser}>{
  static NAME = TWEET_PROCESSED;

  constructor(tweet: Tweet, author: TwitterUser) {
    super(SampleTweetEvent.NAME, {tweet, author});
  }
}
