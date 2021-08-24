import { IsBooleanString, IsOptional, IsString } from "class-validator";

export class DeleteTweetsFilter {
  @IsOptional()
  @IsString()
  authorTids: string

  @IsOptional()
  @IsBooleanString()
  includeTagged: string
}
