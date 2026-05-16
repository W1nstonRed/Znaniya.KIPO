import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { ScheduleService } from "./schedule.service";

@Injectable()
export class ScheduleScheduler {
  private readonly logger = new Logger(ScheduleScheduler.name);

  constructor(private readonly scheduleService: ScheduleService) {}

  @Cron("*/5 * * * *")
  async handleCron() {
    this.logger.log("Running schedule check cron");
    await this.scheduleService.checkForChanges();
  }

  // синхронизация списков групп и преподавателей раз в день
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async syncLists() {
    await this.scheduleService.syncGroups();
    await this.scheduleService.syncTeachers();
    await this.scheduleService.importCabinetsFromSchedule();
  }
}
