import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";

export class CreateTestOptionDto {
  @IsInt()
  @Min(1)
  order!: number;

  @IsString()
  @MinLength(1)
  text!: string;

  @IsBoolean()
  isCorrect!: boolean;
}

export class CreateTestQuestionDto {
  @IsIn(["SINGLE_CHOICE", "MULTIPLE_CHOICE", "TEXT"])
  type!: "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TEXT";

  @IsInt()
  @Min(1)
  order!: number;

  @IsString()
  @MinLength(1)
  text!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  points?: number;

  @IsOptional()
  @IsString()
  textAnswer?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  minMatchPercent?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTestOptionDto)
  options?: CreateTestOptionDto[];
}

export class CreateTestDto {
  @IsString()
  @MinLength(1)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  subjectId?: string;

  @IsOptional()
  @IsDateString()
  deadline?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxAttempts?: number;

  @IsOptional()
  @IsBoolean()
  isGrade?: boolean;

  @IsOptional()
  @IsString()
  gradeLessonId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTestQuestionDto)
  questions!: CreateTestQuestionDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  groupIds?: string[];
}

export class AssignGroupsDto {
  @IsArray()
  @IsString({ each: true })
  groupIds!: string[];
}

export class SubmitAnswerDto {
  @IsString()
  questionId!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  selectedOptionIds?: string[];

  @IsOptional()
  @IsString()
  textAnswer?: string;
}

export class SubmitAttemptDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubmitAnswerDto)
  answers!: SubmitAnswerDto[];
}

export class ProctorEventDto {
  @IsIn([
    "PAGE_HIDDEN",
    "PAGE_VISIBLE",
    "WINDOW_BLUR",
    "WINDOW_FOCUS",
    "FULLSCREEN_EXIT",
    "COPY",
    "PASTE",
    "CUSTOM",
  ])
  type!:
    | "PAGE_HIDDEN"
    | "PAGE_VISIBLE"
    | "WINDOW_BLUR"
    | "WINDOW_FOCUS"
    | "FULLSCREEN_EXIT"
    | "COPY"
    | "PASTE"
    | "CUSTOM";

  @IsOptional()
  payload?: unknown;
}
