import { Module } from '@nestjs/common';
import { EnvironmentModule } from '@hovoh/nestjs-environment-module';
import { TwitterSamplingService } from './twitter-sampling.service';
import { TypeOrmModule } from "@nestjs/typeorm";
import { Tweet } from "./entities/tweet.entity";
import { TwitterUser } from "./entities/twitter-user.entity";
import { TwitterApi } from "./api/twitter-api.service";
import { TwitterUsersService } from "./twitter-users.service";
import { TwitterUsersController } from "./twitter-users.controller";
import { TweetsService } from "./tweets.service";
import { TweetsController } from "./tweets.controller";
import { SaveTwitterUserPipe } from "../pipeline/SaveTwitterUserPipe";
import { SaveTweetPipe } from "../pipeline/SaveTweetPipe";
import { TopicsService } from "./topics.service";
import { FollowingMonitorService } from "./following-monitor.service";
import { ScheduleModule } from "@nestjs/schedule";
import { NewTweetMonitor } from "./new-tweet-monitor.service";
import { SystemPurgeService } from "./system-purge.service";
import { MetricsModule } from "../metrics/MetricsModule";

@Module({
  imports: [
    EnvironmentModule,
    TypeOrmModule.forFeature([Tweet, TwitterUser]),
    ScheduleModule.forRoot(),
    MetricsModule
  ],
  controllers: [TwitterUsersController, TweetsController],
  providers: [
    TwitterSamplingService,
    TwitterApi,
    TwitterUsersService,
    TweetsService,
    SaveTwitterUserPipe,
    SaveTweetPipe,
    TopicsService,
    FollowingMonitorService,
    NewTweetMonitor,
    SystemPurgeService
  ],
  exports: [TweetsService, TwitterUsersService]
})
export class TwitterModule {}
