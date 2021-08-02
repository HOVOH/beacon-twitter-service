import { Event } from "../../events/event";
import { TwitterUser } from "../entities/twitter-user.entity";
import { USER_FOLLOWING } from "./events";

export class NewFollowingEvent extends Event<{
  twitterUser: TwitterUser,
  started: TwitterUser[],
  stopped: TwitterUser[],
}>{
  static NAME = USER_FOLLOWING;
  constructor(twitterUser: TwitterUser, started: TwitterUser[], stopped: TwitterUser[]) {
    super(NewFollowingEvent.NAME, {twitterUser, started, stopped});
  }
}
