import { PartialType } from "@nestjs/mapped-types";
import { IsBoolean, IsOptional, IsString, MinLength } from "class-validator";

export class CreateGroupDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsString()
  specialtyId?: string;

  @IsOptional()
  @IsString()
  curatorTeacherId?: string;

  @IsOptional()
  @IsString()
  curatorAdminId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateGroupDto extends PartialType(CreateGroupDto) {}

export class NotifyGroupDto {
  @IsString()
  @MinLength(1)
  title!: string;

  @IsString()
  @MinLength(1)
  body!: string;
}
