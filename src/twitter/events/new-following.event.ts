import { Event } from "../../events/event";
import { TwitterUser } from "../entities/twitter-user.entity";
import { TWEET_PROCESSED } from "./events";

export class NewFollowingEvent extends Event<{
  twitterUser: TwitterUser,
  started: TwitterUser[],
  stopped: TwitterUser[],
}>{
  static NAME = TWEET_PROCESSED;

  constructor(twitterUser: TwitterUser, started: TwitterUser[], stopped: TwitterUser[]) {
    super(NewFollowingEvent.NAME, {twitterUser, started, stopped});
  }
}
