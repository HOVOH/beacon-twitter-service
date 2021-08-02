import { TwitterUser } from "../entities/twitter-user.entity";
import { Tweet } from "../entities/tweet.entity";
import { USER_TWEET } from "./events";
import {Event} from "../../events/event";

export class NewTweetEvent extends Event<{tweet:Tweet, author:TwitterUser}> {
  static readonly NAME = USER_TWEET;

  constructor(tweet: Tweet, author: TwitterUser) {
    super(NewTweetEvent.NAME, {tweet, author});
  }
}
