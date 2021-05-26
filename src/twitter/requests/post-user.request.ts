import { IsArray, IsBooleanString, IsOptional } from "class-validator";

export class PostUserRequest {
  @IsOptional()
  @IsBooleanString()
  forceMonitor: boolean;

  @IsOptional()
  @IsArray()
  tags: string[]
}
