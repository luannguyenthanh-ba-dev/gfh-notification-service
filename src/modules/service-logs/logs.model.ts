import { Schema } from "mongoose";
import { LOG_FEATURES, LOG_LEVELS, LOG_TYPES } from "./logs.const";

export const ServiceLogsSchema = new Schema(
  {
    feature: {
      type: String,
      required: true,
      enum: Object.values(LOG_FEATURES),
    },
    type: {
      type: String,
      required: true,
      enum: Object.values(LOG_TYPES),
    },
    level: {
      type: String,
      required: true,
      enum: Object.values(LOG_LEVELS),
    },
    object_id: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      required: true,
    },
    created_at: Number,
    updated_at: Number,
  },
  {
    timestamps: {
      currentTime: () => Math.floor(Date.now() / 1000),
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
);
