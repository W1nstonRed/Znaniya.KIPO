import { Module } from "@nestjs/common";
import { GroupsController } from "./groups.controller";
import { GroupsService } from "./groups.service";
import { PrismaModule } from "@database/prisma.module";
import { NotificationsModule } from "@modules/notifications/notifications.module";

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [GroupsController],
  providers: [GroupsService],
})
export class GroupsModule {}
