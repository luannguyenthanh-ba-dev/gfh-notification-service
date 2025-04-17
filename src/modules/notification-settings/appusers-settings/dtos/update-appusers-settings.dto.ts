import { ApiProperty } from "@nestjs/swagger";
import { APP_USERS_NOTIFICATION_SETTINGS_EVENTS } from "../appusers-settings.const";
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsTimeZone,
  IsUUID,
} from "class-validator";

export class UpdateAppUsersSettingsDto {
  @ApiProperty({
    description: "The user uuid",
    type: String,
    example: "123e4567-e89b-12d3-a456-426614174000",
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  user_id: string;

  @ApiProperty({
    description: "The user email",
    type: String,
    example: "test@test.com",
    required: false,
  })
  @IsEmail()
  @IsOptional()
  user_email?: string;

  @ApiProperty({
    description: "The user phone",
    type: String,
    example: "+1234567890",
    required: false,
  })
  @IsPhoneNumber("VN")
  @IsOptional()
  user_phone?: string;

  @ApiProperty({
    description: "The user telegram id",
    type: String,
    example: "1234567890",
    required: false,
  })
  @IsString()
  @IsOptional()
  user_telegram_id?: string;

  @ApiProperty({
    description: "The event types to be notified for",
    type: [String],
    enum: Object.values(APP_USERS_NOTIFICATION_SETTINGS_EVENTS),
    example: [
      APP_USERS_NOTIFICATION_SETTINGS_EVENTS.BMI_NOTIFICATION,
      APP_USERS_NOTIFICATION_SETTINGS_EVENTS.BMR_NOTIFICATION,
    ],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(APP_USERS_NOTIFICATION_SETTINGS_EVENTS, { each: true })
  event_types?: APP_USERS_NOTIFICATION_SETTINGS_EVENTS[];

  @ApiProperty({
    description: "The in app notification",
    type: Boolean,
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  in_app_notification?: boolean;

  @ApiProperty({
    description: "The email notification",
    type: Boolean,
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  email_notification?: boolean;

  @ApiProperty({
    description: "The telegram notification",
    type: Boolean,
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  telegram_notification?: boolean;

  @ApiProperty({
    description: "The timezone",
    type: String,
    example: "Asia/Ho_Chi_Minh",
    required: false,
  })
  @IsTimeZone()
  @IsOptional()
  timezone?: string;
}
