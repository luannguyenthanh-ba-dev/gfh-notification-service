import { Injectable, Logger } from "@nestjs/common";
import { AppUsersNotificationSettingsService } from "src/modules/notification-settings/appusers-settings/appusers-settings.service";
import { IBmiUserNotification } from "./health-index.interface";
import { EmailService } from "src/modules/email/email.service";
import * as momentTz from "moment-timezone";
import { ServiceLogsService } from "src/modules/service-logs/logs.service";
import {
  LOG_FEATURES,
  LOG_LEVELS,
  LOG_TYPES,
} from "src/modules/service-logs/logs.const";
import { InAppNotificationService } from "src/modules/in-app-notification/in-app-notification.service";
import { NOTIFICATION_TYPES } from "../notification-handling.const";

@Injectable()
export class BmiService {
  private readonly logger = new Logger(BmiService.name);

  constructor(
    private readonly appUsersNotificationSettingsService: AppUsersNotificationSettingsService,
    private readonly emailService: EmailService,
    private readonly serviceLogsService: ServiceLogsService,
    private readonly inAppNotificationService: InAppNotificationService,
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
      const emailData = {
        user_name: notification.user_name,
        height: notification.height,
        weight: notification.weight,
        bmi: notification.bmi_value,
        category: notification.bmi_category,
        date: momentTz(notification.created_at)
          .tz(appUsersSettings.timezone)
          .format(),
        recommendation: notification.recommendation,
      };
      this.logger.log(
        `handleBmiNotification: Sending email notification to user ${appUsersSettings.user_email}`,
      );

      const sent = await this.emailService.sendUserBMIEmail(
        appUsersSettings.user_email,
        emailData,
      );
      if (sent) {
        this.logger.log(
          `handleBmiNotification: Email notification sent to user ${appUsersSettings.user_email}`,
        );
        // Log the successful email notification
        await this.serviceLogsService.create({
          feature: LOG_FEATURES.BMI,
          type: LOG_TYPES.NOTIFICATION_EMAIL,
          level: LOG_LEVELS.INFO,
          object_id: notification.user_id,
          message: `Email notification sent to user ${appUsersSettings.user_email}`,
          metadata: { ...emailData },
        });
      } else {
        this.logger.error(
          `handleBmiNotification: Failed to send email notification to user ${appUsersSettings.user_email}`,
        );
        await this.serviceLogsService.create({
          feature: LOG_FEATURES.BMI,
          type: LOG_TYPES.NOTIFICATION_EMAIL,
          level: LOG_LEVELS.ERROR,
          object_id: notification.user_id,
          message: `Failed to send email notification to user ${appUsersSettings.user_email}`,
          metadata: { ...emailData },
        });
      }
    }

    if (appUsersSettings.in_app_notification) {
      this.logger.log(
        `handleBmiNotification: Sending in-app notification to user ${appUsersSettings.user_id}`,
      );
      const notificationData = {
        user_id: notification.user_id,
        user_name: notification.user_name,
        type: NOTIFICATION_TYPES.USER_NOTIFICATION,
        event: notification.event,
        data: {
          height: notification.height,
          weight: notification.weight,
          bmi: notification.bmi_value,
          category: notification.bmi_category,
          recommendation: notification.recommendation,
          timestamp: notification.created_at,
        },
      };
      await this.inAppNotificationService.sendInAppBMINotification(
        notificationData,
        appUsersSettings,
      );
      // No need to log the in-app notification, it's handled by the in-app notification service
    }

    if (appUsersSettings.telegram_notification) {
      this.logger.log(
        `handleBmiNotification: Sending telegram notification to user ${appUsersSettings.user_telegram_id}`,
      );
      //   this.sendTelegramNotification(notification);
    }
  }
}
