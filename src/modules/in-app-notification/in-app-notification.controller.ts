import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Delete,
  Put,
  HttpStatus,
  HttpCode,
  UseGuards,
  NotFoundException,
} from "@nestjs/common";
import { AuthGuard } from "src/modules/auth/guards/auth.guard";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { InAppNotificationService } from "./in-app-notification.service";
import { QueryInAppNotificationDto } from "./dto/query-in-app-notification.dto";

@ApiTags("In App Notifications")
@ApiBearerAuth()
@Controller("v1/in-app-notifications")
@UseGuards(AuthGuard)
export class InAppNotificationController {
  constructor(
    private readonly inAppNotificationService: InAppNotificationService,
  ) {}

  @Get("users/:user_id")
  @ApiOperation({ summary: "Get all notifications for a specific user" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "User notifications retrieved successfully",
  })
  getUserNotifications(
    @Param("user_id") user_id: string,
    @Query() query: QueryInAppNotificationDto,
  ) {
    return this.inAppNotificationService.paginate({
      user_id,
      ...query,
      is_deleted: false,
    });
  }

  @Get("users/:user_id/count-unreads")
  @ApiOperation({ summary: "Count unread notifications for a specific user" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Unread count retrieved successfully",
  })
  async countUserUnreadNotifications(@Param("user_id") user_id: string) {
    const result = await this.inAppNotificationService.countUnreadForUser(
      user_id,
    );
    return result;
  }

  @Put("users/:user_id/mark-as-reads/:_id")
  @ApiOperation({ summary: "Mark a notification as read" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Notification marked as read successfully",
  })
  async markAsRead(
    @Param("user_id") user_id: string,
    @Param("_id") _id: string,
  ) {
    const notification = await this.inAppNotificationService.findOne({
      user_id,
      _id,
      is_deleted: false,
    });
    if (!notification) {
      throw new NotFoundException("Notification not found");
    }
    const result = await this.inAppNotificationService.markAsRead(_id);
    return result;
  }

  @Put("users/:user_id/mark-all-as-reads")
  @ApiOperation({ summary: "Mark all notifications as read for a user" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "All notifications marked as read",
  })
  async markAllUserNotificationsAsRead(@Param("user_id") user_id: string) {
    const result =
      await this.inAppNotificationService.markAllUserNotificationsAsRead(
        user_id,
      );
    return result;
  }

  @Delete("users/:user_id/:_id")
  @ApiOperation({ summary: "Delete a notification (soft delete)" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Notification deleted successfully",
  })
  async softDelete(
    @Param("user_id") user_id: string,
    @Param("_id") _id: string,
  ) {
    const notification = await this.inAppNotificationService.findOne({
      _id,
      user_id,
      is_deleted: false,
    });
    if (!notification) {
      throw new NotFoundException("Notification not found");
    }
    const result = await this.inAppNotificationService.softDelete(_id);
    return result;
  }
}
