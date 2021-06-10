import { Injectable } from "@nestjs/common";
import { TransformerPipe } from "@hovoh/ts-data-pipeline";
import { TwitterUser } from "../twitter/entities/twitter-user.entity";
import { TwitterUsersService } from "../twitter/twitter-users.service";

@Injectable()
export class SaveTwitterUserPipe extends TransformerPipe<TwitterUser, TwitterUser>{
  constructor(private twitterUsersService: TwitterUsersService) {
    super();
  }

  async transform(element: TwitterUser): Promise<TwitterUser> {
    return this.twitterUsersService.save(element);
  }
}
