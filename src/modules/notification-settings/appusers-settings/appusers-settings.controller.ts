import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  NotFoundException,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import { AppUsersNotificationSettingsService } from "./appusers-settings.service";
import { CreateAppUsersSettingsDto, UpdateAppUsersSettingsDto } from "./dtos";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { AuthGuard } from "src/modules/auth/guards/auth.guard";

@ApiTags("Notification Settings - AppUsers Settings")
@Controller("v1/notification-settings/appusers-settings")
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class AppUsersNotificationSettingsController {
  private readonly logger = new Logger(
    AppUsersNotificationSettingsController.name,
  );
  constructor(
    private readonly appUsersNotificationSettingsService: AppUsersNotificationSettingsService,
  ) {}

  @Post()
  @ApiOperation({ summary: "Create appusers settings" })
  @ApiResponse({
    status: 201,
    description: "The appusers settings has been successfully created.",
    type: Object,
  })
  async create(@Body() data: CreateAppUsersSettingsDto) {
    this.logger.log(`Create appusers settings for user: ${data.user_id}`);
    const existing = await this.appUsersNotificationSettingsService.findOne({
      user_id: data.user_id,
    });
    if (existing) {
      throw new BadRequestException("AppUsers settings already exists!");
    }
    const result = await this.appUsersNotificationSettingsService.create(data);
    return result;
  }

  @Get(":user_id")
  @ApiOperation({ summary: "Get appusers settings" })
  @ApiResponse({
    status: 200,
    description: "The appusers settings has been successfully retrieved.",
    type: Object,
  })
  async getAppUsersSettings(@Param("user_id") user_id: string) {
    this.logger.log(`Get appusers settings for user: ${user_id}`);
    const result = await this.appUsersNotificationSettingsService.findOne({
      user_id,
    });
    if (!result) {
      throw new NotFoundException("AppUsers settings not found!");
    }
    return result;
  }

  @Put(":user_id")
  @ApiOperation({ summary: "Update appusers settings" })
  @ApiResponse({
    status: 200,
    description: "The appusers settings has been successfully updated.",
    type: Object,
  })
  async update(
    @Param("user_id") user_id: string,
    @Body() data: UpdateAppUsersSettingsDto,
  ) {
    const existing = await this.appUsersNotificationSettingsService.findOne({
      user_id,
    });
    if (!existing) {
      throw new NotFoundException("AppUsers settings not found!");
    }
    this.logger.log(`Update appusers settings for user: ${user_id}`);
    const result = await this.appUsersNotificationSettingsService.updateOne(
      { user_id },
      data,
    );
    return result;
  }
}
