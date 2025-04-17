import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { MongoDbModule } from "./database/mongodb.module";
import { RabbitMQModule } from "./queue/rabbit-mq.module";
import { NotificationSettingsModule } from "./modules/notification-settings/notification-settings.module";
import { NotificationHandlingsModule } from "./modules/notification-handlings/notification-handlings.module";
import { ServiceLogsModule } from "./modules/service-logs/logs.module";

@Module({
  imports: [
    MongoDbModule,
    RabbitMQModule,
    NotificationSettingsModule,
    NotificationHandlingsModule,
    ServiceLogsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
