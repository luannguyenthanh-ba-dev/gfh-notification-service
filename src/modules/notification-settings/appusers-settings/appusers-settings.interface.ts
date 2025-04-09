import { Document, Types } from "mongoose";
import { APP_USERS_NOTIFICATION_SETTINGS_EVENTS } from "./appusers-settings.const";

export interface IAppUsersNotificationSettings extends Document {
  readonly _id: string | Types.ObjectId;
  readonly user_id: string; // uuid
  readonly user_email: string;
  readonly user_telegram_id?: string;
  readonly user_phone?: string;
  readonly event_types: APP_USERS_NOTIFICATION_SETTINGS_EVENTS[];
  readonly in_app_notification: boolean;
  readonly email_notification: boolean;
  readonly telegram_notification: boolean;
  // timestamp
  readonly created_at?: number;
  readonly updated_at?: number;
  readonly deleted_at?: number;
  readonly is_deleted?: boolean;
}
