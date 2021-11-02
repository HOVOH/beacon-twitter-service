import { Injectable } from "@nestjs/common";
import { InjectMetric } from "@willsoto/nestjs-prometheus";
import { TWEET_SAMPLE_ACCEPTED_COUNTER, TWEET_SAMPLE_PROCESSED_COUNTER } from "./metricNames";
import { Counter } from "prom-client";
import { PipelineFactory } from "@hovoh/ts-data-pipeline";
import { Tweet } from "../twitter/entities/tweet.entity";

@Injectable()
export class MetricsService {
  constructor(
    @InjectMetric(TWEET_SAMPLE_PROCESSED_COUNTER)
    private tweetSampleCounter: Counter<string>,
    @InjectMetric(TWEET_SAMPLE_ACCEPTED_COUNTER)
    private acceptedTweetSampleCounter:Counter<string>
    ) {
  }

  hookTweetSamplePipeline(pipeline: PipelineFactory<any, Tweet>){
    pipeline.beforeProcess(
      (elements) => this.incTweetSample(elements.length)
    );
    pipeline.afterProcess(
      (hr, outs) => this.incAcceptedTweetSample(outs?.length??0)
    );
  }

  incTweetSample(nTweets = 1) {
    this.tweetSampleCounter.inc(nTweets);
  }

  incAcceptedTweetSample(nTweets = 1) {
    this.acceptedTweetSampleCounter.inc(nTweets);
  }

}
