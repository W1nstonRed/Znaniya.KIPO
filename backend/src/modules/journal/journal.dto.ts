import { Type } from "class-transformer";
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";

export class UpdateLessonDto {
  @IsOptional()
  @IsString()
  topic?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  lessonPlanTopicId?: string;
}

export class UpsertGradeDto {
  @IsString()
  studentId!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  value!: number;

  @IsOptional()
  @IsString()
  comment?: string;
}

export class CreateGradeCommentDto {
  @IsString()
  @MinLength(1)
  text!: string;
}

export class CreateLessonPlanTopicDto {
  @IsInt()
  @Min(1)
  order!: number;

  @IsString()
  @MinLength(1)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateLessonPlanDto {
  @IsString()
  @MinLength(1)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  groupId!: string;

  @IsString()
  subjectId!: string;

  @IsOptional()
  @IsString()
  teacherId?: string;

  @IsOptional()
  @IsString()
  fileId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateLessonPlanTopicDto)
  topics?: CreateLessonPlanTopicDto[];
}

export class AttachLessonMaterialDto {
  @IsString()
  fileId!: string;
}
