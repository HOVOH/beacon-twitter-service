import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { TwitterUsersService } from "./twitter-users.service";
import { TweetsService } from "./tweets.service";

@Injectable()
export class SystemPurgeService {
  static readonly NAME = "SystemPurge";
  logger = new Logger(SystemPurgeService.NAME);

  constructor(private twitterUsers: TwitterUsersService,
              private  tweetsService: TweetsService) {
  }

  @Cron('0 0 23 * * *')
  async purgeTweets(){
    await this.tweetsService.purgeUselessTweets();
    this.logger.log("Purged useless tweets")
  }

  @Cron('0 0 0 * * *')
  async purgeUsers(){
    const authors = await this.tweetsService.getDisctinctAuthorTids();
    await this.twitterUsers.delete({tids: authors});
    this.logger.log("Purged users");
  }
}
