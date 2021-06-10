import { Body, Controller, Get, HttpStatus, Param, Post, Query, UseGuards } from "@nestjs/common";
import { PostUserRequest } from "./requests/post-user.request";
import { TwitterUsersService } from "./twitter-users.service";
import { GetUserRequest } from "./requests/get-user.request";
import { AccessTokenGuard, errors } from "@hovoh/nestjs-authentication-lib";
import { ApplicationError, CatchApplicationError } from "@hovoh/nestjs-application-error";
import { USER_NOT_FOUND } from "./errors.code";

@Controller('api/v1/twitter/users')
@UseGuards(AccessTokenGuard)
@CatchApplicationError({
  ...errors.authErrorStatusMap,
  [USER_NOT_FOUND]: HttpStatus.NOT_FOUND
})
export class TwitterUsersController{

  constructor(private twitterUsers: TwitterUsersService) {
  }

  @Get()
  async lookupUsers(@Query() query: GetUserRequest){
    if (query.import){
      return this.twitterUsers.importUsers(query.usernames);
    }
    return this.twitterUsers.lookupUsers(query.usernames);
  }

  @Get(':id')
  async getUser(@Param("id") id: string){
    const user = await this.twitterUsers.findOne({userId: id});
    if (!user){
      throw new ApplicationError(USER_NOT_FOUND);
    }
    return user;
  }

  @Post(':id')
  async editUser(@Param("id") userId: string, @Body() body: PostUserRequest){
    const results = await this.twitterUsers.update({userId}, body);
  }


}
