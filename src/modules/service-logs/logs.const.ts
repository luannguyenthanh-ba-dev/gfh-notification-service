export enum LOG_TYPES {
  NOTIFICATION_EMAIL = 'notification_email',
  NOTIFICATION_TELEGRAM = 'notification_telegram',
  NOTIFICATION_IN_APP = 'notification_in_app',
  NOTIFICATION_SYSTEM = 'notification_system',
}

export enum LOG_LEVELS {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  DEBUG = 'debug',
}

export enum LOG_FEATURES {
  BMI = 'bmi',
  BMR = 'bmr',
  BODY_STATS = 'body_stats',
  TDEE = 'tdee',
  SYSTEM = 'system',
}

export const ServiceLogsSchemaToken = 'service_logs';
