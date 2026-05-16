import { Module } from "@nestjs/common";
import { PrismaModule } from "@database/prisma.module";
import { PushModule } from "@modules/push/push.module";
import { NotificationsController } from "./notifications.controller";
import { NotificationsService } from "./notifications.service";

@Module({
  imports: [PrismaModule, PushModule],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
