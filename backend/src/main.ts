import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";
import { apiError } from "@common/errors/api-error";
import { HttpExceptionFilter } from "@common/filters/http-exception.filter";

function flattenValidationErrors(errors: ValidationError[]): string[] {
  return errors.flatMap((error) => {
    const ownErrors = error.constraints ? Object.values(error.constraints) : [];
    const childErrors = error.children?.length
      ? flattenValidationErrors(error.children)
      : [];

    return [...ownErrors, ...childErrors];
  });
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  app.use(cookieParser());
  app.enableCors({
    origin: config.get<string>("FRONTEND_ORIGIN", "http://localhost:5173"),
    credentials: true,
  });
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors) =>
        new BadRequestException(
          apiError(
            "VALIDATION_ERROR",
            "Некорректные данные запроса",
            flattenValidationErrors(errors),
          ),
        ),
    }),
  );

  const port = config.get<number>("PORT", 3000);
  await app.listen(port);
}

void bootstrap();
