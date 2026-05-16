import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { Roles } from "@common/decorators/roles.decorator";
import { GetCurrentUser } from "@common/decorators/current-user.decorator";
import { RolesGuard } from "@common/guards/roles.guard";
import type { CurrentUser } from "@common/types/current-user";
import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";
import {
  AssignGroupsDto,
  CreateTestDto,
  ProctorEventDto,
  SubmitAttemptDto,
} from "./tests.dto";
import { TestsService } from "./tests.service";

@Controller("tests")
@UseGuards(JwtAuthGuard)
export class TestsController {
  constructor(private readonly tests: TestsService) {}

  @Get()
  findAll(@GetCurrentUser() user: CurrentUser) {
    return this.tests.findAll(user);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.tests.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles("ADMIN", "TEACHER")
  create(@GetCurrentUser() user: CurrentUser, @Body() dto: CreateTestDto) {
    return this.tests.create(user.id, dto);
  }

  @Post(":id/assign-groups")
  @UseGuards(RolesGuard)
  @Roles("ADMIN", "TEACHER")
  assignGroups(@Param("id") id: string, @Body() dto: AssignGroupsDto) {
    return this.tests.assignGroups(id, dto);
  }

  @Post(":id/attempts")
  startAttempt(@Param("id") id: string, @GetCurrentUser() user: CurrentUser) {
    return this.tests.startAttempt(id, user);
  }

  @Post("attempts/:id/submit")
  submitAttempt(
    @Param("id") id: string,
    @GetCurrentUser() user: CurrentUser,
    @Body() dto: SubmitAttemptDto,
  ) {
    return this.tests.submitAttempt(id, user, dto);
  }

  @Post("attempts/:id/proctor-events")
  addProctorEvent(
    @Param("id") id: string,
    @GetCurrentUser() user: CurrentUser,
    @Body() dto: ProctorEventDto,
  ) {
    return this.tests.addProctorEvent(id, user, dto);
  }
}
