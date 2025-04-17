import { APP_USERS_NOTIFICATION_SETTINGS_EVENTS } from "src/modules/notification-settings/appusers-settings/appusers-settings.const";

export interface IBmiUserNotification {
  user_id: string;
  user_name: string;
  event: APP_USERS_NOTIFICATION_SETTINGS_EVENTS;
  bmi_value: number;
  bmi_category: string;
  height: number;
  weight: number;
  created_at: Date;
}
