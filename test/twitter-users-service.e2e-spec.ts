import { Test } from "@nestjs/testing";
import { DatabaseModule } from "../src/database.module";
import { EnvironmentModule } from "@hovoh/nestjs-environment-module";
import { getRepositoryToken, TypeOrmModule } from "@nestjs/typeorm";
import { TwitterUser } from "../src/twitter/entities/twitter-user.entity";
import { Tweet } from "../src/twitter/entities/tweet.entity";
import { TwitterUsersService } from "../src/twitter/twitter-users.service";
import { SaveTweetPipe } from "../src/pipeline/SaveTweetPipe";
import { SaveTwitterUserPipe } from "../src/pipeline/SaveTwitterUserPipe";
import { TwitterApi } from "../src/twitter/api/twitter-api.service";
import { MongoRepository } from "typeorm";
import { INestApplication } from "@nestjs/common";
import { twitterUserFactory } from "../src/twitter/entities/factories/twitter-user.factory";

describe("TwitterUsers service", () => {

  let usersService: TwitterUsersService;
  let userRepo: MongoRepository<TwitterUser>;
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        DatabaseModule,
        EnvironmentModule,
        TypeOrmModule.forFeature([TwitterUser, Tweet]),
      ],
      providers: [
        TwitterUsersService, SaveTweetPipe, TwitterApi
      ]
    }).compile();

    usersService = moduleRef.get<TwitterUsersService>(TwitterUsersService);
    userRepo = moduleRef.get<MongoRepository<TwitterUser>>(getRepositoryToken(TwitterUser));
    app = moduleRef.createNestApplication();
    await app.init();
  })

  afterEach(async () => {
    await userRepo.clear();
  })

  it("delete() should only delete user with specified tids", async () => {
    const [user0, user1, user2, user3] = await usersService.saveMany([
      twitterUserFactory(),
      twitterUserFactory(),
      twitterUserFactory(),
      twitterUserFactory(),
    ])
    await usersService.delete({tids: [user0.userId, user2.userId]});
    const users = await userRepo.find({});
    expect(users.length).toEqual(2);
    expect(users.map(user => user.userId).sort()).toEqual([user1.userId, user3.userId].sort())
  })

  it("delete() should throw an error if query is empty", async () => {
    expect.assertions(2);
    const user0 = await usersService.save(twitterUserFactory());
    try {
      await usersService.delete({includeTagged: true})
    } catch (error){
      expect(error.isApplicationError).toBe(true)
      expect(await userRepo.find()).toEqual([user0]);
    }
  })

  it("delete() should delete everything except tagged users", async () => {
    const user0 = twitterUserFactory();
    user0.addTags("test");
    await usersService.saveMany([twitterUserFactory(), user0]);
    await usersService.delete();
    const users = await userRepo.find();
    expect(users.length).toEqual(1);
    expect(users[0].tags).toEqual(user0.tags)
  })

  it("delete() should delete everything ", async () => {
    const user0 = twitterUserFactory();
    user0.addTags("test");
    await usersService.saveMany([user0]);
    await usersService.delete({tids: [user0.userId], includeTagged: true});
    const users = await userRepo.find();
    expect(users.length).toEqual(0);
  })

  it("delete() should delete everything except users with specified tags", async () => {
    const user0 = twitterUserFactory();
    user0.addTags("test");
    const user1 = twitterUserFactory();
    user1.addTags("delete");
    await usersService.saveMany([user0, user1, twitterUserFactory()]);
    await usersService.delete({withTags: ["test"]});
    const users = await userRepo.find();
    expect(users.length).toEqual(2);
    expect(users[0].tags).toEqual(user1.tags)
  })

  afterAll(() => app.close());
})
