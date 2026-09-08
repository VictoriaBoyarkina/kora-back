import { DocumentBuilder } from "@nestjs/swagger";

export function getSwaggerConfig() {
  return new DocumentBuilder()
    .setTitle("Kora")
    .setDescription("API documentation for Kora")
    .setVersion("1.0.0")
    .addBearerAuth()
    .setContact(
      "Viktoria Boyarkina",
      "https://web.telegram.org/@viktoriyaboyarkina",
      "vicka.boyarkina@yandex.ru",
    )
    .build();
}
