import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsBoolean, IsEnum } from "class-validator";
import { Transform } from "class-transformer";
import { NOTIFICATION_TYPES } from "../../notification-handlings/notification-handling.const";

export class QueryInAppNotificationDto {
  @ApiProperty({
    description: "Read status",
    example: "true",
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === "true")
  is_read?: boolean;

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
    description: "Page number",
    example: 0,
    required: false,
    default: 0,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value) || 0)
  page?: number = 0;

  @ApiProperty({
    description: "Sort by field",
    example: "created_at",
    default: "created_at",
    required: false,
  })
  @IsOptional()
  sort_by?: string = "created_at";

  @ApiProperty({
    description: "Sort order",
    example: 1,
    required: false,
    default: 1,
  })
  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  @IsEnum([1, -1])
  sort_order?: 1 | -1 = 1;
}
