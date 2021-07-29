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

  it("should throw author not included", function() {
    expect.assertions(1);
    const sample = iTweetSampleFactory();
    sample.data.author_id = "00000";
    return pipe.transform(sample)
      .catch(error => expect(error.message).toBe("author not included"))
  });
})
