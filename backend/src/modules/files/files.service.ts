import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "@database/prisma.service";
import { apiError } from "@common/errors/api-error";
import type { CurrentUser } from "@common/types/current-user";
import { CreateFileDto, ShareFileDto } from "./files.dto";

@Injectable()
export class FilesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(user: CurrentUser) {
    return this.prisma.fileAsset.findMany({
      where: {
        OR: [
          { ownerId: user.id },
          { visibility: "PUBLIC" },
          { shares: { some: { targetUserId: user.id } } },
          ...(user.groupId
            ? [{ shares: { some: { targetGroupId: user.groupId } } }]
            : []),
        ],
      },
      include: { shares: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string, user: CurrentUser) {
    const file = await this.prisma.fileAsset.findFirst({
      where: {
        id,
        OR: [
          { ownerId: user.id },
          { visibility: "PUBLIC" },
          { shares: { some: { targetUserId: user.id } } },
          ...(user.groupId
            ? [{ shares: { some: { targetGroupId: user.groupId } } }]
            : []),
        ],
      },
      include: { shares: true },
    });

    if (!file) {
      throw new NotFoundException(apiError("FILE_NOT_FOUND", "Файл не найден"));
    }

    return file;
  }

  create(userId: string, dto: CreateFileDto) {
    return this.prisma.fileAsset.create({
      data: {
        ownerId: userId,
        name: dto.name.trim(),
        originalName: dto.originalName.trim(),
        mimeType: dto.mimeType,
        sizeBytes: dto.sizeBytes,
        storagePath: dto.storagePath,
        visibility: dto.visibility ?? "PRIVATE",
        lessonId: dto.lessonId,
      },
    });
  }

  async share(id: string, userId: string, dto: ShareFileDto) {
    if (!dto.targetUserId && !dto.targetGroupId) {
      throw new BadRequestException(
        apiError(
          "FILE_SHARE_TARGET_REQUIRED",
          "Нужно передать targetUserId или targetGroupId",
        ),
      );
    }

    const file = await this.prisma.fileAsset.findUnique({ where: { id } });
    if (!file) {
      throw new NotFoundException(apiError("FILE_NOT_FOUND", "Файл не найден"));
    }

    if (file.ownerId !== userId) {
      throw new ForbiddenException(
        apiError("FILE_FORBIDDEN", "Можно делиться только своими файлами"),
      );
    }

    const share = await this.prisma.fileShare.create({
      data: {
        fileId: id,
        targetUserId: dto.targetUserId,
        targetGroupId: dto.targetGroupId,
      },
    });

    await this.prisma.fileAsset.update({
      where: { id },
      data: { visibility: "SHARED" },
    });

    return share;
  }

  async remove(id: string, userId: string) {
    const file = await this.prisma.fileAsset.findUnique({ where: { id } });
    if (!file) {
      throw new NotFoundException(apiError("FILE_NOT_FOUND", "Файл не найден"));
    }

    if (file.ownerId !== userId) {
      throw new ForbiddenException(
        apiError("FILE_FORBIDDEN", "Можно удалять только свои файлы"),
      );
    }

    await this.prisma.fileAsset.delete({ where: { id } });
    return { deleted: true };
  }
}
