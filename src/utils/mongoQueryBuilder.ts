import merge from 'merge';

type AllowedType = string | number | boolean;

export class MongoQueryBuilder {

  query: any;

  constructor() {
    this.query = {};
  }

  add(value: AllowedType|Array<AllowedType>, cb:(AllowedType)=> any){
    if (typeof value === "boolean" || value){
      this.query = merge(false, this.query, cb(value))
    }
    return this;
  }

}
