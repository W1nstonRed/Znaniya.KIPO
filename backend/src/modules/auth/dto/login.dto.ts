import { IsString, MinLength } from "class-validator";

export class LoginDto {
  @IsString({ message: "Username должен быть строкой" })
  @MinLength(3, { message: "Username должен быть больше 3 символов" })
  username!: string;

  @IsString({ message: "Пароль должен быть строкой" })
  @MinLength(6, { message: "Пароль должен быть больше 6 символов" })
  password!: string;
}
