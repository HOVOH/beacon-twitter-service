import { IUser } from "./user";
import { ITweet } from "./tweet";

export interface IUserLookup {
  data:[IUser],
  includes:{
    tweets: ITweet[],
  }
}
