import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "@database/prisma.service";
import { apiError } from "@common/errors/api-error";
import { normalizeGroupName } from "@common/utils/normalize";
import { NotificationsService } from "@modules/notifications/notifications.service";
import { CreateGroupDto, NotifyGroupDto, UpdateGroupDto } from "./groups.dto";

@Injectable()
export class GroupsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  findAll() {
    return this.prisma.group.findMany({
      include: {
        specialty: true,
        curatorTeacher: true,
        _count: { select: { students: true, lessons: true } },
      },
      orderBy: { name: "asc" },
    });
  }

  async findOne(id: string) {
    const group = await this.prisma.group.findUnique({
      where: { id },
      include: {
        specialty: true,
        curatorTeacher: true,
        students: true,
        _count: { select: { students: true, lessons: true } },
      },
    });

    if (!group) {
      throw new NotFoundException(apiError("GROUP_NOT_FOUND", "Группа не найдена"));
    }

    return group;
  }

  async create(dto: CreateGroupDto) {
    const normalizedName = normalizeGroupName(dto.name);
    const exists = await this.prisma.group.findUnique({
      where: { normalizedName },
    });

    if (exists) {
      throw new ConflictException(
        apiError("GROUP_ALREADY_EXISTS", "Группа уже существует"),
      );
    }

    return this.prisma.group.create({
      data: {
        name: dto.name.trim(),
        normalizedName,
        specialtyId: dto.specialtyId,
        curatorTeacherId: dto.curatorTeacherId,
        curatorAdminId: dto.curatorAdminId,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(id: string, dto: UpdateGroupDto) {
    await this.findOne(id);

    if (dto.name) {
      const normalizedName = normalizeGroupName(dto.name);
      const exists = await this.prisma.group.findUnique({
        where: { normalizedName },
      });

      if (exists && exists.id !== id) {
        throw new ConflictException(
          apiError("GROUP_ALREADY_EXISTS", "Группа уже существует"),
        );
      }
    }

    return this.prisma.group.update({
      where: { id },
      data: {
        ...(dto.name && {
          name: dto.name.trim(),
          normalizedName: normalizeGroupName(dto.name),
        }),
        specialtyId: dto.specialtyId,
        curatorTeacherId: dto.curatorTeacherId,
        curatorAdminId: dto.curatorAdminId,
        isActive: dto.isActive,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.group.delete({ where: { id } });
    return { deleted: true };
  }

  async toggleFavorite(groupId: string, userId: string) {
    await this.findOne(groupId);

    const existing = await this.prisma.userFavoriteGroup.findUnique({
      where: { userId_groupId: { userId, groupId } },
    });

    if (existing) {
      await this.prisma.userFavoriteGroup.delete({
        where: { userId_groupId: { userId, groupId } },
      });
      return { isFavorite: false };
    }

    await this.prisma.userFavoriteGroup.create({
      data: { userId, groupId },
    });
    return { isFavorite: true };
  }

  async notifyGroup(groupId: string, dto: NotifyGroupDto) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        students: { select: { userId: true } },
        curatorTeacher: { select: { userId: true } },
      },
    });

    if (!group) {
      throw new NotFoundException(apiError("GROUP_NOT_FOUND", "Группа не найдена"));
    }

    const recipients = new Set<string>();
    group.students.forEach((student) => {
      if (student.userId) recipients.add(student.userId);
    });
    if (group.curatorTeacher?.userId) recipients.add(group.curatorTeacher.userId);
    if (group.curatorAdminId) recipients.add(group.curatorAdminId);

    return this.notifications.createForUsers([...recipients], {
      type: "group_message",
      title: dto.title,
      body: dto.body,
      data: { groupId },
      url: `/groups/${groupId}`,
    });
  }
}
