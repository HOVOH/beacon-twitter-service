import { Module } from "@nestjs/common";
import { SaveTweetPipe } from "./SaveTweetPipe";
import { TwitterModule } from "../twitter/twitter.module";
import { SaveTwitterUserPipe } from "./SaveTwitterUserPipe";

@Module({
    imports: [TwitterModule],
    providers: [SaveTweetPipe, SaveTwitterUserPipe]
  }
)
export class PipelineModule{}
