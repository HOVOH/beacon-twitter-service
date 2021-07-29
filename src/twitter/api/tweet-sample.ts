import { iTwitterUserFactory, IUser } from "./user";
import { ITweet, iTweetFactory } from "./tweet";

export interface ITweetSample{
  data: ITweet,
  includes?: {
    users?: IUser[]
  }
}

export const iTweetSampleFactory = (override?: Partial<ITweetSample>) => {
  const tweet = iTweetFactory();
  const fakeTweetSample: ITweetSample = {
    data: tweet,
    includes: {
      users: [
        iTwitterUserFactory({id: tweet.author_id}),
        iTwitterUserFactory(),
        iTwitterUserFactory()
      ]
    }
  }
  return Object.assign(fakeTweetSample, override);
}
