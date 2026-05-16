import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ScheduleService } from "./schedule.service";
import type { CurrentUser } from "@common/types/current-user";
import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";
import { GetCurrentUser } from "@common/decorators/current-user.decorator";

import { IsNumber, IsDateString, IsOptional } from "class-validator";
import { Type } from "class-transformer";

export class GetGroupScheduleDto {
  @IsNumber()
  @Type(() => Number)
  groupId!: number;

  @IsDateString()
  date!: string;
}

export class GetTeacherScheduleDto {
  @IsNumber()
  @Type(() => Number)
  teacherId!: number;

  @IsDateString()
  date!: string;
}

class AddFavoriteDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  scheduleGroupId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  scheduleTeacherId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  externalGroupId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  externalTeacherId?: number;
}

@Controller("schedule")
export class ScheduleController {
  constructor(private readonly schedule: ScheduleService) {}

  @Get("groups")
  getGroups() {
    return this.schedule.getGroups();
  }

  @Get("teachers")
  getTeachers() {
    return this.schedule.getTeachers();
  }

  @Post("group")
  getGroupSchedule(@Body() dto: GetGroupScheduleDto) {
    return this.schedule.getGroupSchedule(dto.groupId, dto.date);
  }

  @Post("teacher")
  getTeacherSchedule(@Body() dto: GetTeacherScheduleDto) {
    return this.schedule.getTeacherSchedule(dto.teacherId, dto.date);
  }

  @Get("free-cabinets")
  getFreeCabinets(
    @Query("date") date: string,
    @Query("lesson") lesson: string,
    @Query("building") building?: string,
  ) {
    return this.schedule.getFreeCabinets(date, parseInt(lesson), building);
  }

  @Get("favorites")
  @UseGuards(JwtAuthGuard)
  getFavorites(@GetCurrentUser() user: CurrentUser) {
    return this.schedule.getFavorites(user.id);
  }

  @Post("favorites")
  @UseGuards(JwtAuthGuard)
  addFavorite(
    @GetCurrentUser() user: CurrentUser,
    @Body() dto: AddFavoriteDto,
  ) {
    return this.schedule.addFavorite(user.id, dto);
  }

  @Delete("favorites/:id")
  @UseGuards(JwtAuthGuard)
  removeFavorite(@Param("id") id: string, @GetCurrentUser() user: CurrentUser) {
    return this.schedule.removeFavorite(id, user.id);
  }
}
