import { NestFactory } from "@nestjs/core";
import { ValidationPipe, VersioningType } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";
import { createLogger } from "./common/logger";

async function bootstrap() {
  const logger = createLogger("Bootstrap");
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useLogger(logger);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: process.env["FRONTEND_URL"] ?? "http://localhost:3000",
    credentials: true,
  });

  app.enableVersioning({ type: VersioningType.URI });
  app.setGlobalPrefix("api", {
    exclude: ["health"],
  });

  const config = app.get(ConfigService);
  const port = config.get<number>("PORT") ?? 4000;

  await app.listen(port);
  logger.log(`EventGrid API running on http://localhost:${port}/api`);
}

bootstrap();
