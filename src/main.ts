import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as dotenv from "dotenv";
import { Logger, ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";

dotenv.config(); // Read base environment (.env) from root

async function bootstrap() {
  const logger = new Logger();
  logger.log("process.env.environment", process.env.environment);

  try {
    const environment = process.env.environment ?? "";
    logger.debug(`./environments/${environment}.env`);
    dotenv.config({ path: `./environments/${environment}.env` });
  } catch (error) {
    logger.error(`Init source met error with environment: ${error.message}`);
  }

  const config = new DocumentBuilder()
    .setTitle("Notification Service APIs")
    .setDescription("APIs Document")
    .setVersion("1.0")
    .addBearerAuth({
      description: `Please enter token in following format: Bearer JWT`,
      name: "Authorization",
      bearerFormat: "Bearer",
      scheme: "Bearer",
      type: "http",
      in: "Header",
    })
    .build();

  const app = await NestFactory.create(AppModule);
  const PORT = process.env.PORT || 3000;
  app.setGlobalPrefix("api");

  // Use this pipe for handle validation input error at DTO - If not have custom pipe
  app.enableCors({});
  app.useGlobalPipes(new ValidationPipe());

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api-docs", app, document);

  await app.listen(PORT, () =>
    logger.debug(`Service is listening on Port: ${PORT}`),
  );
  logger.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
