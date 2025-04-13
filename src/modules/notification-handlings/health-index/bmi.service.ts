import { Injectable, Logger } from "@nestjs/common";
import { GeneralNotificationFormat } from "../notification-handling.interface";
import { AppUsersNotificationSettingsService } from "src/modules/notification-settings/appusers-settings/appusers-settings.service";
import { IBmiUserNotification } from "./health-index.interface";

@Injectable()
export class BmiService {
  private readonly logger = new Logger(BmiService.name);

  constructor(
    private readonly appUsersNotificationSettingsService: AppUsersNotificationSettingsService,
  ) {}

  async handleBmiNotification(notification: IBmiUserNotification) {
    this.logger.log(
      `handleBmiNotification: Handling BMI notification for user ${notification.user_id}`,
    );
    const appUsersSettings =
      await this.appUsersNotificationSettingsService.findOne({
        user_id: notification.user_id,
      });

    if (!appUsersSettings) {
      this.logger.warn(
        `handleBmiNotification: App users settings not found for user ${notification.user_id}`,
      );
      return;
    }

    if (appUsersSettings.email_notification) {
      this.logger.log(
        `handleBmiNotification: Sending email notification to user ${appUsersSettings.user_email}`,
      );
      //   this.sendEmailNotification(notification);
    }

    if (appUsersSettings.telegram_notification) {
      this.logger.log(
        `handleBmiNotification: Sending telegram notification to user ${appUsersSettings.user_telegram_id}`,
      );
      //   this.sendTelegramNotification(notification);
    }

    if (appUsersSettings.in_app_notification) {
      this.logger.log(
        `handleBmiNotification: Sending in-app notification to user ${appUsersSettings.user_id}`,
      );
      //   this.sendInAppNotification(notification);
    }
  }
}
