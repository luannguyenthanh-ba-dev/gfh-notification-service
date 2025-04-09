import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AppUsersNotificationSettingsSchema } from "./appusers-settings/appusers-settings.model";
import { AppUsersNotificationSettingsSchemaToken } from "./appusers-settings/appusers-settings.const";
import { AppUsersNotificationSettingsController } from "./appusers-settings/appusers-settings.controller";
import { AppUsersNotificationSettingsService } from "./appusers-settings/appusers-settings.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: AppUsersNotificationSettingsSchemaToken,
        schema: AppUsersNotificationSettingsSchema,
      },
    ]),
  ],
  controllers: [AppUsersNotificationSettingsController],
  providers: [AppUsersNotificationSettingsService],
  exports: [AppUsersNotificationSettingsService],
})
export class NotificationSettingsModule {}
