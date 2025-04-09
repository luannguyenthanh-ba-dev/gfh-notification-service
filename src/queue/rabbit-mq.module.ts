import { Module } from "@nestjs/common";
import { RabbitMQService } from "./rabbit-mq.service";

@Module({
  providers: [RabbitMQService],
  exports: [RabbitMQService],
})
export class RabbitMQModule {}
