import { TransformerPipe } from "@hovoh/ts-data-pipeline";
import { TwitterUser } from "../twitter/entities/twitter-user.entity";

export class TagTwitterUserPipe extends TransformerPipe<TwitterUser, TwitterUser> {

  constructor(private tags: string[]) {
    super();
  }

  transform(twitterUser: TwitterUser): Promise<TwitterUser> {
    twitterUser.addTags(...this.tags);
    return Promise.resolve(twitterUser);
  }

}
