import { TransformerPipe } from "@hovoh/ts-data-pipeline";
import { TwitterUser } from "../twitter/entities/twitter-user.entity";
import { IUser } from "../twitter/api/user";

export class RawTwitterUserPipe extends TransformerPipe<IUser, TwitterUser>{
  async transform(iUser: IUser): Promise<TwitterUser> {
    return TwitterUser.fromIUser(iUser);
  }
}
