import { Exclude } from "class-transformer";

export class Event<T>{

  @Exclude()
  readonly name: string;
  readonly data: T;

  constructor(name: string, data: T,) {
    this.name = name;
    this.data = data;
  }
}
