import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class LoginRequest {
  @ApiProperty({
    description: "Почтовый адрес",
    example: "vicka.boyarkina@yandex.ru",
  })
  @IsNotEmpty({ message: "Почта обязательна для заполнения" })
  email: string;

  @ApiProperty({
    description: "Пароль от аккаунта",
    example: "123456",
    minLength: 6,
    maxLength: 50,
  })
  @IsNotEmpty({ message: "Пароль обязателен для заполнения" })
  password: string;

  constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
  }
}
