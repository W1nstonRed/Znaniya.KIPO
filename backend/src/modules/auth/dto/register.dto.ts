import { IsIn, IsOptional, IsString, MinLength } from "class-validator";

export class RegisterDto {
  @IsString({ message: "Username должен быть строкой" })
  @MinLength(3, { message: "Username должен быть больше 3 символов" })
  username!: string;

  @IsString({ message: "Пароль должен быть строкой" })
  @MinLength(6, { message: "Пароль должен быть больше 6 символов" })
  password!: string;

  @IsIn(["STUDENT", "TEACHER"], {
    message: "Роль должна быть STUDENT или TEACHER",
  })
  role!: "STUDENT" | "TEACHER";

  @IsOptional()
  @IsString({ message: "ФИО должно быть строкой" })
  @MinLength(1, { message: "ФИО обязательно для автоматической привязки" })
  fullName?: string;

  @IsOptional()
  @IsString({ message: "ID группы должен быть строкой" })
  groupId?: string;

  @IsOptional()
  @IsString({ message: "ID студента должен быть строкой" })
  studentId?: string;

  @IsOptional()
  @IsString({ message: "ID преподавателя должен быть строкой" })
  teacherId?: string;
}
