import { IsOptional, IsString, IsNotEmpty, IsUrl } from "class-validator";
import { PartialType } from "@nestjs/mapped-types";

export class CreateSpecialtyDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  iconName?: string;

  @IsOptional()
  @IsUrl()
  animationUrl?: string;
}

export class UpdateSpecialtyDto extends PartialType(CreateSpecialtyDto) {}
