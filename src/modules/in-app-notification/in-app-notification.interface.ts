import { Document, Types } from "mongoose";
import { NOTIFICATION_TYPES } from "../notification-handlings/notification-handling.const";
import { APP_USERS_NOTIFICATION_SETTINGS_EVENTS } from "../notification-settings/appusers-settings/appusers-settings.const";

export interface IInAppNotification extends Document {
  readonly _id: string | Types.ObjectId;
  readonly user_id: string;
  readonly user_name: string;
  readonly type: NOTIFICATION_TYPES;
  readonly event: string | APP_USERS_NOTIFICATION_SETTINGS_EVENTS;
  readonly data: Record<string, any>;
  readonly is_read: boolean;
  readonly is_deleted: boolean;
  readonly read_at: Date;
  readonly created_at: number;
  readonly updated_at: number;
}

export interface IInAppNotificationFilters {
  _id?: string | Types.ObjectId;
  is_deleted?: boolean;
  user_id?: string;
  is_read?: boolean;
  type?: NOTIFICATION_TYPES;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 1 | -1;
}

export type BMICategory =
  | "UNDERWEIGHT"
  | "NORMAL"
  | "OVERWEIGHT"
  | "OBESE"
  | "OBESE_II"
  | "OBESE_III";

export interface Notification {
  id: string;
  name: string;
  type: string;
  date: string;
}

export interface BMINotification extends Notification {
  height: number;
  weight: number;
  bmi: number;
  category: BMICategory;
  recommendation: string;
}

export interface BMRNotification extends Notification {
  bmr: number;
  recommendation: string;
}
