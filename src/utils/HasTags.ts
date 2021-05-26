import { Expose } from "class-transformer";
import { Column } from "typeorm";

export abstract class HasTags{
  @Column()
  protected _tags: string[]

  protected constructor() {
    this._tags = [];
  }

  @Expose()
  get tags(){
    return [...this._tags]
  }

  addTags(...tags: string[]){
    this._tags = [...(new Set([...this._tags, ...tags]))]
  }

  removeTags(...tags: string[]){
    this._tags = this._tags.filter(tag => !tags.includes(tag));
  }
}
