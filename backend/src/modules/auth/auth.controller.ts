import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Request, Response } from "express";
import { apiError } from "@common/errors/api-error";
import { AuthService } from "./auth.service";
import {
  ACCESS_COOKIE_NAME,
  clearAuthCookies,
  REFRESH_COOKIE_NAME,
  setAccessCookie,
  setRefreshCookie,
} from "./auth.cookies";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Post("login")
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ip = req.ip ?? req.socket.remoteAddress ?? "unknown";
    const userAgent = req.headers["user-agent"] ?? "unknown";

    const result = await this.auth.login(dto, ip, userAgent);
    setAccessCookie(res, this.config, result.accessToken);
    setRefreshCookie(res, this.config, result.refreshToken);
    return result;
  }

  @Post("register")
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.auth.register(dto);
    setAccessCookie(res, this.config, result.accessToken);
    setRefreshCookie(res, this.config, result.refreshToken);
    res.status(201);
    return result;
  }

  @Post("refresh")
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME] as
      | string
      | undefined;
    if (!refreshToken) {
      throw new UnauthorizedException(
        apiError("REFRESH_TOKEN_MISSING", "Refresh token отсутствует"),
      );
    }

    const result = await this.auth.refresh(refreshToken);
    setAccessCookie(res, this.config, result.accessToken);
    setRefreshCookie(res, this.config, result.refreshToken);
    return result;
  }

  @Post("logout")
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.auth.logoutByTokens(
      this.getTokenFromRequest(req),
      req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined,
    );
    clearAuthCookies(res);
    return { ok: true };
  }

  @Get("me")
  async me(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = this.getTokenFromRequest(req);
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME] as
      | string
      | undefined;
    const session = await this.auth.resolveSession(token, refreshToken);

    if ("accessToken" in session) {
      setAccessCookie(res, this.config, session.accessToken);
      setRefreshCookie(res, this.config, session.refreshToken);
      return {
        id: session.id,
        username: session.username,
        fullName: session.fullName,
        role: session.role,
        isAuthenticated: session.isAuthenticated,
        groupId: session.groupId,
        studentId: session.studentId,
        teacherId: session.teacherId,
      };
    }

    return session;
  }

  private getTokenFromRequest(req: Request) {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) return authHeader.slice(7);
    return req.cookies?.[ACCESS_COOKIE_NAME] as string | undefined;
  }
}
