import { TransformerPipe } from "@hovoh/ts-data-pipeline";
import { ITweetSample } from "../twitter/api/tweet-sample";
import { IUser } from "../twitter/api/user";

export class GetAuthorPipe extends TransformerPipe<ITweetSample, IUser> {
  async transform(sample: ITweetSample): Promise<IUser> {
    return sample.includes.users.find(u => u.id === sample.data.author_id);
  }
}
