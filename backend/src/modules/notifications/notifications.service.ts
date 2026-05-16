import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "@database/prisma.service";
import { apiError } from "@common/errors/api-error";
import { PushService } from "@modules/push/push.service";

type NotificationPayload = {
  type: string;
  title: string;
  body: string;
  data?: unknown;
  url?: string;
  push?: boolean;
};

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly push: PushService,
  ) {}

  getAll(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  async createForUser(userId: string, payload: NotificationPayload) {
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        type: payload.type,
        title: payload.title,
        body: payload.body,
        data: payload.data as Prisma.InputJsonValue | undefined,
      },
    });

    if (payload.push !== false) {
      await this.push.sendToUser(
        userId,
        payload.title,
        payload.body,
        payload.url,
      );
    }

    return notification;
  }

  async createForUsers(userIds: string[], payload: NotificationPayload) {
    const uniqueUserIds = [...new Set(userIds)].filter(Boolean);
    if (uniqueUserIds.length === 0) return { count: 0 };

    await this.prisma.notification.createMany({
      data: uniqueUserIds.map((userId) => ({
        userId,
        type: payload.type,
        title: payload.title,
        body: payload.body,
        data: payload.data as Prisma.InputJsonValue | undefined,
      })),
    });

    if (payload.push !== false) {
      await this.push.sendToUsers(
        uniqueUserIds,
        payload.title,
        payload.body,
        payload.url,
      );
    }

    return { count: uniqueUserIds.length };
  }

  async markRead(id: string, userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true },
    });

    if (result.count === 0) {
      throw new NotFoundException(
        apiError("NOTIFICATION_NOT_FOUND", "Уведомление не найдено"),
      );
    }

    return { updated: result.count };
  }

  async markAllRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    return { updated: result.count };
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, read: false },
    });

    return { count };
  }
}
