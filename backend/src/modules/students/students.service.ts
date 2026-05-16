import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "@database/prisma.service";
import { apiError } from "@common/errors/api-error";
import { normalizeName } from "@common/utils/normalize";
import { CreateStudentDto, UpdateStudentDto } from "./students.dto";

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(groupId?: string) {
    return this.prisma.student.findMany({
      where: groupId ? { groupId } : undefined,
      include: { group: true, user: { select: { id: true, username: true } } },
      orderBy: { fullName: "asc" },
    });
  }

  async findOne(id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: {
        group: true,
        user: { select: { id: true, username: true } },
        grades: { include: { lesson: { include: { subject: true } } } },
      },
    });

    if (!student) {
      throw new NotFoundException(
        apiError("STUDENT_NOT_FOUND", "Студент не найден"),
      );
    }

    return student;
  }

  async create(dto: CreateStudentDto) {
    const normalizedFullName = normalizeName(dto.fullName);
    const exists = await this.prisma.student.findUnique({
      where: {
        normalizedFullName_groupId: {
          normalizedFullName,
          groupId: dto.groupId,
        },
      },
    });

    if (exists) {
      throw new ConflictException(
        apiError("STUDENT_ALREADY_EXISTS", "Студент уже есть в группе"),
      );
    }

    return this.prisma.student.create({
      data: {
        fullName: dto.fullName.trim(),
        normalizedFullName,
        groupId: dto.groupId,
      },
    });
  }

  async update(id: string, dto: UpdateStudentDto) {
    await this.findOne(id);

    return this.prisma.student.update({
      where: { id },
      data: {
        ...(dto.fullName && {
          fullName: dto.fullName.trim(),
          normalizedFullName: normalizeName(dto.fullName),
        }),
        groupId: dto.groupId,
        userId: dto.userId,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.student.delete({ where: { id } });
    return { deleted: true };
  }
}
