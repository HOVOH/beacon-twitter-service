import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { LangCode } from "../labeling/language-detection-results.entity";
import { TwitterUser } from "./entities/twitter-user.entity";
import { TwitterUsers } from "./twitter-users.service";

@Injectable()
export class TwitterUserPipeline {

  supportedLanguages: LangCode[] = ["en", "fr", "es"];

  constructor(
    @Inject(forwardRef(() => TwitterUsers))
    private twitterUsers: TwitterUsers) {
  }

  async process(user: TwitterUser) {
    user = await this.twitterUsers.upsert(user);
    return user;
  }

}
