import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "@database/prisma.service";
import { apiError } from "@common/errors/api-error";
import {
  AttachLessonMaterialDto,
  CreateGradeCommentDto,
  CreateLessonPlanDto,
  UpdateLessonDto,
  UpsertGradeDto,
} from "./journal.dto";

@Injectable()
export class JournalService {
  constructor(private readonly prisma: PrismaService) {}

  async getGroupJournal(groupId: string) {
    const journal = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        students: { orderBy: { fullName: "asc" } },
        lessons: {
          include: {
            subject: true,
            teacher: true,
            cabinet: true,
            lessonTeachers: { include: { teacher: true } },
            grades: {
              include: {
                student: true,
                comments: { include: { user: { select: { id: true, username: true } } } },
              },
            },
            materials: true,
          },
          orderBy: [{ date: "asc" }, { lessonNumber: "asc" }],
        },
      },
    });

    if (!journal) {
      throw new NotFoundException(apiError("GROUP_NOT_FOUND", "Группа не найдена"));
    }

    return journal;
  }

  async updateLesson(id: string, dto: UpdateLessonDto) {
    await this.ensureLesson(id);

    return this.prisma.lesson.update({
      where: { id },
      data: {
        topic: dto.topic,
        description: dto.description,
        lessonPlanTopicId: dto.lessonPlanTopicId,
      },
      include: { subject: true, teacher: true, cabinet: true },
    });
  }

  async upsertGrade(lessonId: string, dto: UpsertGradeDto, createdById: string) {
    await this.ensureLesson(lessonId);

    return this.prisma.grade.upsert({
      where: {
        studentId_lessonId: {
          studentId: dto.studentId,
          lessonId,
        },
      },
      update: {
        value: dto.value,
        comment: dto.comment,
        createdById,
      },
      create: {
        studentId: dto.studentId,
        lessonId,
        value: dto.value,
        comment: dto.comment,
        createdById,
      },
      include: { student: true, lesson: true },
    });
  }

  async addGradeComment(gradeId: string, userId: string, dto: CreateGradeCommentDto) {
    const grade = await this.prisma.grade.findUnique({ where: { id: gradeId } });
    if (!grade) {
      throw new NotFoundException(apiError("GRADE_NOT_FOUND", "Оценка не найдена"));
    }

    return this.prisma.gradeComment.create({
      data: {
        gradeId,
        userId,
        text: dto.text,
      },
    });
  }

  createLessonPlan(dto: CreateLessonPlanDto) {
    return this.prisma.lessonPlan.create({
      data: {
        title: dto.title,
        description: dto.description,
        groupId: dto.groupId,
        subjectId: dto.subjectId,
        teacherId: dto.teacherId,
        fileId: dto.fileId,
        topics: dto.topics?.length
          ? {
              create: dto.topics.map((topic) => ({
                order: topic.order,
                title: topic.title,
                description: topic.description,
              })),
            }
          : undefined,
      },
      include: { topics: { orderBy: { order: "asc" } }, file: true },
    });
  }

  async attachMaterial(
    lessonId: string,
    userId: string,
    dto: AttachLessonMaterialDto,
  ) {
    await this.ensureLesson(lessonId);
    const file = await this.prisma.fileAsset.findUnique({
      where: { id: dto.fileId },
    });

    if (!file) {
      throw new NotFoundException(apiError("FILE_NOT_FOUND", "Файл не найден"));
    }

    if (file.ownerId !== userId) {
      throw new ForbiddenException(
        apiError("FILE_FORBIDDEN", "Можно прикреплять только свои файлы"),
      );
    }

    return this.prisma.fileAsset.update({
      where: { id: dto.fileId },
      data: { lessonId, visibility: "SHARED" },
    });
  }

  private async ensureLesson(id: string) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id } });
    if (!lesson) {
      throw new NotFoundException(apiError("LESSON_NOT_FOUND", "Занятие не найдено"));
    }
  }
}
