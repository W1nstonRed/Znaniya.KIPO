import { Module } from "@nestjs/common";
import { SpecializationsController } from "./specializations.controller";
import { SpecializationsService } from "./specializations.service";
import { PrismaService } from "@database/prisma.service";

@Module({
  controllers: [SpecializationsController],
  providers: [SpecializationsService, PrismaService],
})
export class SpecializationsModule {}
