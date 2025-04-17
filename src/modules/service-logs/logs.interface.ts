import { Document, Types } from 'mongoose';
import { LOG_FEATURES, LOG_LEVELS, LOG_TYPES } from './logs.const';

export interface IServiceLog extends Document {
  readonly _id: string | Types.ObjectId;
  readonly feature: LOG_FEATURES;
  readonly type: LOG_TYPES;
  readonly level: LOG_LEVELS;
  readonly object_id: string;
  readonly message: string;
  readonly metadata: Record<string, any>;
  readonly created_at?: number;
  readonly updated_at?: number;
}

export interface IServiceLogsFilters {
  feature?: LOG_FEATURES;
  type?: LOG_TYPES;
  level?: LOG_LEVELS;
  from_time?: number | Date | string;
  to_time?: number | Date | string;
}
