import { IsBoolean, IsBooleanString, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";

export class GetUserRequest {
  @IsString()
  @IsOptional()
  usernames: string

  @IsOptional()
  @Type(type => Boolean)
  @IsBoolean()
  import: boolean
}
