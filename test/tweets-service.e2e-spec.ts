import { MongoRepository, Repository } from "typeorm";
import { Tweet } from "../src/twitter/entities/tweet.entity";
import { TweetsService } from "../src/twitter/tweets.service";
import { Test } from "@nestjs/testing";
import { DatabaseModule } from "../src/database.module";
import { EnvironmentModule } from "@hovoh/nestjs-environment-module";
import { TwitterApi } from "../src/twitter/api/twitter-api.service";
import { getRepositoryToken, TypeOrmModule } from "@nestjs/typeorm";
import { tweetFactory } from "../src/twitter/entities/factories/tweet.factory";
import { DateTime } from "luxon";
import { INestApplication } from "@nestjs/common";

describe("TweetsService", () => {
  let app: INestApplication;
  let tweetsRepo: MongoRepository<Tweet>;
  let service: TweetsService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        DatabaseModule, EnvironmentModule, TypeOrmModule.forFeature([Tweet]),
      ],
      providers: [
        TwitterApi, TweetsService
      ]
    }).compile();

    tweetsRepo = moduleRef.get<MongoRepository<Tweet>>(getRepositoryToken(Tweet));
    service = moduleRef.get<TweetsService>(TweetsService);

    app = moduleRef.createNestApplication();
    await app.init();
  })

  it("Should purge tweets older than a week", async () => {
    const [ tweet0, tweet1, tweet2] = await tweetsRepo.save([tweetFactory(), tweetFactory(), tweetFactory()]);
    const expiredDate = DateTime.now().minus({day: 8}).toJSDate();
    await tweetsRepo.update(
      { tweetId: tweet0.tweetId},
       { foundAt: expiredDate });
    await tweetsRepo.update(
      { tweetId: tweet2.tweetId },
      { foundAt: expiredDate });
    await service.purgeUselessTweets();
    const tweetsLeft = await tweetsRepo.find({});
    expect(tweetsLeft).toEqual([tweet1]);
  })

  it("Should not purge tweets older than a week if labelled", async () => {
    const labelledTweet = tweetFactory();
    labelledTweet.meta.addTopic("user_id",["test"]);
    const [ tweet0, tweet1, tweet2] = await tweetsRepo.save([tweetFactory(), labelledTweet, tweetFactory()]);
    const expiredDate = DateTime.now().minus({day: 8}).toJSDate();
    await tweetsRepo.update(
      { tweetId: tweet0.tweetId},
      {foundAt: expiredDate});
    await tweetsRepo.update(
      { tweetId: tweet1.tweetId},
      {foundAt: expiredDate});
    const deleteRes = await service.purgeUselessTweets();
    expect(deleteRes.deletedCount).toEqual(1);
    const tweetsLeft = await tweetsRepo.find({});
    expect(tweet1.tweetId).toEqual(labelledTweet.tweetId);
    expect([...tweet1.meta.topics]).toEqual(["test"])
    expect(tweetsLeft.length).toEqual(2);
    expect(tweetsLeft.map(tweet => tweet.tweetId)).toEqual([tweet1.tweetId, tweet2.tweetId]);
  })

  it("Should not purge tweets older than a week if imported", async () => {
    const taggedTweet = tweetFactory();
    taggedTweet.meta.addTags("test");
    const [ tweet0, tweet1, tweet2] = await tweetsRepo.save([tweetFactory(), taggedTweet, tweetFactory()]);
    const expiredDate = DateTime.now().minus({day: 8}).toJSDate();
    await tweetsRepo.update(
      { tweetId: tweet0.tweetId},
      {foundAt: expiredDate});
    await tweetsRepo.update(
      { tweetId: tweet1.tweetId},
      {foundAt: expiredDate});
    const deleteRes = await service.purgeUselessTweets();
    expect(deleteRes.deletedCount).toEqual(1);
    const tweetsLeft = await tweetsRepo.find({});
    expect(tweet1.tweetId).toEqual(taggedTweet.tweetId);
    expect([...tweet1.meta.tags]).toEqual(["test"])
    expect(tweetsLeft.length).toEqual(2);
    expect(tweetsLeft.map(tweet => tweet.tweetId)).toEqual([tweet1.tweetId, tweet2.tweetId]);
  })

  it("Should return distinct authorTids", async () => {
    const tweet0 = tweetFactory();
    const tweet1 = tweetFactory();
    const tweet2 = tweetFactory({authorId: tweet1.authorId});
    await tweetsRepo.save([tweet0, tweet1, tweet2]);
    const authorIds = await service.getDisctinctAuthorTids();
    expect(authorIds.sort()).toEqual([tweet0.authorId, tweet1.authorId].sort());
  })

  afterEach(async() => await tweetsRepo.clear());

  afterAll(async () => {
    await app.close();
  });
})
