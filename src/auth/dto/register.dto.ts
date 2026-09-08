import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class RegisterRequest {
  @ApiProperty({
    description: "Отображаемое имя",
    example: "Виктория",
    maxLength: 50,
  })
  @IsString({ message: "Имя должно быть строкой" })
  @IsNotEmpty({ message: "Имя обязательно для заполнения" })
  @MaxLength(50, { message: "Имя не должно превышать 50 символов" })
  name: string;

  @ApiProperty({
    description: "Почтовый адрес",
    example: "vicka.boyarkina@yandex.ru",
  })
  @IsString({ message: "Почта должна быть строкой" })
  @IsNotEmpty({ message: "Почта обязательна для заполнения" })
  @IsEmail({}, { message: "Неккоректный формат электронной почты" })
  email: string;

  @ApiProperty({
    description: "Пароль от аккаунта",
    example: "123456",
    minLength: 6,
    maxLength: 50,
  })
  @IsString({ message: "Пароль должен быть строкой" })
  @IsNotEmpty({ message: "Пароль обязателен для заполнения" })
  @MinLength(6, { message: "Пароль должен содержать не менее 6 символов" })
  @MaxLength(50, { message: "Пароль должен содержать не более 50 символов" })
  password: string;

  constructor(name: string, email: string, password: string) {
    this.name = name;
    this.email = email;
    this.password = password;
  }
}
