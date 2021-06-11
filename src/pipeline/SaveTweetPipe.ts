import { Injectable } from "@nestjs/common";
import { Tweet } from "../twitter/entities/tweet.entity";
import { TweetsService } from "../twitter/tweets.service";
import { IntervalPipe } from "@hovoh/ts-data-pipeline";

@Injectable()
export class SaveTweetPipe extends IntervalPipe<Tweet, Tweet>{
  constructor(private tweetsService: TweetsService) {
    super(1000);
  }

  async run(queued: Tweet[]): Promise<Tweet[]> {
    return this.tweetsService.saveMany(queued);
  }
}
