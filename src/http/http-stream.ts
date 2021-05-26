import { AbortController } from 'abort-controller';
import split from 'split';
import { HttpClient } from './http-client';

export class HttpStream {
  private abortController: AbortController;
  private isRunning: boolean;
  onError: (error)=> void;
  onEnd: ()=> void;
  constructor(private httpClient: HttpClient) {
  }



  async restartStream(path, query, onData: (string) => any){
    if (this.isRunning){
      this.close();
    }
    this.startStream(path, query, onData);
  }

  async startStream(path, query, onData: (string) => any) {
    this.abortController = new AbortController();
    if (!this.isRunning) {
      const response = await this.httpClient.fetch(path, query, {
        signal: this.abortController.signal,
      });
      const stream = response.body.pipe(split());
      stream.on('data', onData);
      stream.on('error', (error)=>{
        this.close();
        this.onError && this.onError(error);
      })
      stream.on('end', ()=>{
        this.close();
        this.onEnd && this.onEnd();
      })
    }
  }



  close(){
    if (this.isRunning){
      this.isRunning = false;
      this.abortController.abort();
    }
  }

}
