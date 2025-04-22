import {
  Injectable,
  Logger,
  InternalServerErrorException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { InAppGateway } from "./in-app-notification.gateway";
import {
  IInAppNotification,
  IInAppNotificationFilters,
} from "./in-app-notification.interface";
import { InAppNotificationSchemaToken } from "./in-app-notification.const";
import * as momentTz from "moment-timezone";
import { IAppUsersNotificationSettings } from "../notification-settings/appusers-settings/appusers-settings.interface";
import { NOTIFICATION_TYPES } from "../notification-handlings/notification-handling.const";
import { APP_USERS_NOTIFICATION_SETTINGS_EVENTS } from "../notification-settings/appusers-settings/appusers-settings.const";

@Injectable()
export class InAppNotificationService {
  private readonly logger = new Logger(InAppNotificationService.name);

  constructor(
    @InjectModel(InAppNotificationSchemaToken)
    private readonly model: Model<IInAppNotification>,
    private readonly inAppGateway: InAppGateway,
  ) {}

  async create(data: Partial<IInAppNotification>): Promise<IInAppNotification> {
    try {
      const result = await this.model.create(data);
      return result;
    } catch (error) {
      this.logger.error(
        `Error creating in-app notification: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async paginate(filters: IInAppNotificationFilters): Promise<{
    data: IInAppNotification[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const query: any = {};

      if (filters.user_id) {
        query.user_id = filters.user_id;
      }

      if (filters.is_read !== undefined) {
        query.is_read = filters.is_read;
      }

      if (filters.type) {
        query.type = filters.type;
      }

      const skip = (filters.page - 1) * filters.limit || 0;
      const limit = filters.limit || 10;

      const sort: any = {};
      if (filters.sort_by && filters.sort_order) {
        sort[filters.sort_by] = filters.sort_order;
      } else {
        sort["created_at"] = -1;
      }

      const [data, total] = await Promise.all([
        this.model.find(query).sort(sort).skip(skip).limit(limit).exec(),
        this.model.countDocuments(query),
      ]);
      return {
        data,
        total,
        page: filters.page,
        limit,
      };
    } catch (error) {
      this.logger.error(
        `Error finding in-app notifications: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(error.message);
    }
  }

  async findMany(
    filters: IInAppNotificationFilters,
  ): Promise<IInAppNotification[]> {
    try {
      const query: any = {};

      if (filters.user_id) {
        query.user_id = filters.user_id;
      }
      if (filters.is_read !== undefined) {
        query.is_read = filters.is_read;
      }
      if (filters.type) {
        query.type = filters.type;
      }
      if (filters.is_deleted !== undefined) {
        query.is_deleted = filters.is_deleted;
      }

      const result = await this.model.find(query);
      return result;
    } catch (error) {
      this.logger.error(
        `Error finding in-app notifications: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(error.message);
    }
  }

  async countUnreadForUser(user_id: string): Promise<number> {
    try {
      const result = await this.model.countDocuments({
        user_id,
        is_read: false,
        is_deleted: false,
      });
      return result;
    } catch (error) {
      this.logger.error(
        `Error counting unread notifications: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(error.message);
    }
  }

  async findOne(
    filters: IInAppNotificationFilters,
  ): Promise<IInAppNotification> {
    try {
      const query: any = {};

      if (filters.user_id) {
        query.user_id = filters.user_id;
      }
      if (filters._id) {
        query._id = filters._id;
      }
      if (filters.is_read !== undefined) {
        query.is_read = filters.is_read;
      }
      if (filters.type) {
        query.type = filters.type;
      }
      if (filters.is_deleted !== undefined) {
        query.is_deleted = filters.is_deleted;
      }
      const result = await this.model.findOne(query);
      return result;
    } catch (error) {
      this.logger.error(
        `Error finding in-app notification: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(error.message);
    }
  }

  async markAsRead(_id: string): Promise<any> {
    try {
      const result = await this.model.updateOne(
        { _id, is_read: false, is_deleted: false },
        { $set: { is_read: true, read_at: new Date() } },
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Error marking notification as read: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(error.message);
    }
  }

  async markAllUserNotificationsAsRead(user_id: string): Promise<boolean> {
    try {
      const result = await this.model.updateMany(
        { user_id, is_read: false, is_deleted: false },
        { $set: { is_read: true, read_at: new Date() } },
      );
      if (result.modifiedCount > 0) {
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error(
        `Error marking all notifications as read: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(error.message);
    }
  }

  async softDelete(id: string): Promise<any> {
    try {
      const result = await this.model.updateOne(
        { _id: id },
        { $set: { is_deleted: true } },
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Error deleting notification: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(error.message);
    }
  }

  async bulkCreate(
    notificationsData: IInAppNotification[],
  ): Promise<IInAppNotification[]> {
    try {
      const notifications = await this.model.insertMany(notificationsData);

      // Emit each notification to the appropriate user
      notifications.forEach((notification) => {
        this.inAppGateway.sendNotificationToUser(
          notification.user_id,
          notification.toObject(),
        );
      });

      return notifications;
    } catch (error) {
      this.logger.error(
        `Error creating bulk notifications: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async sendInAppBMINotification(
    notification: Partial<IInAppNotification>,
    appUsersSettings: IAppUsersNotificationSettings,
  ): Promise<IInAppNotification> {
    try {
      if (
        notification.event !==
        APP_USERS_NOTIFICATION_SETTINGS_EVENTS.BMI_NOTIFICATION
      ) {
        throw new BadRequestException("Invalid notification title");
      }
      this.logger.log(
        `Sending in-app BMINotification to user ${notification.user_id}`,
      );
      const result = await this.create(notification);
      this.inAppGateway.sendBMINotification({
        id: result._id.toString(),
        name: notification.event,
        type: notification.type,
        date: momentTz(notification.data?.timestamp)
          .tz(appUsersSettings.timezone)
          .format("YYYY-MM-DD HH:mm:ss"),
        height: notification.data?.height,
        weight: notification.data?.weight,
        bmi: notification.data?.bmi,
        category: notification.data?.category,
        recommendation: notification.data?.recommendation,
      });
      return result;
    } catch (error) {
      this.logger.error(
        `Error sending in-app notification: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(error.message);
    }
  }
}
