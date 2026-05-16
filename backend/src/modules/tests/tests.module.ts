import { Module } from "@nestjs/common";
import { PrismaModule } from "@database/prisma.module";
import { NotificationsModule } from "@modules/notifications/notifications.module";
import { TestsController } from "./tests.controller";
import { TestsService } from "./tests.service";

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [TestsController],
  providers: [TestsService],
})
export class TestsModule {}
