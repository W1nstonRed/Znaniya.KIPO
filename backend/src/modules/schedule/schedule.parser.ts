import * as crypto from "crypto";

export type ExternalLesson = {
  id: string;
  weekday: number;
  lesson: number;
  startTime: string;
  endTime: string;
  startTimeMin: number;
  endTimeMin: number;
  unionGroups: {
    id: string;
    group: { id: number; name: string };
    subgroup: string | null;
  }[];
  teachers: {
    id: number;
    fio: string;
  }[];
  subject: { id: number; name: string } | null;
  cabinet: {
    id: number;
    name: string;
    shortName: string | null;
    ignore: boolean;
  } | null;
  typeLesson: string | null;
};

export type ExternalSchedule = {
  startDate: string;
  endDate: string;
  group?: { id: number; name: string };
  teacher?: { id: number; fio: string };
  bells: {
    weekday: number;
    lesson: number;
    startTime: string;
    endTime: string;
    startTimeMin: number;
    endTimeMin: number;
  }[];
  lessons: ExternalLesson[];
};

export type LessonDiff = {
  type: "added" | "removed" | "changed";
  lesson: ExternalLesson;
  changes?: {
    field: string;
    before: unknown;
    after: unknown;
  }[];
};

export function hashSchedule(data: unknown): string {
  return crypto.createHash("md5").update(JSON.stringify(data)).digest("hex");
}

export function diffSchedules(
  before: ExternalSchedule,
  after: ExternalSchedule,
): LessonDiff[] {
  const diffs: LessonDiff[] = [];

  const beforeMap = new Map(before.lessons.map((l) => [l.id, l]));
  const afterMap = new Map(after.lessons.map((l) => [l.id, l]));

  // удалённые
  for (const [id, lesson] of beforeMap) {
    if (!afterMap.has(id)) {
      diffs.push({ type: "removed", lesson });
    }
  }

  // добавленные и изменённые
  for (const [id, after_lesson] of afterMap) {
    const before_lesson = beforeMap.get(id);

    if (!before_lesson) {
      diffs.push({ type: "added", lesson: after_lesson });
      continue;
    }

    const changes: LessonDiff["changes"] = [];

    // проверяем изменение времени
    if (
      before_lesson.weekday !== after_lesson.weekday ||
      before_lesson.lesson !== after_lesson.lesson
    ) {
      changes.push({
        field: "time",
        before: {
          weekday: before_lesson.weekday,
          lesson: before_lesson.lesson,
        },
        after: { weekday: after_lesson.weekday, lesson: after_lesson.lesson },
      });
    }

    // проверяем замену преподавателя
    const beforeTeacherIds = before_lesson.teachers.map((t) => t.id).sort();
    const afterTeacherIds = after_lesson.teachers.map((t) => t.id).sort();
    if (JSON.stringify(beforeTeacherIds) !== JSON.stringify(afterTeacherIds)) {
      changes.push({
        field: "teacher",
        before: before_lesson.teachers,
        after: after_lesson.teachers,
      });
    }

    // проверяем смену кабинета
    if (before_lesson.cabinet?.id !== after_lesson.cabinet?.id) {
      changes.push({
        field: "cabinet",
        before: before_lesson.cabinet?.name,
        after: after_lesson.cabinet?.name,
      });
    }

    // проверяем смену предмета
    if (before_lesson.subject?.id !== after_lesson.subject?.id) {
      changes.push({
        field: "subject",
        before: before_lesson.subject?.name,
        after: after_lesson.subject?.name,
      });
    }

    if (changes.length > 0) {
      diffs.push({ type: "changed", lesson: after_lesson, changes });
    }
  }

  return diffs;
}

export function formatDiffMessage(diffs: LessonDiff[]): string {
  const lines: string[] = [];

  for (const diff of diffs) {
    const subject = diff.lesson.subject?.name ?? "Пара";
    const day = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб"][diff.lesson.weekday - 1];
    const time = `${day} ${diff.lesson.startTime}`;

    if (diff.type === "added") {
      lines.push(`+ Добавлена: ${subject} (${time})`);
    } else if (diff.type === "removed") {
      lines.push(`- Удалена: ${subject} (${time})`);
    } else if (diff.changes) {
      for (const change of diff.changes) {
        if (change.field === "teacher") {
          const before = Array.isArray(change.before)
            ? change.before
                .map((teacher) =>
                  typeof teacher === "object" && teacher !== null
                    ? (teacher as { fio?: string }).fio
                    : String(teacher),
                )
                .join(", ")
            : String(change.before);
          const after = Array.isArray(change.after)
            ? change.after
                .map((teacher) =>
                  typeof teacher === "object" && teacher !== null
                    ? (teacher as { fio?: string }).fio
                    : String(teacher),
                )
                .join(", ")
            : String(change.after);

          lines.push(
            `⇄ Замена преподавателя: ${subject} (${time}) — ${before} → ${after}`,
          );
        } else if (change.field === "cabinet") {
          lines.push(
            `⇄ Смена кабинета: ${subject} (${time}) — ${change.before} → ${change.after}`,
          );
        } else if (change.field === "time") {
          lines.push(`⇄ Перенос: ${subject}`);
        } else if (change.field === "subject") {
          lines.push(
            `⇄ Смена предмета (${time}) — ${change.before} → ${change.after}`,
          );
        }
      }
    }
  }

  return lines.join("\n");
}
