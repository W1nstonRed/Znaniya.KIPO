import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { CurrentUser, JwtPayload } from "@common/types/current-user";
import { PrismaService } from "@database/prisma.service";
import { ExtractJwt, Strategy } from "passport-jwt";

function tokenFromCookie(request: { cookies?: Record<string, string> }) {
  return request.cookies?.auth_token ?? null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        tokenFromCookie,
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get<string>("JWT_SECRET", "dev_jwt_secret"),
    });
  }

  async validate(payload: JwtPayload): Promise<CurrentUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        student: true,
        teacher: true,
      },
    });

    if (!user) return null;

    const fullName =
      user.student?.fullName ?? user.teacher?.fullName ?? user.displayName ?? null;

    return {
      id: user.id,
      username: user.username,
      fullName,
      role: user.role,
      isAuthenticated: true,
      groupId: user.student?.groupId,
      studentId: user.student?.id,
      teacherId: user.teacher?.id,
    };
  }
}
