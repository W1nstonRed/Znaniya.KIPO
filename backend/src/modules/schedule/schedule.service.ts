import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ScheduleEntityType } from "@prisma/client";
import { PrismaService } from "@database/prisma.service";
import { apiError } from "@common/errors/api-error";
import {
  normalizeGroupName,
  normalizeTeacherName,
} from "@common/utils/normalize";
import { NotificationsService } from "@modules/notifications/notifications.service";
import {
  type ExternalLesson,
  type ExternalSchedule,
  hashSchedule,
  diffSchedules,
  formatDiffMessage,
  type LessonDiff,
} from "./schedule.parser";

const DEFAULT_PUBLICATION_ID = "35ddcc86-1bc0-4f83-ae44-ad3abbeaf4ca";
const DEFAULT_BASE_URL = "https://schedule.mstimetables.ru/api/publications";

type ScheduleKind = "group" | "teacher";

type AddFavoriteData = {
  scheduleGroupId?: number;
  scheduleTeacherId?: number;
  externalGroupId?: number;
  externalTeacherId?: number;
};

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger(ScheduleService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly notifications: NotificationsService,
  ) {}

  async getGroups() {
    const cached = await this.prisma.scheduleGroupExternal.findMany({
      include: { group: { include: { specialty: true } } },
      orderBy: { name: "asc" },
    });
    if (cached.length > 0) return cached;

    return this.syncGroups();
  }

  async getTeachers() {
    const cached = await this.prisma.scheduleTeacherExternal.findMany({
      include: { teacher: true },
      orderBy: { fio: "asc" },
    });
    if (cached.length > 0) return cached;

    return this.syncTeachers();
  }

  async syncGroups() {
    const data = await this.fetchJson<{ id: number; name: string }[]>(
      `${this.baseUrl}/${this.publicationId}/groups`,
    );

    for (const group of data) {
      await this.ensureExternalGroup(group.id, group.name);
    }

    return this.prisma.scheduleGroupExternal.findMany({
      include: { group: { include: { specialty: true } } },
      orderBy: { name: "asc" },
    });
  }

  async syncTeachers() {
    const data = await this.fetchJson<{ id: number; fio: string }[]>(
      `${this.baseUrl}/${this.publicationId}/teachers`,
    );

    for (const teacher of data) {
      await this.ensureExternalTeacher(teacher.id, teacher.fio);
    }

    return this.prisma.scheduleTeacherExternal.findMany({
      include: { teacher: true },
      orderBy: { fio: "asc" },
    });
  }

  async getGroupSchedule(
    groupId: number,
    date: string,
  ): Promise<ExternalSchedule> {
    const id = this.normalizeExternalId(groupId, "GROUP_NOT_FOUND");
    const weekStart = this.getWeekStart(date);
    const data = await this.fetchGroupSchedule(id, date);

    await this.persistScheduleEntities(data);
    await this.saveCache("group", id, weekStart, data);

    return data;
  }

  async getTeacherSchedule(teacherId: number, date: string) {
    const id = this.normalizeExternalId(teacherId, "TEACHER_NOT_FOUND");
    const externalTeacher = await this.prisma.scheduleTeacherExternal.findUnique({
      where: { id },
      include: { teacher: { include: { externalTeachers: true } } },
    });

    const externalTeachers = externalTeacher?.teacher?.externalTeachers.length
      ? externalTeacher.teacher.externalTeachers
      : externalTeacher
        ? [externalTeacher]
        : [{ id, fio: "" }];

    const schedules = [];
    const weekStart = this.getWeekStart(date);

    for (const external of externalTeachers) {
      const schedule = await this.fetchTeacherSchedule(external.id, date);
      await this.persistScheduleEntities(schedule);
      await this.saveCache("teacher", external.id, weekStart, schedule);
      schedules.push({
        externalTeacherId: external.id,
        fio: schedule.teacher?.fio ?? external.fio,
        schedule,
      });
    }

    return {
      teacher: externalTeacher?.teacher ?? null,
      externalTeacherIds: schedules.map((item) => item.externalTeacherId),
      schedules,
    };
  }

  async getFreeCabinets(date: string, lessonNumber: number, building?: string) {
    const lessonDate = this.parseDateOnly(date);
    const nextDate = new Date(lessonDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const cabinetWhere = {
      ignore: false,
      ...(building ? { building } : {}),
    };

    const [allCabinets, busyLessons] = await Promise.all([
      this.prisma.cabinet.findMany({
        where: cabinetWhere,
        orderBy: [{ building: "asc" }, { name: "asc" }],
      }),
      this.prisma.lesson.findMany({
        where: {
          date: { gte: lessonDate, lt: nextDate },
          lessonNumber,
          cabinetId: { not: null },
          cabinet: cabinetWhere,
        },
        select: { cabinetId: true },
      }),
    ]);

    const busyCabinetIds = new Set(
      busyLessons.map((lesson) => lesson.cabinetId).filter(Boolean),
    );

    return {
      free: allCabinets.filter((cabinet) => !busyCabinetIds.has(cabinet.id)),
      busy: allCabinets.filter((cabinet) => busyCabinetIds.has(cabinet.id)),
    };
  }

  async getFavorites(userId: string) {
    const [groups, teachers] = await Promise.all([
      this.prisma.scheduleFavoriteGroup.findMany({
        where: { userId },
        include: { externalGroup: { include: { group: true } } },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.scheduleFavoriteTeacher.findMany({
        where: { userId },
        include: { externalTeacher: { include: { teacher: true } } },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return { groups, teachers };
  }

  async addFavorite(userId: string, data: AddFavoriteData) {
    const externalGroupId = data.externalGroupId ?? data.scheduleGroupId;
    const externalTeacherId = data.externalTeacherId ?? data.scheduleTeacherId;

    if ((externalGroupId && externalTeacherId) || (!externalGroupId && !externalTeacherId)) {
      throw new BadRequestException(
        apiError(
          "SCHEDULE_FAVORITE_TARGET_REQUIRED",
          "Нужно передать externalGroupId или externalTeacherId",
        ),
      );
    }

    if (externalGroupId) {
      await this.ensureExternalGroupExists(externalGroupId);
      return this.prisma.scheduleFavoriteGroup.upsert({
        where: {
          userId_externalGroupId: { userId, externalGroupId },
        },
        update: {},
        create: { userId, externalGroupId },
        include: { externalGroup: { include: { group: true } } },
      });
    }

    const teacherId = externalTeacherId as number;
    await this.ensureExternalTeacherExists(teacherId);
    return this.prisma.scheduleFavoriteTeacher.upsert({
      where: {
        userId_externalTeacherId: { userId, externalTeacherId: teacherId },
      },
      update: {},
      create: { userId, externalTeacherId: teacherId },
      include: { externalTeacher: { include: { teacher: true } } },
    });
  }

  async removeFavorite(id: string, userId: string) {
    const [groups, teachers] = await Promise.all([
      this.prisma.scheduleFavoriteGroup.deleteMany({
        where: { id, userId },
      }),
      this.prisma.scheduleFavoriteTeacher.deleteMany({
        where: { id, userId },
      }),
    ]);

    return { deleted: groups.count + teachers.count };
  }

  async checkForChanges() {
    this.logger.log("Checking schedule changes...");

    const [groupFavorites, teacherFavorites] = await Promise.all([
      this.prisma.scheduleFavoriteGroup.findMany({
        select: { externalGroupId: true },
      }),
      this.prisma.scheduleFavoriteTeacher.findMany({
        select: { externalTeacherId: true },
      }),
    ]);

    const today = new Date().toISOString().split("T")[0];
    const checked = new Set<string>();

    for (const favorite of groupFavorites) {
      const key = `group:${favorite.externalGroupId}`;
      if (checked.has(key)) continue;
      checked.add(key);
      await this.safeCheckSingleSchedule("group", favorite.externalGroupId, today);
    }

    for (const favorite of teacherFavorites) {
      const key = `teacher:${favorite.externalTeacherId}`;
      if (checked.has(key)) continue;
      checked.add(key);
      await this.safeCheckSingleSchedule(
        "teacher",
        favorite.externalTeacherId,
        today,
      );
    }
  }

  async importCabinetsFromSchedule() {
    const caches = await this.prisma.scheduleCache.findMany();
    const cabinetNames = new Map<string, { shortName?: string | null }>();

    for (const cache of caches) {
      const schedule = cache.data as ExternalSchedule;
      for (const lesson of schedule.lessons) {
        if (lesson.cabinet && !lesson.cabinet.ignore) {
          cabinetNames.set(lesson.cabinet.name, {
            shortName: lesson.cabinet.shortName,
          });
        }
      }
    }

    for (const [name, cabinet] of cabinetNames) {
      await this.ensureCabinet(name, cabinet.shortName);
    }

    this.logger.log(
      `Imported ${cabinetNames.size} cabinets from schedule cache`,
    );

    return { imported: cabinetNames.size };
  }

  private async safeCheckSingleSchedule(
    type: ScheduleKind,
    externalId: number,
    date: string,
  ) {
    try {
      await this.checkSingleSchedule(type, externalId, date);
    } catch (e) {
      this.logger.error(`Failed to check ${type}:${externalId}: ${e}`);
    }
  }

  private async checkSingleSchedule(
    type: ScheduleKind,
    externalId: number,
    date: string,
  ) {
    const weekStart = this.getWeekStart(date);
    const entityType = this.toEntityType(type);

    const existing = await this.prisma.scheduleCache.findUnique({
      where: {
        type_externalId_weekStart: { type: entityType, externalId, weekStart },
      },
    });

    const fresh =
      type === "group"
        ? await this.fetchGroupSchedule(externalId, date)
        : await this.fetchTeacherSchedule(externalId, date);

    await this.persistScheduleEntities(fresh);
    await this.saveCache(type, externalId, weekStart, fresh);

    const newHash = hashSchedule(fresh);
    if (!existing || existing.hash === newHash) return;

    const diffs = diffSchedules(existing.data as ExternalSchedule, fresh);
    if (diffs.length === 0) return;

    await this.prisma.scheduleChange.create({
      data: {
        type: entityType,
        externalId,
        weekStart,
        diff: diffs as never,
      },
    });

    const name = await this.getScheduleEntityName(type, externalId);
    const body = formatDiffMessage(diffs);
    const recipients = await this.getScheduleRecipients(type, externalId, diffs);

    await this.notifications.createForUsers(recipients, {
      type: "schedule_change",
      title: `Изменение в расписании - ${name}`,
      body,
      data: { type, externalId, weekStart: weekStart.toISOString(), diffs },
      url: "/schedule",
    });

    this.logger.log(
      `Changes detected for ${type}:${externalId}, notified ${recipients.length} users`,
    );
  }

  private async saveCache(
    type: ScheduleKind,
    externalId: number,
    weekStart: Date,
    data: ExternalSchedule,
  ) {
    const entityType = this.toEntityType(type);
    const hash = hashSchedule(data);

    await this.prisma.scheduleCache.upsert({
      where: {
        type_externalId_weekStart: { type: entityType, externalId, weekStart },
      },
      update: { data: data as never, hash },
      create: {
        type: entityType,
        externalId,
        weekStart,
        data: data as never,
        hash,
      },
    });
  }

  private async persistScheduleEntities(schedule: ExternalSchedule) {
    const groups = new Map<number, string>();
    const teachers = new Map<number, string>();

    if (schedule.group) groups.set(schedule.group.id, schedule.group.name);
    if (schedule.teacher) teachers.set(schedule.teacher.id, schedule.teacher.fio);

    for (const lesson of schedule.lessons) {
      for (const unionGroup of lesson.unionGroups) {
        groups.set(unionGroup.group.id, unionGroup.group.name);
      }

      for (const teacher of lesson.teachers) {
        teachers.set(teacher.id, teacher.fio);
      }

      if (lesson.subject?.name) {
        await this.ensureSubject(lesson.subject.name);
      }

      if (lesson.cabinet && !lesson.cabinet.ignore) {
        await this.ensureCabinet(lesson.cabinet.name, lesson.cabinet.shortName);
      }
    }

    for (const [id, name] of groups) {
      await this.ensureExternalGroup(id, name);
    }

    for (const [id, fio] of teachers) {
      await this.ensureExternalTeacher(id, fio);
    }

    await this.persistLessons(schedule);
  }

  private async persistLessons(schedule: ExternalSchedule) {
    for (const externalLesson of schedule.lessons) {
      const groupIds = await this.resolveLessonGroupIds(schedule, externalLesson);
      if (groupIds.length === 0) continue;

      const subject = externalLesson.subject?.name
        ? await this.ensureSubject(externalLesson.subject.name)
        : null;
      const cabinet =
        externalLesson.cabinet && !externalLesson.cabinet.ignore
          ? await this.ensureCabinet(
              externalLesson.cabinet.name,
              externalLesson.cabinet.shortName,
            )
          : null;
      const teacherIds = await this.resolveTeacherIds(externalLesson);
      const lessonDate = this.getDateForWeekday(
        schedule.startDate,
        externalLesson.weekday,
      );

      for (const groupId of groupIds) {
        const lesson = await this.prisma.lesson.upsert({
          where: {
            externalLessonId_groupId: {
              externalLessonId: externalLesson.id,
              groupId,
            },
          },
          update: {
            date: lessonDate,
            lessonNumber: externalLesson.lesson,
            startTime: externalLesson.startTime,
            endTime: externalLesson.endTime,
            typeLesson: externalLesson.typeLesson,
            subjectId: subject?.id,
            teacherId: teacherIds[0]?.teacherId,
            cabinetId: cabinet?.id,
            cabinetName: externalLesson.cabinet?.name,
            building: cabinet?.building,
          },
          create: {
            externalLessonId: externalLesson.id,
            date: lessonDate,
            lessonNumber: externalLesson.lesson,
            startTime: externalLesson.startTime,
            endTime: externalLesson.endTime,
            typeLesson: externalLesson.typeLesson,
            groupId,
            subjectId: subject?.id,
            teacherId: teacherIds[0]?.teacherId,
            cabinetId: cabinet?.id,
            cabinetName: externalLesson.cabinet?.name,
            building: cabinet?.building,
          },
        });

        await this.prisma.lessonTeacher.deleteMany({
          where: { lessonId: lesson.id },
        });

        if (teacherIds.length > 0) {
          await this.prisma.lessonTeacher.createMany({
            data: teacherIds.map((teacher) => ({
              lessonId: lesson.id,
              teacherId: teacher.teacherId,
              externalTeacherId: teacher.externalTeacherId,
            })),
          });
        }
      }
    }
  }

  private async resolveLessonGroupIds(
    schedule: ExternalSchedule,
    lesson: ExternalLesson,
  ): Promise<string[]> {
    const externalIds =
      lesson.unionGroups.length > 0
        ? lesson.unionGroups.map((item) => item.group.id)
        : schedule.group
          ? [schedule.group.id]
          : [];

    if (externalIds.length === 0) return [];

    const externalGroups = await this.prisma.scheduleGroupExternal.findMany({
      where: { id: { in: externalIds } },
      select: { groupId: true },
    });

    return [
      ...new Set(
        externalGroups
          .map((externalGroup) => externalGroup.groupId)
          .filter((groupId): groupId is string => Boolean(groupId)),
      ),
    ];
  }

  private async resolveTeacherIds(lesson: ExternalLesson) {
    if (lesson.teachers.length === 0) return [];

    const externalTeachers = await this.prisma.scheduleTeacherExternal.findMany({
      where: { id: { in: lesson.teachers.map((teacher) => teacher.id) } },
      select: { id: true, teacherId: true },
    });

    return externalTeachers
      .filter((teacher) => teacher.teacherId)
      .map((teacher) => ({
        externalTeacherId: teacher.id,
        teacherId: teacher.teacherId as string,
      }));
  }

  private async ensureExternalGroup(id: number, name: string) {
    const normalizedName = normalizeGroupName(name);
    const group = await this.prisma.group.upsert({
      where: { normalizedName },
      update: {},
      create: {
        name,
        normalizedName,
      },
    });

    return this.prisma.scheduleGroupExternal.upsert({
      where: { id },
      update: {
        name,
        normalizedName,
        groupId: group.id,
      },
      create: {
        id,
        name,
        normalizedName,
        groupId: group.id,
      },
    });
  }

  private async ensureExternalTeacher(id: number, fio: string) {
    const fullName = this.canonicalTeacherName(fio);
    const normalizedFullName = normalizeTeacherName(fio);
    const teacher = await this.prisma.teacher.upsert({
      where: { normalizedFullName },
      update: {
        fullName,
      },
      create: {
        fullName,
        normalizedFullName,
      },
    });

    return this.prisma.scheduleTeacherExternal.upsert({
      where: { id },
      update: {
        fio,
        normalizedFio: normalizedFullName,
        teacherId: teacher.id,
      },
      create: {
        id,
        fio,
        normalizedFio: normalizedFullName,
        teacherId: teacher.id,
      },
    });
  }

  private async ensureSubject(name: string) {
    return this.prisma.subject.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  private async ensureCabinet(name: string, shortName?: string | null) {
    const parsed = this.parseCabinet(name);
    return this.prisma.cabinet.upsert({
      where: { name },
      update: {
        shortName: shortName ?? undefined,
        building: parsed.building ?? undefined,
        floor: parsed.floor ?? undefined,
      },
      create: {
        name,
        shortName,
        building: parsed.building,
        floor: parsed.floor,
      },
    });
  }

  private async ensureExternalGroupExists(id: number) {
    const group = await this.prisma.scheduleGroupExternal.findUnique({
      where: { id },
    });

    if (!group) {
      await this.syncGroups();
    }

    const synced = await this.prisma.scheduleGroupExternal.findUnique({
      where: { id },
    });

    if (!synced) {
      throw new NotFoundException(
        apiError("SCHEDULE_GROUP_NOT_FOUND", "Группа расписания не найдена"),
      );
    }
  }

  private async ensureExternalTeacherExists(id: number) {
    const teacher = await this.prisma.scheduleTeacherExternal.findUnique({
      where: { id },
    });

    if (!teacher) {
      await this.syncTeachers();
    }

    const synced = await this.prisma.scheduleTeacherExternal.findUnique({
      where: { id },
    });

    if (!synced) {
      throw new NotFoundException(
        apiError(
          "SCHEDULE_TEACHER_NOT_FOUND",
          "Преподаватель расписания не найден",
        ),
      );
    }
  }

  private async fetchGroupSchedule(
    groupId: number,
    date: string,
  ): Promise<ExternalSchedule> {
    return this.fetchSchedule("group", groupId, date);
  }

  private async fetchTeacherSchedule(
    teacherId: number,
    date: string,
  ): Promise<ExternalSchedule> {
    return this.fetchSchedule("teacher", teacherId, date);
  }

  private async fetchSchedule(
    type: ScheduleKind,
    externalId: number,
    date: string,
  ): Promise<ExternalSchedule> {
    const endpoint =
      type === "group"
        ? `${this.baseUrl}/group/lessons`
        : `${this.baseUrl}/teacher/lessons`;
    const idKey = type === "group" ? "groupId" : "teacherId";

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        [idKey]: externalId,
        date,
        publicationId: this.publicationId,
      }),
    });

    if (!res.ok) {
      throw new BadGatewayException(
        apiError(
          "SCHEDULE_SOURCE_UNAVAILABLE",
          "Не удалось получить расписание",
          { status: res.status },
        ),
      );
    }

    return (await res.json()) as ExternalSchedule;
  }

  private async fetchJson<T>(url: string): Promise<T> {
    const res = await fetch(url);
    if (!res.ok) {
      throw new BadGatewayException(
        apiError(
          "SCHEDULE_SOURCE_UNAVAILABLE",
          "Не удалось получить данные расписания",
          { status: res.status },
        ),
      );
    }

    return (await res.json()) as T;
  }

  private async getScheduleRecipients(
    type: ScheduleKind,
    externalId: number,
    diffs: LessonDiff[],
  ): Promise<string[]> {
    const recipients = new Set<string>();

    if (type === "group") {
      const [favorites, externalGroup] = await Promise.all([
        this.prisma.scheduleFavoriteGroup.findMany({
          where: { externalGroupId: externalId },
          select: { userId: true },
        }),
        this.prisma.scheduleGroupExternal.findUnique({
          where: { id: externalId },
          include: {
            group: {
              include: {
                students: { select: { userId: true } },
                curatorTeacher: { select: { userId: true } },
              },
            },
          },
        }),
      ]);

      favorites.forEach((favorite) => recipients.add(favorite.userId));
      externalGroup?.group?.students.forEach((student) => {
        if (student.userId) recipients.add(student.userId);
      });
      if (externalGroup?.group?.curatorTeacher?.userId) {
        recipients.add(externalGroup.group.curatorTeacher.userId);
      }
      if (externalGroup?.group?.curatorAdminId) {
        recipients.add(externalGroup.group.curatorAdminId);
      }
    } else {
      const [favorites, externalTeacher] = await Promise.all([
        this.prisma.scheduleFavoriteTeacher.findMany({
          where: { externalTeacherId: externalId },
          select: { userId: true },
        }),
        this.prisma.scheduleTeacherExternal.findUnique({
          where: { id: externalId },
          include: { teacher: { select: { userId: true } } },
        }),
      ]);

      favorites.forEach((favorite) => recipients.add(favorite.userId));
      if (externalTeacher?.teacher?.userId) {
        recipients.add(externalTeacher.teacher.userId);
      }
    }

    const changedTeacherExternalIds = this.extractChangedTeacherIds(diffs);
    if (changedTeacherExternalIds.length > 0) {
      const teachers = await this.prisma.scheduleTeacherExternal.findMany({
        where: { id: { in: changedTeacherExternalIds } },
        include: { teacher: { select: { userId: true } } },
      });

      teachers.forEach((teacher) => {
        if (teacher.teacher?.userId) recipients.add(teacher.teacher.userId);
      });
    }

    return [...recipients];
  }

  private extractChangedTeacherIds(diffs: LessonDiff[]): number[] {
    const ids = new Set<number>();

    for (const diff of diffs) {
      diff.lesson.teachers.forEach((teacher) => ids.add(teacher.id));
      diff.changes
        ?.filter((change) => change.field === "teacher")
        .forEach((change) => {
          for (const value of [change.before, change.after]) {
            if (!Array.isArray(value)) continue;
            value.forEach((teacher) => {
              if (
                typeof teacher === "object" &&
                teacher !== null &&
                typeof (teacher as { id?: unknown }).id === "number"
              ) {
                ids.add((teacher as { id: number }).id);
              }
            });
          }
        });
    }

    return [...ids];
  }

  private async getScheduleEntityName(type: ScheduleKind, externalId: number) {
    if (type === "group") {
      const group = await this.prisma.scheduleGroupExternal.findUnique({
        where: { id: externalId },
      });
      return group?.name ?? `Группа ${externalId}`;
    }

    const teacher = await this.prisma.scheduleTeacherExternal.findUnique({
      where: { id: externalId },
    });
    return teacher?.fio ?? `Преподаватель ${externalId}`;
  }

  private getWeekStart(date: string): Date {
    const d = this.parseDateOnly(date);
    const day = d.getDay() || 7;
    d.setDate(d.getDate() - day + 1);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private getDateForWeekday(weekDate: string, weekday: number): Date {
    const start = this.getWeekStart(weekDate);
    start.setDate(start.getDate() + weekday - 1);
    return start;
  }

  private parseDateOnly(date: string): Date {
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException(
        apiError("INVALID_DATE", "Дата должна быть в формате ISO"),
      );
    }

    parsed.setHours(0, 0, 0, 0);
    return parsed;
  }

  private normalizeExternalId(value: number, code: string) {
    const id = Number(value);
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException(
        apiError(code, "Некорректный внешний ID расписания"),
      );
    }

    return id;
  }

  private toEntityType(type: ScheduleKind): ScheduleEntityType {
    return type === "group"
      ? ScheduleEntityType.GROUP
      : ScheduleEntityType.TEACHER;
  }

  private canonicalTeacherName(value: string): string {
    return value.trim().replace(/\*+$/g, "").trim();
  }

  private parseCabinet(name: string) {
    const building =
      name.match(/(?:корпус|к)\.?\s*([a-zа-я0-9]+)/i)?.[1] ??
      name.match(/^([a-zа-я0-9]+)[-\s]/i)?.[1] ??
      null;
    const floorMatch = name.match(/\d/);

    return {
      building,
      floor: floorMatch ? Number(floorMatch[0]) : null,
    };
  }

  private get publicationId() {
    return this.config.get<string>("SCHEDULE_PUBLICATION_ID", DEFAULT_PUBLICATION_ID);
  }

  private get baseUrl() {
    return this.config.get<string>("SCHEDULE_BASE_URL", DEFAULT_BASE_URL);
  }
}
