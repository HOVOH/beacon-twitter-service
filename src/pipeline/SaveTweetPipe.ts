import { Injectable } from "@nestjs/common";
import { Tweet } from "../twitter/entities/tweet.entity";
import { IntervalPipe } from "@hovoh/ts-data-pipeline";
import { InjectRepository } from "@nestjs/typeorm";
import { MongoRepository } from "typeorm";
@Injectable()
export class SaveTweetPipe extends IntervalPipe<Tweet, Tweet>{
  constructor(@InjectRepository(Tweet)
              private tweetsRepo: MongoRepository<Tweet>) {
    super(1000);
  }

  async run(queued: Tweet[]): Promise<Tweet[]> {
    return this.tweetsRepo.save(queued);
  }
}
