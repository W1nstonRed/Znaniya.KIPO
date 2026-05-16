import { Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { GetCurrentUser } from "@common/decorators/current-user.decorator";
import type { CurrentUser } from "@common/types/current-user";
import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";
import { NotificationsService } from "./notifications.service";

@Controller("notifications")
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  getAll(@GetCurrentUser() user: CurrentUser) {
    return this.notifications.getAll(user.id);
  }

  @Get("unread-count")
  getUnreadCount(@GetCurrentUser() user: CurrentUser) {
    return this.notifications.getUnreadCount(user.id);
  }

  @Patch(":id/read")
  markRead(@Param("id") id: string, @GetCurrentUser() user: CurrentUser) {
    return this.notifications.markRead(id, user.id);
  }

  @Patch("read-all")
  markAllRead(@GetCurrentUser() user: CurrentUser) {
    return this.notifications.markAllRead(user.id);
  }
}
