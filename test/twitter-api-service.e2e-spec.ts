import { TwitterApi } from "../src/twitter/api/twitter-api.service";
import { IEnv } from "../src/app.module";
import { EnvironmentService } from "@hovoh/nestjs-environment-module";

describe("TwitterAPI Service", () => {
  it("Should not fail", async () => {
    const twitterApi = new TwitterApi(new EnvironmentService<IEnv>());
    const following = await twitterApi.getFollowings("2244994945");
    console.log(following);
  })
})
