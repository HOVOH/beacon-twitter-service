import { Module, OnModuleInit } from "@nestjs/common";
import { makeCounterProvider, PrometheusModule } from "@willsoto/nestjs-prometheus";
import { TWEET_SAMPLE_ACCEPTED_COUNTER, TWEET_SAMPLE_PROCESSED_COUNTER } from "./metricNames";
import { MetricsService } from "./MetricsService";

@Module({
  imports: [
    PrometheusModule.register({
      defaultMetrics: {
        enabled: true,
      },
    }),
  ],
  providers: [
    makeCounterProvider({
      name: TWEET_SAMPLE_PROCESSED_COUNTER,
      help: "Counts how much tweet get sampled and processed"
    }),
    makeCounterProvider({
      name: TWEET_SAMPLE_ACCEPTED_COUNTER,
      help: "Counts how much sampled tweets pass the pipeline"
    }),
    MetricsService
  ],
  exports: [MetricsService]
})
export class MetricsModule{


}
