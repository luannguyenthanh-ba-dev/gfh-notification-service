import { Schema } from "mongoose";
import { APP_USERS_NOTIFICATION_SETTINGS_EVENTS } from "./appusers-settings.const";

export const AppUsersNotificationSettingsSchema = new Schema(
  {
    user_id: { type: String, required: true, unique: true },
    user_email: { type: String, required: true },
    user_telegram_id: { type: String, required: false },
    user_phone: { type: String, required: false },
    event_types: {
      type: [String],
      required: true,
      enum: Object.values(APP_USERS_NOTIFICATION_SETTINGS_EVENTS),
    },
    in_app_notification: { type: Boolean, default: true },
    email_notification: { type: Boolean, default: true },
    telegram_notification: { type: Boolean, default: true },
    created_at: Number,
    updated_at: Number,
    deleted_at: Number,
    is_deleted: { type: Boolean, default: false },
  },
  {
    timestamps: {
      currentTime: () => Math.floor(Date.now() / 1000),
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
);
