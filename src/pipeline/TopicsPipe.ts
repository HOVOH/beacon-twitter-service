import { CriticalDataError, TransformerPipe } from "@hovoh/ts-data-pipeline";
import { Tweet } from "../twitter/entities/tweet.entity";
import { HttpClient } from "../http/http-client";
import { Annotation } from "../twitter/entities/tweet-meta.entity";
import axios, { AxiosInstance } from "axios";

export class TopicsPipe extends TransformerPipe<Tweet, Tweet> {
  tweetAnalysisClient: HttpClient;
  private axios: AxiosInstance;
  constructor(url: string) {
    super();
    this.axios = axios.create({
      baseURL: url,
    })
  }

  async transform(tweet: Tweet): Promise<Tweet>{
    return this.evalTopics(tweet);
  }

  async evalTopics(tweet:Tweet):Promise<Tweet>{
    try {
      const response = await this.axios.post(
        "predict",
        { tasks:[{ text: tweet.text }]},
        {params: {uncertainty: true}}
        );
      const annotations: Annotation<boolean>[] = []
      const predictions: {name: string, predictions: boolean[], uncertainties: number[]}[] = response.data.annotations;
      for(const prediction of predictions){
        const annotation = new Annotation<boolean>();
        annotation.name = prediction.name;
        annotation.value = prediction.predictions[0];
        annotation.uncertainty = prediction.uncertainties[0];
        annotations.push(annotation)
      }
      tweet.meta.annotations = annotations;
    } catch (error){
      throw new CriticalDataError("Could'nt reach tweet analysis service", error);
    }
    return tweet;
  }
}
