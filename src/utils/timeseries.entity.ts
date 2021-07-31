import { Column, Entity } from "typeorm";

export class Pair<T, U>{
  left: T;
  right: U;

  constructor(left: T, right: U) {
    this.left = left;
    this.right = right;
  }
}

export class Optional<T>{
  protected value: T

  constructor(value: T) {
    this.value = value;
  }

  getOrDefault(def: T){
    return this.value?this.value: def;
  }

  isEmpty(){
    return !this.value;
  }

}

export class OptionalPair<T, U> extends Optional<Pair<T, U>>{

  constructor(value: Pair<T, U>) {
    super(value);
  }

  rightOrDefault(def: U): U{
    if (!this.isEmpty()){
      return this.value.right;
    }
    return def;
  }

  leftOrDefault(def: T): T {
    if (!this.isEmpty()){
      return this.value.left;
    }
    return def;
  }

  get left(): T{
    return this.value.left;
  }

  get right(): U {
    return this.value.right;
  }
}

@Entity()
export class TimeSeries<T>{
  @Column()
  time: Date[]

  @Column()
  values: T[]

  constructor() {
    this.time = [];
    this.values = [];
  }

  get length() {
    return this.values.length;
  }

  isEmpty() {
    return this.length === 0;
  }

  add(date: Date, value: T){
    this.time.push(date);
    this.values.push(value);
  }

  last():OptionalPair<Date, T>{
    if (this.time.length === 0){
      return new OptionalPair<Date, T>(new Pair<Date, T>(null, null));
    }
    const pair = new Pair<Date, T>(this.time[this.length-1], this.values[this.length-1]);
    return new OptionalPair(pair);
  }
}
