import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { LangCode } from "../labeling/language-detection-results.entity";
import { TwitterUser } from "./entities/twitter-user.entity";
import { TwitterUsersService } from "./twitter-users.service";

@Injectable()
export class TwitterUserPipeline {

  supportedLanguages: LangCode[] = ["en", "fr", "es"];

  constructor(
    @Inject(forwardRef(() => TwitterUsersService))
    private twitterUsers: TwitterUsersService) {
  }

  async process(user: TwitterUser) {
    user = await this.twitterUsers.upsert(user);
    return user;
  }

}
