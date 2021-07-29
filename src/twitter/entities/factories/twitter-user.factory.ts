import { TwitterUser } from "../twitter-user.entity";
import { iTwitterUserFactory } from "../../api/user";

export const twitterUserFactory = (override: Partial<TwitterUser>) => {
  return Object.assign(TwitterUser.fromIUser(iTwitterUserFactory()), override);
}
