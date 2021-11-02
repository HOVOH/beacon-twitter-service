import { Logger, Module, OnModuleInit } from "@nestjs/common";
import { TwitterModule } from './twitter/twitter.module';
import { DatabaseModule } from "./database.module";
import { EventModule } from "./events/event.module";
import { APP_PIPE } from "@nestjs/core";
import { ValidationPipe } from "@hovoh/nestjs-api-lib";
import { GlobalModule } from "./global.module";
import { KafkaModule } from "./kafka/kafka.module"
import { MetricsModule } from "./metrics/MetricsModule";

export interface IEnv {
  ENVIRONMENT: 'prod' | 'dev' | 'test';
  DB_TYPE: 'postgres';
  DB_USER: string;
  DB_PASSWORD: string;
  DB_HOST: string;
  DB_PORT: number;
  DB_NAME: string;
  JWT_PUBLIC_CERTIFICATE_PATH: string;
  TWITTER_API_KEY: string;
  TWITTER_SECRET_KEY: string;
  TWITTER_ACCESS_TOKEN: string;
  TWITTER_ACCESS_TOKEN_SECRET: string;
  TWITTER_BEARER_TOKEN: string;
  TWEET_ANALYSIS_URL: string;
  ENABLE_TWEET_SAMPLING: string;
  KAFKA_BROKERS: string;
  NODE_ENV;
}

@Module({
  imports: [
    TwitterModule,
    EventModule,
    DatabaseModule,
    GlobalModule,
    KafkaModule,
    MetricsModule
  ],
  controllers: [],
  providers: [{
    provide: APP_PIPE,
    useClass: ValidationPipe,
  },],
})
export class AppModule implements OnModuleInit{

  logger = new Logger("Application")

  onModuleInit(): any {
    this.logger.log("Current version: "+ process.env.COMMIT_HASH)
  }
}
