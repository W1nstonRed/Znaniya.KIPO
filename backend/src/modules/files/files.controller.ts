import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { GetCurrentUser } from "@common/decorators/current-user.decorator";
import type { CurrentUser } from "@common/types/current-user";
import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";
import { CreateFileDto, ShareFileDto } from "./files.dto";
import { FilesService } from "./files.service";

@Controller("files")
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly files: FilesService) {}

  @Get()
  findAll(@GetCurrentUser() user: CurrentUser) {
    return this.files.findAll(user);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @GetCurrentUser() user: CurrentUser) {
    return this.files.findOne(id, user);
  }

  @Post()
  create(@GetCurrentUser() user: CurrentUser, @Body() dto: CreateFileDto) {
    return this.files.create(user.id, dto);
  }

  @Post(":id/share")
  share(
    @Param("id") id: string,
    @GetCurrentUser() user: CurrentUser,
    @Body() dto: ShareFileDto,
  ) {
    return this.files.share(id, user.id, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @GetCurrentUser() user: CurrentUser) {
    return this.files.remove(id, user.id);
  }
}
