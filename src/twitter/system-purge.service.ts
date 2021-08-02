import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { TwitterUsersService } from "./twitter-users.service";
import { TweetsService } from "./tweets.service";

@Injectable()
export class SystemPurgeService {

  constructor(private twitterUsers: TwitterUsersService,
              private  tweetsService: TweetsService) {
  }

  @Cron('0 0 1 * * *')
  async purgeTweets(){

  }

  @Cron('0 0 23 * * *')
  async purgeUsers(){

  }
}
