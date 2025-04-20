import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { MongoDbModule } from "./database/mongodb.module";
import { RabbitMQModule } from "./queue/rabbit-mq.module";
import { NotificationSettingsModule } from "./modules/notification-settings/notification-settings.module";
import { NotificationHandlingsModule } from "./modules/notification-handlings/notification-handlings.module";
import { ServiceLogsModule } from "./modules/service-logs/logs.module";
import { InAppNotificationModule } from "./modules/in-app-notification/in-app-notification.module";

@Module({
  imports: [
    MongoDbModule,
    RabbitMQModule,
    NotificationSettingsModule,
    NotificationHandlingsModule,
    ServiceLogsModule,
    InAppNotificationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
