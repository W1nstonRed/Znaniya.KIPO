// specializations/specializations.service.ts
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "@database/prisma.service";
import { CreateSpecialtyDto, UpdateSpecialtyDto } from "./specializaions.dto";

@Injectable()
export class SpecializationsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.specialty.findMany({
      include: { _count: { select: { groups: true } }, groups: true },
      orderBy: { name: "asc" },
    });
  }

  async findOne(id: string) {
    const specialty = await this.prisma.specialty.findUnique({
      where: { id },
      include: { groups: true },
    });

    if (!specialty) throw new NotFoundException("Специальность не найдена");
    return specialty;
  }

  async create(dto: CreateSpecialtyDto) {
    const exists = await this.prisma.specialty.findUnique({
      where: { name: dto.name },
    });

    if (exists) throw new ConflictException("Специальность уже существует");

    return this.prisma.specialty.create({ data: dto });
  }

  async update(id: string, dto: UpdateSpecialtyDto) {
    await this.findOne(id);

    if (dto.name) {
      const exists = await this.prisma.specialty.findUnique({
        where: { name: dto.name },
      });
      if (exists && exists.id !== id) {
        throw new ConflictException(
          "Специальность с таким именем уже существует",
        );
      }
    }

    return this.prisma.specialty.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.specialty.delete({ where: { id } });
  }
}
