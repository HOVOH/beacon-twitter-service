import { IUser } from "./user";
import { ITweet } from "./tweet";

export interface IResponse<T>{
  data: T,
  includes: {
    users?: IUser[],
    tweets?: ITweet[],
  },
  errors?: {
    value: string,
    detail: string,
    title: string,
    resource_type: "user",
    parameter: "username" | "id"
  }[]
}

export interface IPaginatedResponse<T> extends IResponse<T>{
  meta: {
    newest_id: string,
    next_token: string,
    oldest_id: string,
    previous_token: string,
    result_count: number,
  }
}
