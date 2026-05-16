import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { Roles } from "@common/decorators/roles.decorator";
import { GetCurrentUser } from "@common/decorators/current-user.decorator";
import { RolesGuard } from "@common/guards/roles.guard";
import type { CurrentUser } from "@common/types/current-user";
import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";
import {
  AttachLessonMaterialDto,
  CreateGradeCommentDto,
  CreateLessonPlanDto,
  UpdateLessonDto,
  UpsertGradeDto,
} from "./journal.dto";
import { JournalService } from "./journal.service";

@Controller("journal")
export class JournalController {
  constructor(private readonly journal: JournalService) {}

  @Get("groups/:groupId")
  getGroupJournal(@Param("groupId") groupId: string) {
    return this.journal.getGroupJournal(groupId);
  }

  @Patch("lessons/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "TEACHER")
  updateLesson(@Param("id") id: string, @Body() dto: UpdateLessonDto) {
    return this.journal.updateLesson(id, dto);
  }

  @Post("lessons/:id/grades")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "TEACHER")
  upsertGrade(
    @Param("id") id: string,
    @GetCurrentUser() user: CurrentUser,
    @Body() dto: UpsertGradeDto,
  ) {
    return this.journal.upsertGrade(id, dto, user.id);
  }

  @Post("grades/:id/comments")
  @UseGuards(JwtAuthGuard)
  addGradeComment(
    @Param("id") id: string,
    @GetCurrentUser() user: CurrentUser,
    @Body() dto: CreateGradeCommentDto,
  ) {
    return this.journal.addGradeComment(id, user.id, dto);
  }

  @Post("lesson-plans")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "TEACHER")
  createLessonPlan(@Body() dto: CreateLessonPlanDto) {
    return this.journal.createLessonPlan(dto);
  }

  @Post("lessons/:id/materials")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "TEACHER")
  attachMaterial(
    @Param("id") id: string,
    @GetCurrentUser() user: CurrentUser,
    @Body() dto: AttachLessonMaterialDto,
  ) {
    return this.journal.attachMaterial(id, user.id, dto);
  }
}
