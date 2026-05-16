import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  CabinetsService,
  CreateCabinetDto,
  UpdateCabinetDto,
} from "./cabinets.service";
import { RolesGuard } from "@common/guards/roles.guard";
import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";
import { Roles } from "@common/decorators/roles.decorator";

@Controller("cabinets")
export class CabinetsController {
  constructor(private readonly cabinets: CabinetsService) {}

  @Get()
  findAll() {
    return this.cabinets.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  create(@Body() dto: CreateCabinetDto) {
    return this.cabinets.create(dto);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  update(@Param("id") id: string, @Body() dto: UpdateCabinetDto) {
    return this.cabinets.update(id, dto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  remove(@Param("id") id: string) {
    return this.cabinets.remove(id);
  }

  @Post("import-from-schedule")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  importFromSchedule(@Body() dto: { names: string[] }) {
    return this.cabinets.importFromSchedule(dto.names);
  }
}
