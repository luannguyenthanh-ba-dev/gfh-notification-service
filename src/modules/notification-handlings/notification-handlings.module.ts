import { Module } from "@nestjs/common";
import { NotificationHandlingsService } from "./notification-handlings.service";
import { RabbitMQModule } from "src/queue/rabbit-mq.module";
import { BmiService } from "./health-index/bmi.service";
import { NotificationSettingsModule } from "../notification-settings/notification-settings.module";

@Module({
  imports: [RabbitMQModule, NotificationSettingsModule],
  providers: [NotificationHandlingsService, BmiService],
  exports: [NotificationHandlingsService],
})
export class NotificationHandlingsModule {}
