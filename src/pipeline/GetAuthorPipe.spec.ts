import { GetAuthorPipe } from "./GetAuthorPipe";
import { ITweetSample, iTweetSampleFactory } from "../twitter/api/tweet-sample";

describe("GetAuthorPipe", () => {

  let pipe: GetAuthorPipe;

  beforeEach(() => {
    pipe = new GetAuthorPipe();
  })

  it("Should return the tweet author", async () => {
    const sample: ITweetSample = iTweetSampleFactory();
    expect((await pipe.transform(sample)).id).toEqual(sample.data.author_id);
  })
})
