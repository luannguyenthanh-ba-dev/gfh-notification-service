import { Module } from "@nestjs/common";
import { NotificationHandlingsService } from "./notification-handlings.service";
import { RabbitMQModule } from "src/queue/rabbit-mq.module";
import { BmiService } from "./health-index/bmi.service";
import { NotificationSettingsModule } from "../notification-settings/notification-settings.module";
import { EmailModule } from "../email/email.module";
import { ServiceLogsModule } from "../service-logs/logs.module";
import { InAppNotificationModule } from "../in-app-notification/in-app-notification.module";
@Module({
  imports: [
    RabbitMQModule,
    NotificationSettingsModule,
    EmailModule,
    ServiceLogsModule,
    InAppNotificationModule,
  ],
  providers: [NotificationHandlingsService, BmiService],
  exports: [NotificationHandlingsService],
})
export class NotificationHandlingsModule {}
