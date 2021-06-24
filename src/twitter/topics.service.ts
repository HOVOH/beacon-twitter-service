import { Injectable } from "@nestjs/common";
import { TopicsRule } from "../pipeline/TopicsRule";
import { EnvironmentService } from "@hovoh/nestjs-environment-module";
import { IEnv } from "../app.module";

@Injectable()
export class TopicsService extends TopicsRule{
  constructor({env}: EnvironmentService<IEnv>) {
    super(env.TWEET_ANALYSIS_URL);
  }
}
