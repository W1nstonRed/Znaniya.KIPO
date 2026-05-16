import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from "class-validator";

export class CreateFileDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  @MinLength(1)
  originalName!: string;

  @IsString()
  @MinLength(1)
  mimeType!: string;

  @IsInt()
  @Min(0)
  sizeBytes!: number;

  @IsString()
  @MinLength(1)
  storagePath!: string;

  @IsOptional()
  @IsIn(["PRIVATE", "SHARED", "PUBLIC"])
  visibility?: "PRIVATE" | "SHARED" | "PUBLIC";

  @IsOptional()
  @IsString()
  lessonId?: string;
}

export class ShareFileDto {
  @IsOptional()
  @IsString()
  targetUserId?: string;

  @IsOptional()
  @IsString()
  targetGroupId?: string;
}
