import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { Request, Response } from "express";
import type { ApiErrorBody } from "@common/errors/api-error";

type ErrorResponse = {
  ok: false;
  error: ApiErrorBody;
  meta: {
    statusCode: number;
    path: string;
    timestamp: string;
  };
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const statusCode = this.getStatusCode(exception);
    const error = this.getErrorBody(exception, statusCode);

    const payload: ErrorResponse = {
      ok: false,
      error,
      meta: {
        statusCode,
        path: request.url,
        timestamp: new Date().toISOString(),
      },
    };

    response.status(statusCode).json(payload);
  }

  private getStatusCode(exception: unknown): number {
    if (exception instanceof HttpException) return exception.getStatus();

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === "P2002") return HttpStatus.CONFLICT;
      if (exception.code === "P2025") return HttpStatus.NOT_FOUND;
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private getErrorBody(
    exception: unknown,
    statusCode: number,
  ): ApiErrorBody {
    if (exception instanceof HttpException) {
      return this.normalizeHttpException(exception, statusCode);
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === "P2002") {
        return {
          code: "UNIQUE_CONSTRAINT_FAILED",
          message: "Такая запись уже существует",
          details: exception.meta,
        };
      }

      if (exception.code === "P2025") {
        return {
          code: "RECORD_NOT_FOUND",
          message: "Запись не найдена",
          details: exception.meta,
        };
      }

      return {
        code: "DATABASE_ERROR",
        message: "Ошибка базы данных",
        details: { prismaCode: exception.code },
      };
    }

    return {
      code: this.defaultCode(statusCode),
      message: "Внутренняя ошибка сервера",
    };
  }

  private normalizeHttpException(
    exception: HttpException,
    statusCode: number,
  ): ApiErrorBody {
    const response = exception.getResponse();

    if (typeof response === "string") {
      return {
        code: this.defaultCode(statusCode),
        message: response,
      };
    }

    if (typeof response === "object" && response !== null) {
      const body = response as Record<string, unknown>;
      const message = body.message;
      const normalizedMessage = Array.isArray(message)
        ? message.join("; ")
        : typeof message === "string"
          ? message
          : exception.message;

      return {
        code:
          typeof body.code === "string"
            ? body.code
            : this.defaultCode(statusCode),
        message: normalizedMessage,
        details: body.details ?? (Array.isArray(message) ? message : undefined),
      };
    }

    return {
      code: this.defaultCode(statusCode),
      message: exception.message,
    };
  }

  private defaultCode(statusCode: number): string {
    switch (statusCode) {
      case HttpStatus.BAD_REQUEST:
        return "BAD_REQUEST";
      case HttpStatus.UNAUTHORIZED:
        return "UNAUTHORIZED";
      case HttpStatus.FORBIDDEN:
        return "FORBIDDEN";
      case HttpStatus.NOT_FOUND:
        return "NOT_FOUND";
      case HttpStatus.CONFLICT:
        return "CONFLICT";
      default:
        return "INTERNAL_SERVER_ERROR";
    }
  }
}
