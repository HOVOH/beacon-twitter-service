import { Module } from "@nestjs/common";
import { KafkaProducer } from "./kafka.producer";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { EnvironmentModule, EnvironmentService } from "@hovoh/nestjs-environment-module";
import { IEnv } from "../app.module";

@Module({
  imports:[
    ClientsModule.registerAsync([{
      imports: [EnvironmentModule],
      name: "KAFKA_CLIENT",
      useFactory: async ({env}: EnvironmentService<IEnv>) => ({
        name: "KAFKA_CLIENT",
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: "twitter-api-server",
            brokers: env.KAFKA_BROKERS.split(","),
          },
          producer: {
            allowAutoTopicCreation: true,
          },
        }
      }),
      inject: [EnvironmentService]
    }]),
  ],
  providers: [
    KafkaProducer,
  ]
})
export class KafkaModule{}
