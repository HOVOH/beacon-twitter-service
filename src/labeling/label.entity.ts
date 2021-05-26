import { Column, Entity } from "typeorm";

@Entity()
export class Label<T>{
  @Column()
  assignedBy: string;

  @Column()
  label: T
}
