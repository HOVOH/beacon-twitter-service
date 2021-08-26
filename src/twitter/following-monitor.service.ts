import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { EventService } from "../events/event.service";
import { TwitterUsersService } from "./twitter-users.service";
import { TwitterUser } from "./entities/twitter-user.entity";
import { IMPORTED_TAG } from "./tags";
import { Timeout } from "@nestjs/schedule";
import EventEmitter from "events";
import { Event } from "../events/event";
import { NewFollowingEvent } from "./events/new-following.event";

const NEXT_EVENT = "NEXT";

@Injectable()
export class FollowingMonitorService implements OnModuleInit{
  static readonly NAME = "FollowingMonitoringService";

  private queue: TwitterUser[];
  private running: boolean;
  private internalEvents: EventEmitter
  private readonly logger = new Logger(FollowingMonitorService.name);
  constructor(private eventService: EventService,
              private twitterUsersService: TwitterUsersService) {
    this.internalEvents = new EventEmitter();
    this.internalEvents.on(NEXT_EVENT, () => this.run());
  }

  async onModuleInit(): Promise<any> {
    this.queue = await this.twitterUsersService.query({withTags:[IMPORTED_TAG]});

  }

  @Timeout(1000)
  start() {
    this.running = true;
    this.logger.log("Started monitoring "+this.queue.length+ " users for followings events");
    this.next();
  }

  next() {
    if (this.running){
      this.internalEvents.emit("NEXT");
    }
  }

  async run(){
    if (this.queue.length == 0) {
      this.stop();
      return;
    }
    let user = this.queue.shift();
    try {
      const following = await this.twitterUsersService.getFollowing(user);
      const followingTids = following.map(following => following.userId);
      let startedFollowingTids = followingTids;
      let stoppedFollowingTids = [];
      if (user.followingTids){
        startedFollowingTids = followingTids.filter(id => !user.followingTids.includes(id));
        stoppedFollowingTids = user.followingTids.filter(id => !followingTids.includes(id));
      }
      if (stoppedFollowingTids.length > 0 || startedFollowingTids.length > 0) {
        user.followingTids = followingTids;
        user.followingTidsHistory.add(new Date(), {
          add: startedFollowingTids,
          removed: stoppedFollowingTids
        });
        user = await this.twitterUsersService.save(user);
        let startedFollowing = await Promise.all(startedFollowingTids
          .map(tid => following.find(user => user.userId === tid))
          .map(user => this.twitterUsersService.mergeWithRecords(user)));
        startedFollowing = await this.twitterUsersService.saveMany(startedFollowing);
        const stoppedFollowing = await Promise.all(stoppedFollowingTids
          .map(tid => this.twitterUsersService.lookupTid(tid)));
        this.eventService.emit(new NewFollowingEvent(user, startedFollowing, stoppedFollowing))
      }
      this.queue.push(user);
      this.next();
    } catch (error) {
      this.logger.error(error.message??error.statusMessage);
      console.log(error.stack)
      this.next();
    }
  }

  stop() {
    this.running = false;
  }
}
