import {
  IsArray,
  IsBoolean,
  IsDefined,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsTimeZone,
  IsUUID,
} from "class-validator";
import { APP_USERS_NOTIFICATION_SETTINGS_EVENTS } from "../appusers-settings.const";
import { ApiProperty } from "@nestjs/swagger";

export class CreateAppUsersSettingsDto {
  @ApiProperty({
    description: "User ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
    required: true,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  user_id: string;

  @ApiProperty({
    description: "User Email",
    example: "test@test.com",
    required: true,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  user_email: string;

  @ApiProperty({
    description: "User Phone",
    example: "+1234567890",
    required: false,
    type: String,
  })
  @IsOptional()
  @IsPhoneNumber("VN")
  user_phone: string;

  @ApiProperty({
    description: "AppUsers Notification Settings Event types",
    example: [APP_USERS_NOTIFICATION_SETTINGS_EVENTS.BMI_NOTIFICATION],
    required: true,
    type: [String],
  })
  @IsDefined()
  @IsArray()
  @IsNotEmpty()
  @IsEnum(APP_USERS_NOTIFICATION_SETTINGS_EVENTS, { each: true })
  event_types: APP_USERS_NOTIFICATION_SETTINGS_EVENTS[];

  @ApiProperty({
    description: "In app notification",
    example: true,
    required: true,
    type: Boolean,
  })
  @IsBoolean()
  @IsNotEmpty()
  @IsDefined()
  in_app_notification: boolean;

  @ApiProperty({
    description: "Email notification",
    example: true,
    required: true,
    type: Boolean,
  })
  @IsBoolean()
  @IsNotEmpty()
  @IsDefined()
  email_notification: boolean;

  @ApiProperty({
    description: "Telegram notification",
    example: true,
    required: true,
    type: Boolean,
  })
  @IsBoolean()
  @IsNotEmpty()
  @IsDefined()
  telegram_notification: boolean;

  @ApiProperty({
    description: "Timezone",
    example: "Asia/Ho_Chi_Minh",
    required: true,
    type: String,
  })
  @IsTimeZone()
  @IsOptional()
  timezone?: string;
}
