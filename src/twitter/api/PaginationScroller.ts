import { RateLimiter } from "limiter";
import EventEmitter from "events";
import { HttpClient } from "../../http/http-client";
import { IPaginatedResponse } from "./response";

const NEXT_EVENT = "next";
const DONE_EVENT = "done";
const RATE_LIMITED_EVENT = "rate_limit_reached";
const ERROR_EVENT = "error";

export class PaginationScroller<T> {
  private eventEmitter: EventEmitter;
  private running: boolean;
  private readonly buffer: T[];
  private query: any;
  private path: string;
  private maxBufferSize: number = null;

  constructor(private fetchClient: HttpClient,
              private rateLimiter: RateLimiter,
              private tokensPerInterval: number) {
    this.eventEmitter = new EventEmitter();
    this.eventEmitter.on(NEXT_EVENT, () => this.exec());
    this.eventEmitter.on(RATE_LIMITED_EVENT, () => this.waitRateLimitRefresh());
    this.buffer = [];
    this.query = {};
  }

  setParams(path:string, query: any){
    this.path = path;
    this.query = query;
    return this;
  }

  setPath(path: string){
    this.path = path;
    return this;
  }

  setQuery(query: any){
    this.query = query;
    return this;
  }

  setMaxBufferSize(size: number){
    this.maxBufferSize = size;
    return this;
  }

  get(){
    this.running = true;
    const promise = new Promise<T[]>((res, rej) => {
      this.eventEmitter.on(DONE_EVENT, () => {
        this.running = false;
        res(this.buffer);
      });
      this.eventEmitter.on(ERROR_EVENT, (error) => rej(error));
    });
    this.eventEmitter.emit(NEXT_EVENT);
    return promise;
  }

  async exec(){
    try {
      if (this.rateLimiter.getTokensRemaining() < 1){
        this.eventEmitter.emit(RATE_LIMITED_EVENT)
        return;
      }
      await this.rateLimiter.removeTokens(1);
      const response: IPaginatedResponse<T[]> = await this.fetchClient.get(this.path, this.query);
      if (response.meta.result_count > 0){
        this.buffer.push(...response.data);
      }
      if (response.meta.next_token && (!this.maxBufferSize || this.maxBufferSize < this.buffer.length)){
        this.query.pagination_token = response.meta.next_token;
        this.eventEmitter.emit(NEXT_EVENT, response.data);
      } else {
        this.eventEmitter.emit(DONE_EVENT, this.buffer);
      }
    } catch(error){
      if (error.status === 429){
        await this.rateLimiter.removeTokens(this.rateLimiter.getTokensRemaining());
        this.eventEmitter.emit(RATE_LIMITED_EVENT);
      } else {
        this.eventEmitter.emit(ERROR_EVENT, error);
      }
    }

  }

  async waitRateLimitRefresh(){
    if (this.rateLimiter.getTokensRemaining() === this.tokensPerInterval){
      this.eventEmitter.emit(NEXT_EVENT);
    } else {
      setTimeout(() => {
        this.waitRateLimitRefresh()
      }, 1000)
    }
  }

  onRateLimit(fn: () => void){
    this.eventEmitter.on(RATE_LIMITED_EVENT, fn);
    return this;
  }

  onNextPage(fn: (lastPage?:T[]) => void){
    this.eventEmitter.on(NEXT_EVENT, fn);
    return this;
  }

  onDone(fn: (buffer: T[]) => void) {
    this.eventEmitter.on(DONE_EVENT, fn);
    return this;
  }
}
