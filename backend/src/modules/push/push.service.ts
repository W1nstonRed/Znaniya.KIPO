import { Injectable, OnModuleInit } from "@nestjs/common";
import * as webpush from "web-push";
import type { SubscribeDto } from "./dto/subscribe.dto";
import { PrismaService } from "@database/prisma.service";

@Injectable()
export class PushService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    webpush.setVapidDetails(
      process.env.VAPID_MAILTO!,
      process.env.VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!,
    );
  }

  async subscribe(userId: string, dto: SubscribeDto) {
    await this.prisma.pushSubscription.upsert({
      where: { endpoint: dto.endpoint },
      update: {
        p256dh: dto.keys.p256dh,
        auth: dto.keys.auth,
        userId,
      },
      create: {
        endpoint: dto.endpoint,
        p256dh: dto.keys.p256dh,
        auth: dto.keys.auth,
        userId,
      },
    });

    return { ok: true };
  }

  async unsubscribe(userId: string, endpoint: string) {
    await this.prisma.pushSubscription.deleteMany({
      where: { endpoint, userId },
    });

    return { ok: true };
  }

  async sendToUser(userId: string, title: string, body: string, url?: string) {
    const subscriptions = await this.prisma.pushSubscription.findMany({
      where: { userId },
    });

    await this.sendToSubscriptions(subscriptions, title, body, url);
  }

  async sendToAll(title: string, body: string, url?: string) {
    const subscriptions = await this.prisma.pushSubscription.findMany();
    await this.sendToSubscriptions(subscriptions, title, body, url);
  }

  async sendToUsers(
    userIds: string[],
    title: string,
    body: string,
    url?: string,
  ) {
    const subscriptions = await this.prisma.pushSubscription.findMany({
      where: { userId: { in: userIds } },
    });

    await this.sendToSubscriptions(subscriptions, title, body, url);
  }

  private async sendToSubscriptions(
    subscriptions: { endpoint: string; p256dh: string; auth: string }[],
    title: string,
    body: string,
    url?: string,
  ) {
    const payload = JSON.stringify({ title, body, url });

    const results = await Promise.allSettled(
      subscriptions.map((sub) =>
        webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload,
        ),
      ),
    );

    // Удаляем невалидные подписки (410 Gone — пользователь отписался)
    const invalidEndpoints: string[] = [];
    results.forEach((result, i) => {
      if (result.status === "rejected") {
        const status = result.reason?.statusCode;
        if (status === 410 || status === 404) {
          invalidEndpoints.push(subscriptions[i].endpoint);
        }
      }
    });

    if (invalidEndpoints.length > 0) {
      await this.prisma.pushSubscription.deleteMany({
        where: { endpoint: { in: invalidEndpoints } },
      });
    }
  }
}
