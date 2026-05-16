import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Request, Response } from "express";
import type { CurrentUser } from "@common/types/current-user";
import { apiError } from "@common/errors/api-error";
import { AuthService } from "../auth.service";
import {
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  setAccessCookie,
  setRefreshCookie,
} from "../auth.cookies";

type AuthRequest = Request & {
  user?: CurrentUser;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const response = context.switchToHttp().getResponse<Response>();
    const accessToken = this.getAccessToken(request);
    const refreshToken = request.cookies?.[REFRESH_COOKIE_NAME] as
      | string
      | undefined;

    if (!accessToken && !refreshToken) {
      throw new UnauthorizedException(
        apiError("AUTH_REQUIRED", "Требуется авторизация"),
      );
    }

    if (accessToken) {
      try {
        request.user = await this.auth.validateAccessToken(accessToken);
        return true;
      } catch (e) {
        if (!this.isAccessExpiredError(e)) throw e;
      }
    }

    if (!refreshToken) {
      throw new UnauthorizedException(
        apiError("ACCESS_TOKEN_EXPIRED", "Срок действия access token истек"),
      );
    }

    const session = await this.auth.refresh(refreshToken, {
      rotateRefresh: false,
    });
    setAccessCookie(response, this.config, session.accessToken);
    setRefreshCookie(response, this.config, session.refreshToken);

    request.user = {
      id: session.id,
      username: session.username,
      fullName: session.fullName,
      role: session.role,
      isAuthenticated: session.isAuthenticated,
      groupId: session.groupId,
      studentId: session.studentId,
      teacherId: session.teacherId,
    };

    return true;
  }

  private getAccessToken(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) return authHeader.slice(7);
    return request.cookies?.[ACCESS_COOKIE_NAME] as string | undefined;
  }

  private isAccessExpiredError(error: unknown): boolean {
    if (!(error instanceof UnauthorizedException)) return false;

    const response = error.getResponse();
    if (typeof response !== "object" || response === null) return false;

    return (response as { code?: string }).code === "ACCESS_TOKEN_EXPIRED";
  }
}
