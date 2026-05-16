import { Module } from "@nestjs/common";
import { ScheduleModule as NestScheduleModule } from "@nestjs/schedule";
import { PrismaModule } from "@database/prisma.module";
import { NotificationsModule } from "@modules/notifications/notifications.module";
import { ScheduleController } from "./schedule.controller";
import { ScheduleService } from "./schedule.service";
import { ScheduleScheduler } from "./schedule.scheduler";

@Module({
  imports: [NestScheduleModule.forRoot(), PrismaModule, NotificationsModule],
  controllers: [ScheduleController],
  providers: [ScheduleService, ScheduleScheduler],
  exports: [ScheduleService],
})
export class ScheduleModule {}
