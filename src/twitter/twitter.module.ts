import { Module } from '@nestjs/common';
import { EnvironmentModule } from '@hovoh/nestjs-environment-module';
import { TwitterSamplingService } from './twitter-sampling.service';
import { TweetPipeline } from "./tweet-pipeline.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Tweet } from "./entities/tweet.entity";
import { TwitterUser } from "./entities/twitter-user.entity";
import { TwitterUserPipeline } from "./user-pipeline.service";
import { TwitterApi } from "./api/twitter-api.service";
import { TwitterUsers } from "./twitter-users.service";
import { TwitterUsersController } from "./twitter-users.controller";
import { TweetsService } from "./tweets.service";
import { TweetsController } from "./tweets.controller";

@Module({
  imports: [EnvironmentModule, TypeOrmModule.forFeature([Tweet, TwitterUser])],
  controllers: [TwitterUsersController, TweetsController],
  providers: [
    TwitterSamplingService,
    TweetPipeline,
    TwitterUserPipeline,
    TwitterApi,
    TwitterUsers,
    TweetsService
  ],
})
export class TwitterModule {}
