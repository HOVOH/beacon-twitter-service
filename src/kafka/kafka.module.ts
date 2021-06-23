import { Module } from "@nestjs/common";
import { KafkaProducer } from "./kafka.producer";
import { ClientsModule, Transport } from "@nestjs/microservices";

@Module({
  imports:[
    ClientsModule.register([{
      name: "KAFKA_CLIENT",
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: "twitter-api-server",
          brokers: ['localhost:9092'],
        },
        producer: {
          allowAutoTopicCreation: true,
        }
      }
    }]),
  ],
  providers: [
    KafkaProducer,
  ]
})
export class KafkaModule{}
