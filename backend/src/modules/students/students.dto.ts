import { PartialType } from "@nestjs/mapped-types";
import { IsOptional, IsString, MinLength } from "class-validator";

export class CreateStudentDto {
  @IsString()
  @MinLength(1)
  fullName!: string;

  @IsString()
  @MinLength(1)
  groupId!: string;
}

export class UpdateStudentDto extends PartialType(CreateStudentDto) {
  @IsOptional()
  @IsString()
  userId?: string | null;
}
