import { ApplicationError } from '@hovoh/nestjs-application-error';
import fetch, { Response } from 'node-fetch';
import { HttpStream } from './http-stream';

export class HttpClient {
  baseUrl: string;
  bearerToken: string;

  constructor(baseUrl: string, authToken: string) {
    this.baseUrl = baseUrl;
    this.bearerToken = authToken;
  }

  get(path: string, query: any) {
    return this.fetch(path, query, { method: 'get' }).then(this.handleResponse);
  }

  post(path: string, query: any, body: any) {
    return this.fetch(path, query, {
      method: 'post',
      body: JSON.stringify(body || {}),
    }).then(this.handleResponse);
  }

  async stream(path: string, query: any, onData: (string) => any,onError:(any)=>void, onEnd:() => void) {
    const httpStream = new HttpStream(this);
    await httpStream.startStream(path, query, onData);
    httpStream.onError = (error)=>{
        httpStream.restartStream(path, query, onData);
        onError && onError(error)
      };
    httpStream.onEnd = onEnd;
    return httpStream;
  }

  fetch(path: string, query: any = {}, init?: RequestInit): Promise<Response> {
    return fetch(this.buildUrl(path, query), {
      headers: {
        Authorization: 'Bearer ' + this.bearerToken,
      },
      ...init,
    });
  }

  buildUrl(endpoint: string, parameters: any = {}) {
    const url = new URL(this.baseUrl + endpoint);
    Object.keys(parameters).forEach((key) =>
      url.searchParams.set(key, parameters[key]),
    );
    return url.toString();
  }

  handleResponse(response: Response): Promise<any> {
    if (!response.ok) {
      console.log(response);
      console.log(response.statusText);
      throw new ApplicationError('twitter_client_failed');
    }
    return response.json();
  }
}
