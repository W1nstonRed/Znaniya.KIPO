import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "@modules/auth/auth.module";
import { GroupsModule } from "@modules/groups/groups.module";
import { HealthController } from "@modules/health.controller";
import { SpecializationsModule } from "@modules/specializations/specializations.module";
import { StudentsModule } from "@modules/students/students.module";
import { ScheduleModule } from "./modules/schedule/schedule.module";
import { NotificationsModule } from "@modules/notifications/notifications.module";
import { PushModule } from "@modules/push/push.module";
import { CabinetsModule } from "./modules/cabinets/cabinets.module";
import { FilesModule } from "@modules/files/files.module";
import { JournalModule } from "@modules/journal/journal.module";
import { TestsModule } from "@modules/tests/tests.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    GroupsModule,
    SpecializationsModule,
    StudentsModule,
    ScheduleModule,
    NotificationsModule,
    PushModule,
    CabinetsModule,
    FilesModule,
    JournalModule,
    TestsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
