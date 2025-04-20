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
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { InAppNotificationService } from "./in-app-notification.service";
import { QueryInAppNotificationDto } from "./dto/query-in-app-notification.dto";

@ApiTags("in-app-notifications")
@ApiBearerAuth()
@Controller("in-app-notifications")
export class InAppNotificationController {
  constructor(
    private readonly inAppNotificationService: InAppNotificationService,
  ) {}

  @Get("user/:userId")
  @ApiOperation({ summary: "Get all notifications for a specific user" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "User notifications retrieved successfully",
  })
  findAllForUser(
    @Param("userId") userId: string,
    @Query() query: QueryInAppNotificationDto,
  ) {
    return this.inAppNotificationService.findMany(query);
  }

  @Get("user/:userId/count-unread")
  @ApiOperation({ summary: "Count unread notifications for a specific user" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Unread count retrieved successfully",
  })
  countUnreadForUser(@Param("userId") userId: string) {
    return this.inAppNotificationService.countUnreadForUser(userId);
  }

  @Put(":id/mark-as-read")
  @ApiOperation({ summary: "Mark a notification as read" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Notification marked as read successfully",
  })
  markAsRead(@Param("id") id: string) {
    return this.inAppNotificationService.markAsRead(id);
  }

  @Put("user/:userId/mark-all-as-read")
  @ApiOperation({ summary: "Mark all notifications as read for a user" })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: "All notifications marked as read",
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  markAllAsRead(@Param("userId") userId: string) {
    return this.inAppNotificationService.markAllAsRead(userId);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a notification (soft delete)" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Notification deleted successfully",
  })
  softDelete(@Param("id") id: string) {
    return this.inAppNotificationService.softDelete(id);
  }
}
