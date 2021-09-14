import { Test } from "@nestjs/testing";
import { EnvironmentModule } from "@hovoh/nestjs-environment-module";
import { TwitterApi } from "./twitter-api.service";
import { INestApplication } from "@nestjs/common";
import { USER_NOT_FOUND } from "../errors.code";

describe("PaginationScroller", () => {

  let api: TwitterApi;
  let app: INestApplication;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        EnvironmentModule
      ],
      providers: [
        TwitterApi
      ]
    }).compile();
    api = moduleRef.get<TwitterApi>(TwitterApi);
    app = moduleRef.createNestApplication();
    await app.init();
  });

  it("getUser() should throw not found error", async ()=> {
    return expect(api.getUser("10")).rejects.toThrow(USER_NOT_FOUND)
  })

  it("getUser() should return ITwitterUser", async () => {
    return expect(api.getUser("1380172856638779393")).toBeDefined()
  })

})
