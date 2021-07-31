import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { SampleTweetEvent } from "../twitter/events/sample-tweet.event";
import { ClientKafka } from "@nestjs/microservices";
import { serialize } from "@hovoh/nestjs-api-lib";
import { Producer } from "kafkajs";
import { NewFollowingEvent } from "../twitter/events/new-following.event";

@Injectable()
export class KafkaProducer implements OnModuleInit, OnModuleDestroy{
  private producer: Producer;

  constructor(@Inject('KAFKA_CLIENT') private kafkaClient: ClientKafka) {

  }

  @OnEvent(SampleTweetEvent.NAME)
  async handleSampleTweetEvent(event: SampleTweetEvent){
    await this.producer.send({
      topic: "twitter.tweet",
      messages: [
        {
          value: JSON.stringify(serialize(event.data))
        }
      ]
    })
  }

  @OnEvent(NewFollowingEvent.NAME)
  async handleNewFollowingTweetEvent(event: NewFollowingEvent){
    console.log("New follow event");
    await this.producer.send({
      topic: "twitter.user.following",
      messages: [
        {
          value: JSON.stringify(serialize(event.data)),
        }
      ]
    })
  }

  async onModuleDestroy(): Promise<any> {
    await this.producer.disconnect()
  }

  async onModuleInit(): Promise<any> {
    this.producer = await this.kafkaClient.connect();
  }

}
