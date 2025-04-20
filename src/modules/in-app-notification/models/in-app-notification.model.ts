import { Schema } from "mongoose";
import { NOTIFICATION_TYPES } from "../../notification-handlings/notification-handling.const";

export const InAppNotificationSchema = new Schema(
  {
    user_id: { type: String, required: true },
    user_name: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: Object.values(NOTIFICATION_TYPES),
    },
    event: { type: String, required: true },
    data: { type: Schema.Types.Mixed },
    is_read: { type: Boolean, default: false },
    is_deleted: { type: Boolean, default: false },
    read_at: { type: Date },
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
