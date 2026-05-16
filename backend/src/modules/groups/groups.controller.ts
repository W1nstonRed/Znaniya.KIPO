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
import { GetCurrentUser } from "@common/decorators/current-user.decorator";
import { RolesGuard } from "@common/guards/roles.guard";
import type { CurrentUser } from "@common/types/current-user";
import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";
import { GroupsService } from "./groups.service";
import { CreateGroupDto, NotifyGroupDto, UpdateGroupDto } from "./groups.dto";

@Controller("groups")
export class GroupsController {
  constructor(private readonly groups: GroupsService) {}

  @Get()
  findAll() {
    return this.groups.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.groups.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  create(@Body() dto: CreateGroupDto) {
    return this.groups.create(dto);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  update(@Param("id") id: string, @Body() dto: UpdateGroupDto) {
    return this.groups.update(id, dto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  remove(@Param("id") id: string) {
    return this.groups.remove(id);
  }

  @Patch(":id/favorite")
  @UseGuards(JwtAuthGuard)
  toggleFavorite(@Param("id") id: string, @GetCurrentUser() user: CurrentUser) {
    return this.groups.toggleFavorite(id, user.id);
  }

  @Post(":id/notify")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "TEACHER")
  notify(@Param("id") id: string, @Body() dto: NotifyGroupDto) {
    return this.groups.notifyGroup(id, dto);
  }
}
