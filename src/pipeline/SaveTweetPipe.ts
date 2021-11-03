import { Injectable } from "@nestjs/common";
import { Tweet } from "../twitter/entities/tweet.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { MongoRepository } from "typeorm";
import { SimplePipe } from "@hovoh/ts-data-pipeline";

@Injectable()
export class SaveTweetPipe extends SimplePipe<Tweet, Tweet>{
  constructor(@InjectRepository(Tweet)
              private tweetsRepo: MongoRepository<Tweet>) {
    super();
  }

  async process(queued: Tweet[]): Promise<Tweet[]> {
    return this.tweetsRepo.save(queued)
  }
}
