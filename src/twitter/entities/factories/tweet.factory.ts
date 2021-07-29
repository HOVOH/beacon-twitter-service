import { Tweet } from "../tweet.entity";
import { iTweetFactory } from "../../api/tweet";

export const tweetFactory = (tweet?: Partial<Tweet>)=> {
  return Object.assign(Tweet.fromITweet(iTweetFactory()), tweet);
}
