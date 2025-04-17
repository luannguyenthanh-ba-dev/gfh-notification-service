import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { IAppUsersNotificationSettings } from "./appusers-settings.interface";
import {
  APP_USERS_NOTIFICATION_SETTINGS_EVENTS,
  AppUsersNotificationSettingsSchemaToken,
} from "./appusers-settings.const";

@Injectable()
export class AppUsersNotificationSettingsService {
  private readonly logger = new Logger(
    AppUsersNotificationSettingsService.name,
  );
  constructor(
    @InjectModel(AppUsersNotificationSettingsSchemaToken)
    private readonly model: Model<IAppUsersNotificationSettings>,
  ) {}

  async create(
    data: Partial<IAppUsersNotificationSettings>,
  ): Promise<IAppUsersNotificationSettings> {
    try {
      const result = await this.model.create(data);
      return result;
    } catch (error) {
      this.logger.log(
        `Create appusers settings met error: ${
          error.message || "Unknown error"
        }`,
      );
      throw new InternalServerErrorException(error.message || "Unknown error");
    }
  }

  async findOne(filters: {
    user_id?: string;
    _id?: string;
    from_time?: number | Date | string;
    to_time?: number | Date | string;
  }): Promise<IAppUsersNotificationSettings> {
    try {
      const query: any = {};
      if (filters.user_id) {
        query.user_id = filters.user_id;
      }
      if (filters._id) {
        query._id = filters._id;
      }
      if (filters.from_time) {
        query.created_at = { $gte: filters.from_time };
      }
      if (filters.to_time) {
        query.created_at = { $lte: filters.to_time };
      }
      const result = await this.model.findOne(query);
      return result;
    } catch (error) {
      this.logger.log(
        `Find one appusers settings met error: ${
          error.message || "Unknown error"
        }`,
      );
      throw new InternalServerErrorException(error.message || "Unknown error");
    }
  }

  async updateOne(
    filters: {
      user_id?: string;
      _id?: string;
    },
    data: {
      user_email?: string;
      user_phone?: string;
      user_telegram_id?: string;
      event_types?: APP_USERS_NOTIFICATION_SETTINGS_EVENTS[];
      in_app_notification?: boolean;
      email_notification?: boolean;
      telegram_notification?: boolean;
      timezone?: string;
    },
  ): Promise<IAppUsersNotificationSettings> {
    if (!Object.keys(filters).length) {
      throw new BadRequestException("Filters are required");
    }
    const updateData: any = {};
    if (data.event_types && data.event_types.length) {
      updateData.event_types = data.event_types;
    }
    if (
      data.in_app_notification !== undefined &&
      data.in_app_notification !== null
    ) {
      updateData.in_app_notification = data.in_app_notification;
    }
    if (
      data.email_notification !== undefined &&
      data.email_notification !== null
    ) {
      updateData.email_notification = data.email_notification;
    }
    if (
      data.telegram_notification !== undefined &&
      data.telegram_notification !== null
    ) {
      updateData.telegram_notification = data.telegram_notification;
    }
    if (data.user_email) {
      updateData.user_email = data.user_email;
    }
    if (data.user_phone) {
      updateData.user_phone = data.user_phone;
    }
    if (data.user_telegram_id) {
      updateData.user_telegram_id = data.user_telegram_id;
    }
    if (data.timezone) {
      updateData.timezone = data.timezone;
    }
    if (!Object.keys(updateData).length) {
      throw new BadRequestException("No valid data to update");
    }
    try {
      const result = await this.model.findOneAndUpdate(filters, updateData, {
        new: true,
      });
      return result;
    } catch (error) {
      this.logger.log(
        `Update appusers settings met error: ${
          error.message || "Unknown error"
        }`,
      );
      throw new InternalServerErrorException(error.message || "Unknown error");
    }
  }
}
