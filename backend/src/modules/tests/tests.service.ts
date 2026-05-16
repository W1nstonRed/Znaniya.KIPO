import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "@database/prisma.service";
import { apiError } from "@common/errors/api-error";
import type { CurrentUser } from "@common/types/current-user";
import { NotificationsService } from "@modules/notifications/notifications.service";
import {
  AssignGroupsDto,
  CreateTestDto,
  ProctorEventDto,
  SubmitAttemptDto,
  SubmitAnswerDto,
} from "./tests.dto";

@Injectable()
export class TestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  findAll(user: CurrentUser) {
    if (user.role === "ADMIN" || user.role === "TEACHER") {
      return this.prisma.test.findMany({
        where: user.role === "TEACHER" ? { creatorId: user.id } : undefined,
        include: { assignments: { include: { group: true } }, subject: true },
        orderBy: { createdAt: "desc" },
      });
    }

    return this.prisma.test.findMany({
      where: {
        assignments: user.groupId
          ? { some: { groupId: user.groupId } }
          : { none: {} },
      },
      include: { assignments: { include: { group: true } }, subject: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string) {
    const test = await this.prisma.test.findUnique({
      where: { id },
      include: {
        questions: {
          include: { options: { orderBy: { order: "asc" } } },
          orderBy: { order: "asc" },
        },
        assignments: { include: { group: true } },
        subject: true,
      },
    });

    if (!test) {
      throw new NotFoundException(apiError("TEST_NOT_FOUND", "Тест не найден"));
    }

    return test;
  }

  create(userId: string, dto: CreateTestDto) {
    return this.prisma.test.create({
      data: {
        title: dto.title,
        description: dto.description,
        creatorId: userId,
        subjectId: dto.subjectId,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
        maxAttempts: dto.maxAttempts ?? 1,
        isGrade: dto.isGrade ?? false,
        gradeLessonId: dto.gradeLessonId,
        questions: {
          create: dto.questions.map((question) => ({
            type: question.type,
            order: question.order,
            text: question.text,
            points: question.points ?? 1,
            textAnswer: question.textAnswer,
            minMatchPercent: question.minMatchPercent ?? 80,
            options: question.options?.length
              ? {
                  create: question.options.map((option) => ({
                    order: option.order,
                    text: option.text,
                    isCorrect: option.isCorrect,
                  })),
                }
              : undefined,
          })),
        },
        assignments: dto.groupIds?.length
          ? { create: dto.groupIds.map((groupId) => ({ groupId })) }
          : undefined,
      },
      include: {
        questions: { include: { options: true } },
        assignments: true,
      },
    });
  }

  async assignGroups(testId: string, dto: AssignGroupsDto) {
    await this.findOne(testId);

    await this.prisma.$transaction(
      dto.groupIds.map((groupId) =>
        this.prisma.testAssignment.upsert({
          where: { testId_groupId: { testId, groupId } },
          update: {},
          create: { testId, groupId },
        }),
      ),
    );

    return this.findOne(testId);
  }

  async startAttempt(testId: string, user: CurrentUser) {
    if (!user.studentId) {
      throw new ForbiddenException(
        apiError("TEST_STUDENT_REQUIRED", "Тест может проходить только студент"),
      );
    }

    const test = await this.prisma.test.findUnique({
      where: { id: testId },
      include: { assignments: true },
    });

    if (!test) {
      throw new NotFoundException(apiError("TEST_NOT_FOUND", "Тест не найден"));
    }

    if (test.deadline && test.deadline < new Date()) {
      throw new BadRequestException(
        apiError("TEST_DEADLINE_EXPIRED", "Срок прохождения теста истек"),
      );
    }

    if (
      test.assignments.length > 0 &&
      (!user.groupId ||
        !test.assignments.some((assignment) => assignment.groupId === user.groupId))
    ) {
      throw new ForbiddenException(
        apiError("TEST_NOT_ASSIGNED", "Тест не назначен вашей группе"),
      );
    }

    const attemptsCount = await this.prisma.testAttempt.count({
      where: { testId, studentId: user.studentId },
    });

    if (attemptsCount >= test.maxAttempts) {
      throw new BadRequestException(
        apiError("TEST_ATTEMPTS_EXCEEDED", "Попытки прохождения закончились"),
      );
    }

    return this.prisma.testAttempt.create({
      data: {
        testId,
        studentId: user.studentId,
        userId: user.id,
      },
    });
  }

  async submitAttempt(attemptId: string, user: CurrentUser, dto: SubmitAttemptDto) {
    const attempt = await this.prisma.testAttempt.findUnique({
      where: { id: attemptId },
      include: {
        test: {
          include: {
            questions: {
              include: { options: true },
            },
          },
        },
      },
    });

    if (!attempt) {
      throw new NotFoundException(
        apiError("TEST_ATTEMPT_NOT_FOUND", "Попытка не найдена"),
      );
    }

    if (attempt.userId !== user.id) {
      throw new ForbiddenException(
        apiError("TEST_ATTEMPT_FORBIDDEN", "Это не ваша попытка"),
      );
    }

    if (attempt.status !== "IN_PROGRESS") {
      throw new BadRequestException(
        apiError("TEST_ATTEMPT_ALREADY_SUBMITTED", "Попытка уже отправлена"),
      );
    }

    const checked = this.checkAnswers(attempt.test.questions, dto.answers);
    await this.prisma.testAttemptAnswer.deleteMany({ where: { attemptId } });
    await this.prisma.testAttemptAnswer.createMany({
      data: checked.answers.map((answer) => ({
        attemptId,
        questionId: answer.questionId,
        selectedOptionIds: answer.selectedOptionIds as Prisma.InputJsonValue,
        textAnswer: answer.textAnswer,
        isCorrect: answer.isCorrect,
        scorePoints: answer.scorePoints,
        similarityPercent: answer.similarityPercent,
      })),
    });

    const updated = await this.prisma.testAttempt.update({
      where: { id: attemptId },
      data: {
        status: "GRADED",
        scorePoints: checked.scorePoints,
        scorePercent: checked.scorePercent,
        submittedAt: new Date(),
        gradedAt: new Date(),
      },
      include: { answers: true, test: true },
    });

    if (attempt.test.isGrade && attempt.test.gradeLessonId && attempt.studentId) {
      await this.prisma.grade.upsert({
        where: {
          studentId_lessonId: {
            studentId: attempt.studentId,
            lessonId: attempt.test.gradeLessonId,
          },
        },
        update: {
          value: this.scorePercentToGrade(checked.scorePercent),
          sourceAttemptId: attemptId,
          createdById: attempt.test.creatorId,
        },
        create: {
          studentId: attempt.studentId,
          lessonId: attempt.test.gradeLessonId,
          value: this.scorePercentToGrade(checked.scorePercent),
          sourceAttemptId: attemptId,
          createdById: attempt.test.creatorId,
        },
      });
    }

    await this.notifications.createForUser(attempt.test.creatorId, {
      type: "test_submitted",
      title: "Тест отправлен",
      body: `${user.fullName ?? user.username}: ${Math.round(
        checked.scorePercent,
      )}%`,
      data: { testId: attempt.testId, attemptId },
      url: `/tests/${attempt.testId}`,
    });

    return updated;
  }

  async addProctorEvent(
    attemptId: string,
    user: CurrentUser,
    dto: ProctorEventDto,
  ) {
    const attempt = await this.prisma.testAttempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt) {
      throw new NotFoundException(
        apiError("TEST_ATTEMPT_NOT_FOUND", "Попытка не найдена"),
      );
    }

    if (attempt.userId !== user.id) {
      throw new ForbiddenException(
        apiError("TEST_ATTEMPT_FORBIDDEN", "Это не ваша попытка"),
      );
    }

    return this.prisma.testProctorEvent.create({
      data: {
        attemptId,
        type: dto.type,
        payload: dto.payload as Prisma.InputJsonValue | undefined,
      },
    });
  }

  private checkAnswers(
    questions: {
      id: string;
      type: string;
      points: number;
      textAnswer: string | null;
      minMatchPercent: number;
      options: { id: string; isCorrect: boolean }[];
    }[],
    answers: SubmitAnswerDto[],
  ) {
    const byQuestionId = new Map(answers.map((answer) => [answer.questionId, answer]));
    const checkedAnswers = [];
    const totalPoints = questions.reduce((sum, question) => sum + question.points, 0);
    let scorePoints = 0;

    for (const question of questions) {
      const answer = byQuestionId.get(question.id);
      const checked = this.checkSingleAnswer(question, answer);
      scorePoints += checked.scorePoints;
      checkedAnswers.push(checked);
    }

    const scorePercent = totalPoints > 0 ? (scorePoints / totalPoints) * 100 : 0;

    return {
      scorePoints,
      scorePercent,
      answers: checkedAnswers,
    };
  }

  private checkSingleAnswer(
    question: {
      id: string;
      type: string;
      points: number;
      textAnswer: string | null;
      minMatchPercent: number;
      options: { id: string; isCorrect: boolean }[];
    },
    answer?: SubmitAnswerDto,
  ) {
    if (!answer) {
      return {
        questionId: question.id,
        selectedOptionIds: [],
        textAnswer: null,
        isCorrect: false,
        scorePoints: 0,
        similarityPercent: null,
      };
    }

    if (question.type === "TEXT") {
      const similarityPercent = this.similarityPercent(
        answer.textAnswer ?? "",
        question.textAnswer ?? "",
      );
      const isCorrect = similarityPercent >= question.minMatchPercent;
      return {
        questionId: question.id,
        selectedOptionIds: [],
        textAnswer: answer.textAnswer,
        isCorrect,
        scorePoints: isCorrect ? question.points : 0,
        similarityPercent,
      };
    }

    const selected = [...(answer.selectedOptionIds ?? [])].sort();
    const correct = question.options
      .filter((option) => option.isCorrect)
      .map((option) => option.id)
      .sort();
    const isCorrect = JSON.stringify(selected) === JSON.stringify(correct);

    return {
      questionId: question.id,
      selectedOptionIds: selected,
      textAnswer: answer.textAnswer,
      isCorrect,
      scorePoints: isCorrect ? question.points : 0,
      similarityPercent: null,
    };
  }

  private similarityPercent(value: string, expected: string): number {
    const left = this.normalizeText(value);
    const right = this.normalizeText(expected);
    if (!left && !right) return 100;
    if (!left || !right) return 0;

    const distance = this.levenshtein(left, right);
    const maxLength = Math.max(left.length, right.length);
    return Math.max(0, ((maxLength - distance) / maxLength) * 100);
  }

  private normalizeText(value: string): string {
    return value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  }

  private levenshtein(left: string, right: string): number {
    const matrix = Array.from({ length: left.length + 1 }, (_, i) => [i]);

    for (let j = 1; j <= right.length; j += 1) matrix[0][j] = j;

    for (let i = 1; i <= left.length; i += 1) {
      for (let j = 1; j <= right.length; j += 1) {
        const substitution = matrix[i - 1][j - 1] + (left[i - 1] === right[j - 1] ? 0 : 1);
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          substitution,
        );
      }
    }

    return matrix[left.length][right.length];
  }

  private scorePercentToGrade(scorePercent: number): number {
    if (scorePercent >= 85) return 5;
    if (scorePercent >= 70) return 4;
    if (scorePercent >= 50) return 3;
    return 2;
  }
}
