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
import { Roles } from "@common/decorators/roles.decorator";
import { RolesGuard } from "@common/guards/roles.guard";
import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";
import { SpecializationsService } from "./specializations.service";
import { CreateSpecialtyDto, UpdateSpecialtyDto } from "./specializaions.dto";

@Controller("specializations")
export class SpecializationsController {
  constructor(private readonly specializations: SpecializationsService) {}

  @Get()
  findAll() {
    return this.specializations.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.specializations.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  create(@Body() dto: CreateSpecialtyDto) {
    return this.specializations.create(dto);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  update(@Param("id") id: string, @Body() dto: UpdateSpecialtyDto) {
    return this.specializations.update(id, dto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  remove(@Param("id") id: string) {
    return this.specializations.remove(id);
  }
}
