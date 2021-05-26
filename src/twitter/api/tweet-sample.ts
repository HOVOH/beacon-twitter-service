import { IUser } from "./user";
import { ITweet } from "./tweet";

export interface ITweetSample{
  data: ITweet,
  includes?: {
    users?: IUser[]
  }
}
