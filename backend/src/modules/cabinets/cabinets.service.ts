import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "@database/prisma.service";

export class CreateCabinetDto {
  name!: string;
  shortName?: string;
  building?: string;
  floor?: number;
  ignore?: boolean;
}

export class UpdateCabinetDto {
  name?: string;
  shortName?: string;
  building?: string;
  floor?: number;
  ignore?: boolean;
}

@Injectable()
export class CabinetsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.cabinet.findMany({
      orderBy: [{ building: "asc" }, { name: "asc" }],
    });
  }

  async findOne(id: string) {
    const cabinet = await this.prisma.cabinet.findUnique({ where: { id } });
    if (!cabinet) throw new NotFoundException("Кабинет не найден");
    return cabinet;
  }

  async create(dto: CreateCabinetDto) {
    const exists = await this.prisma.cabinet.findUnique({
      where: { name: dto.name },
    });
    if (exists)
      throw new ConflictException("Кабинет с таким названием уже существует");

    return this.prisma.cabinet.create({ data: dto });
  }

  async update(id: string, dto: UpdateCabinetDto) {
    await this.findOne(id);

    if (dto.name) {
      const exists = await this.prisma.cabinet.findUnique({
        where: { name: dto.name },
      });
      if (exists && exists.id !== id) {
        throw new ConflictException("Кабинет с таким названием уже существует");
      }
    }

    return this.prisma.cabinet.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.cabinet.delete({ where: { id } });
  }

  // импорт кабинетов из расписания
  async importFromSchedule(names: string[]) {
    const unique = [...new Set(names)];

    await this.prisma.$transaction(
      unique.map((name) =>
        this.prisma.cabinet.upsert({
          where: { name },
          update: {},
          create: { name },
        }),
      ),
    );

    return this.prisma.cabinet.findMany({ orderBy: { name: "asc" } });
  }
}
