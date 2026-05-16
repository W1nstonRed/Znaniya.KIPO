import { ConfigService } from "@nestjs/config";
import type { Response } from "express";

export const ACCESS_COOKIE_NAME = "auth_token";
export const REFRESH_COOKIE_NAME = "refresh_token";

const ONE_DAY_MS = 60 * 60 * 24 * 1000;
const SEVEN_DAYS_MS = ONE_DAY_MS * 7;

function cookieOptions(config: ConfigService, maxAge: number) {
  return {
    path: "/",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: config.get("COOKIE_SECURE", "false") === "true",
    maxAge,
  };
}

export function setAccessCookie(
  res: Response,
  config: ConfigService,
  token: string,
) {
  res.cookie(ACCESS_COOKIE_NAME, token, cookieOptions(config, ONE_DAY_MS));
}

export function setRefreshCookie(
  res: Response,
  config: ConfigService,
  token: string,
) {
  res.cookie(REFRESH_COOKIE_NAME, token, cookieOptions(config, SEVEN_DAYS_MS));
}

export function clearAuthCookies(res: Response) {
  res.clearCookie(ACCESS_COOKIE_NAME, { path: "/" });
  res.clearCookie(REFRESH_COOKIE_NAME, { path: "/" });
}
