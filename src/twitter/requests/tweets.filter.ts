import { IsNumber, IsOptional, IsString } from "class-validator";

export class TweetsFilter {

  @IsOptional()
  @IsNumber()
  minScore: number

  @IsOptional()
  @IsString()
  tags: string

  @IsOptional()
  @IsString()
  ids: string

  @IsOptional()
  @IsString()
  hasTopics: string

  @IsOptional()
  noTopicsLabelled: boolean

  @IsOptional()
  isLabelled: boolean

}
