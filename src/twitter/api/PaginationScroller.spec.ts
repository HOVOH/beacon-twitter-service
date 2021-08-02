import { PaginationScroller } from "./PaginationScroller";
import { HttpClient } from "../../http/http-client";
import { RateLimiter } from "limiter";

const EXPECTED_GET_RESULT = [1,2,3,4,5,6,7,8];

describe("PaginationScroller", () => {

  let paginationScroller: PaginationScroller<number>;
  let fetchClient: HttpClient;
  let rateLimiter: RateLimiter;
  beforeEach(() => {
    fetchClient = new HttpClient("");
    fetchClient.get = jest.fn().mockReturnValueOnce({
      data:[1, 2, 3],
      meta: {
        next_token: "3",
        result_count: 3,
      }
    }).mockReturnValueOnce({
      data:[4, 5, 6],
      meta: {
        next_token: "6",
        result_count: 3,
      }
    }).mockReturnValueOnce({
      data:[7, 8],
      meta: {
        result_count: 2,
      }
    });
    rateLimiter = new RateLimiter({ tokensPerInterval: 3, interval:1000 })
    paginationScroller = new PaginationScroller<any>(fetchClient, rateLimiter, 3);
    paginationScroller.setParams("test", {});
  });

  it("get() should return data", async ()=> {
    expect(await paginationScroller.get()).toEqual(EXPECTED_GET_RESULT);
    expect(fetchClient.get).toBeCalledTimes(3);
  })

  it("should wait for rate limit refresh", async () => {
    expect.assertions(3); //Should reach rate limit 2 times
    const paginationScroller = new PaginationScroller(
      fetchClient,
      new RateLimiter({ tokensPerInterval: 1, interval: 200}),
      1
    );
    paginationScroller.setParams("", {});
    paginationScroller.onRateLimit(() => expect(true).toBe(true));
    expect(await paginationScroller.get()).toEqual(EXPECTED_GET_RESULT);

  })

  it("Should consume all tokens if fetch throws 429", async () => {
    const fetchClient = new HttpClient("");
    fetchClient.get = jest.fn()
      .mockReturnValueOnce({
        data:[1, 2, 3],
        meta: {
          next_token: "3",
          result_count: 3,
        }
      })
      .mockRejectedValueOnce({status: 429})
      .mockReturnValueOnce({
        data:[4, 5, 6],
        meta: {
          next_token: "6",
          result_count: 3,
        }
      }).mockReturnValueOnce({
        data:[7, 8],
        meta: {
          result_count: 2,
        }
      });
    const rateLimiter = new RateLimiter({tokensPerInterval:10, interval:200});
    const paginationScroller = new PaginationScroller(fetchClient, rateLimiter, 10);
    paginationScroller.setParams("", {});
    expect.assertions(2);
    paginationScroller.onRateLimit(() => expect(true).toBe(true));
    expect(await paginationScroller.get()).toEqual(EXPECTED_GET_RESULT);
  })

  it("Should not fetch more items than maxBufferSize", async () => {
    paginationScroller.setMaxBufferSize(3);
    const items = await paginationScroller.get();
    expect(items).toEqual([1,2,3])
  })
})
