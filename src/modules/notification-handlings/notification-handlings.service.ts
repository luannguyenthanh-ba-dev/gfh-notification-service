import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleInit,
} from "@nestjs/common";
import { RabbitMQService } from "src/queue/rabbit-mq.service";
import { GeneralNotificationFormat } from "./notification-handling.interface";
import { NOTIFICATION_TYPES } from "./notification-handling.const";
import { APP_USERS_NOTIFICATION_SETTINGS_EVENTS } from "../notification-settings/appusers-settings/appusers-settings.const";
import { BmiService } from "./health-index/bmi.service";
import { IBmiUserNotification } from "./health-index/health-index.interface";

@Injectable()
export class NotificationHandlingsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationHandlingsService.name);
  private readonly NOTIFICATION_QUEUE_NAME: string;

  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly bmiService: BmiService,
  ) {
    this.NOTIFICATION_QUEUE_NAME = process.env.NOTIFICATION_QUEUE_NAME;
  }

  async onModuleInit() {
    // Start consuming messages when the module initializes
    await this.startConsumingNotifications();
  }

  /**
   * Start consuming notification messages from RabbitMQ
   */
  private async startConsumingNotifications() {
    try {
      this.logger.log(
        `startConsumingNotifications: Ready to consume notifications from queue: ${this.NOTIFICATION_QUEUE_NAME}`,
      );
      // Start consuming messages - queue will be created if it doesn't exist
      await this.rabbitMQService.consumeMessage(
        this.NOTIFICATION_QUEUE_NAME,
        async (message) => {
          await this.handleNotification(message);
        },
      );
    } catch (error) {
      this.logger.error(
        `startConsumingNotifications: Failed to start consuming notifications: ${error.message}`,
      );
    }
  }

  /**
   * Handle a notification message received from RabbitMQ
   * @param notification The notification data
   */
  private async handleNotification(notification: GeneralNotificationFormat) {
    try {
      this.logger.log(
        `handleNotification: Processing notification: ${JSON.stringify(
          notification,
        )}`,
      );

      // Process the notification based on its type
      if (notification.type) {
        switch (notification.type) {
          case NOTIFICATION_TYPES.USER_NOTIFICATION:
            await this.handleUserNotification(notification);
            break;
          case NOTIFICATION_TYPES.SYSTEM_NOTIFICATION:
            await this.handleSystemNotification(notification);
            break;
          case NOTIFICATION_TYPES.TRANSACTIONAL_NOTIFICATION:
            await this.handleTransactionalNotification(notification);
            break;
          case NOTIFICATION_TYPES.ADMIN_NOTIFICATION:
            await this.handleAdminNotification(notification);
            break;
          case NOTIFICATION_TYPES.MARKETING_NOTIFICATION:
            await this.handleMarketingNotification(notification);
            break;
          case NOTIFICATION_TYPES.PROMOTIONAL_NOTIFICATION:
            await this.handlePromotionalNotification(notification);
            break;
          case NOTIFICATION_TYPES.SECURITY_NOTIFICATION:
            await this.handleSecurityNotification(notification);
            break;
          case NOTIFICATION_TYPES.VENDOR_NOTIFICATION:
            await this.handleVendorNotification(notification);
            break;
          default:
            this.logger.warn(
              `handleNotification: Unknown notification type: ${notification.type}`,
            );
        }
      } else {
        this.logger.warn(
          "handleNotification: Notification received without a type",
        );
      }
    } catch (error) {
      this.logger.error(
        `handleNotification: Error handling notification: ${error.message}`,
      );
      throw error; // Re-throw to let RabbitMQ service handle the error
    }
  }

  /**
   * Handle email notifications
   * @param notification The email notification data
   */
  private async handleUserNotification(
    notification: GeneralNotificationFormat,
  ) {
    this.logger.log(
      `handleUserNotification: Sending notification to: ${JSON.stringify(
        notification.recipients,
      )}`,
    );
    const event = notification.data?.event;
    if (event) {
      switch (event) {
        case APP_USERS_NOTIFICATION_SETTINGS_EVENTS.BMI_NOTIFICATION:
          const data: IBmiUserNotification = {
            user_id: notification.recipients[0].user_id,
            user_name: notification.recipients[0].user_name,
            event: notification.data?.event,
            bmi_value: notification.data?.bmi_value,
            bmi_category: notification.data?.bmi_category,
            height: notification.data?.height,
            weight: notification.data?.weight,
            created_at: notification.data?.created_at,
          };
          await this.bmiService.handleBmiNotification(data);
          break;
        case APP_USERS_NOTIFICATION_SETTINGS_EVENTS.BMR_NOTIFICATION:
          // await this.handleBmrNotification(notification);
          break;
        case APP_USERS_NOTIFICATION_SETTINGS_EVENTS.BODY_STATS_NOTIFICATION:
          // await this.handleBodyStatsNotification(notification);
          break;
        case APP_USERS_NOTIFICATION_SETTINGS_EVENTS.TDEE_NOTIFICATION:
          // await this.handleTdeeNotification(notification);
          break;
        default:
          this.logger.warn(
            `handleUserNotification: Unknown event type: ${event}`,
          );
      }
    } else {
      this.logger.warn(
        `handleUserNotification: No event types found in notification`,
      );
    }
  }

  private async handleSystemNotification(
    notification: GeneralNotificationFormat,
  ) {
    this.logger.log(
      `handleSystemNotification: Sending system notification to: ${JSON.stringify(
        notification.recipients,
      )}`,
    );
    // Implement system notification sending logic here
  }

  private async handleTransactionalNotification(
    notification: GeneralNotificationFormat,
  ) {
    this.logger.log(
      `handleTransactionalNotification: Sending transactional notification to: ${JSON.stringify(
        notification.recipients,
      )}`,
    );
    // Implement transactional notification sending logic here
  }

  private async handleAdminNotification(
    notification: GeneralNotificationFormat,
  ) {
    this.logger.log(
      `handleAdminNotification: Sending admin notification to: ${JSON.stringify(
        notification.recipients,
      )}`,
    );
    // Implement admin notification sending logic here
  }

  private async handleMarketingNotification(
    notification: GeneralNotificationFormat,
  ) {
    this.logger.log(
      `handleMarketingNotification: Sending marketing notification to: ${JSON.stringify(
        notification.recipients,
      )}`,
    );
    // Implement marketing notification sending logic here
  }

  private async handlePromotionalNotification(
    notification: GeneralNotificationFormat,
  ) {
    this.logger.log(
      `handlePromotionalNotification: Sending promotional notification to: ${JSON.stringify(
        notification.recipients,
      )}`,
    );
    // Implement promotional notification sending logic here
  }

  private async handleSecurityNotification(
    notification: GeneralNotificationFormat,
  ) {
    this.logger.log(
      `handleSecurityNotification: Sending security notification to: ${JSON.stringify(
        notification.recipients,
      )}`,
    );
  }

  private async handleVendorNotification(
    notification: GeneralNotificationFormat,
  ) {
    this.logger.log(
      `handleVendorNotification: Sending vendor notification to: ${JSON.stringify(
        notification.recipients,
      )}`,
    );
    // Implement vendor notification sending logic here
  }
}
