import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, IsBoolean, IsEnum } from "class-validator";
import { Transform } from "class-transformer";
import { NOTIFICATION_TYPES } from "../../notification-handlings/notification-handling.const";

export class QueryInAppNotificationDto {
  @ApiProperty({
    description: "User ID",
    example: "60d6bc35f1c9a32c9c9e1a1b",
    required: false,
  })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiProperty({
    description: "Read status",
    example: "true",
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === "true")
  isRead?: boolean;

  @ApiProperty({
    description: "Notification type",
    enum: NOTIFICATION_TYPES,
    example: NOTIFICATION_TYPES.USER_NOTIFICATION,
    required: false,
  })
  @IsEnum(NOTIFICATION_TYPES)
  @IsOptional()
  type?: NOTIFICATION_TYPES;

  @ApiProperty({
    description: "Limit the number of returned records",
    example: 10,
    required: false,
    default: 10,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value) || 10)
  limit?: number = 10;

  @ApiProperty({
    description: "Skip number of records",
    example: 0,
    required: false,
    default: 0,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value) || 0)
  skip?: number = 0;

  @ApiProperty({
    description: "Sort by created_at",
    example: 1,
    required: false,
  })
  @IsOptional()
  sort?: { created_at?: 1 | -1 } = { created_at: -1 };
}
