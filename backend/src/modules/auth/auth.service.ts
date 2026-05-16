import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "@database/prisma.service";
import { CurrentUser, JwtPayload } from "@common/types/current-user";
import { apiError } from "@common/errors/api-error";
import { normalizeName, normalizeTeacherName } from "@common/utils/normalize";
import * as bcrypt from "bcrypt";
import type { StringValue } from "ms";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { PushService } from "@modules/push/push.service";

type AuthResponse = CurrentUser & {
  accessToken: string;
  refreshToken: string;
};

type UserWithProfile = {
  id: string;
  username: string;
  role: CurrentUser["role"];
  displayName?: string | null;
  student?: { id: string; fullName: string; groupId: string } | null;
  teacher?: { id: string; fullName: string } | null;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly push: PushService,
  ) {}

  async login(
    dto: LoginDto,
    ip: string,
    userAgent: string,
  ): Promise<AuthResponse> {
    const username = dto.username.trim();
    const password = dto.password.trim();

    const user = await this.prisma.user.findUnique({
      where: { username },
      include: { student: true, teacher: true },
    });

    const isPasswordValid = user
      ? await bcrypt.compare(password, user.password)
      : false;

    if (!user || !isPasswordValid) {
      throw new UnauthorizedException(
        apiError("INVALID_CREDENTIALS", "Неверный логин или пароль"),
      );
    }

    await this.checkDevice(user.id, ip, userAgent);

    return this.createAuthResponse(this.toCurrentUser(user), user.id);
  }

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const username = dto.username.trim();
    const password = dto.password.trim();

    const exists = await this.prisma.user.findUnique({ where: { username } });
    if (exists) {
      throw new ConflictException(
        apiError("USERNAME_TAKEN", "Username уже занят"),
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const person = await this.resolveRegistrationPerson(dto);
    const displayName = dto.fullName?.trim() ?? null;

    const user = await this.prisma.user.create({
      data: {
        username,
        password: passwordHash,
        role: dto.role,
        displayName,
        ...(person.studentId && {
          student: { connect: { id: person.studentId } },
        }),
        ...(person.teacherId && {
          teacher: { connect: { id: person.teacherId } },
        }),
      },
      include: { student: true, teacher: true },
    });

    return this.createAuthResponse(this.toCurrentUser(user), user.id);
  }

  async validateAccessToken(token: string): Promise<CurrentUser> {
    let payload: JwtPayload;

    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(token, {
        secret: this.config.get<string>("JWT_SECRET", "dev_jwt_secret"),
      });
    } catch (e) {
      if ((e as Error).name === "TokenExpiredError") {
        throw new UnauthorizedException(
          apiError("ACCESS_TOKEN_EXPIRED", "Срок действия access token истек"),
        );
      }

      throw new UnauthorizedException(
        apiError("ACCESS_TOKEN_INVALID", "Access token недействителен"),
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { student: true, teacher: true },
    });

    if (!user) {
      throw new UnauthorizedException(
        apiError("USER_NOT_FOUND", "Пользователь не найден"),
      );
    }

    return this.toCurrentUser(user);
  }

  async refresh(
    refreshToken: string,
    options: { rotateRefresh?: boolean } = {},
  ): Promise<AuthResponse> {
    if (!refreshToken) {
      throw new UnauthorizedException(
        apiError("REFRESH_TOKEN_MISSING", "Refresh token отсутствует"),
      );
    }

    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.config.get<string>(
          "JWT_REFRESH_SECRET",
          "dev_refresh_secret",
        ),
      });
    } catch {
      throw new UnauthorizedException(
        apiError("REFRESH_TOKEN_INVALID", "Refresh token недействителен"),
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { student: true, teacher: true },
    });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException(
        apiError("SESSION_EXPIRED", "Сессия истекла"),
      );
    }

    const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isValid) {
      throw new UnauthorizedException(
        apiError("REFRESH_TOKEN_INVALID", "Refresh token недействителен"),
      );
    }

    const currentUser = this.toCurrentUser(user);
    if (options.rotateRefresh === false) {
      return {
        ...currentUser,
        accessToken: this.createAccessToken(currentUser),
        refreshToken,
      };
    }

    return this.createAuthResponse(currentUser, user.id);
  }

  async resolveSession(
    accessToken?: string,
    refreshToken?: string,
  ): Promise<AuthResponse | CurrentUser | { user: null }> {
    if (accessToken) {
      try {
        return await this.validateAccessToken(accessToken);
      } catch (e) {
        const response =
          e instanceof UnauthorizedException ? e.getResponse() : null;
        const code =
          typeof response === "object" && response !== null
            ? (response as { code?: string }).code
            : null;

        if (code !== "ACCESS_TOKEN_EXPIRED" || !refreshToken) {
          this.logger.warn("Failed to resolve session from access token");
          return { user: null };
        }
      }
    }

    if (!refreshToken) return { user: null };

    try {
      return await this.refresh(refreshToken, { rotateRefresh: false });
    } catch (e) {
      this.logger.warn(`Failed to refresh session: ${(e as Error).message}`);
      return { user: null };
    }
  }

  async logoutByTokens(accessToken?: string, refreshToken?: string) {
    const userId =
      this.decodeSubjectUnsafe(accessToken) ??
      this.decodeSubjectUnsafe(refreshToken);

    if (userId) {
      await this.prisma.user.updateMany({
        where: { id: userId },
        data: { refreshToken: null },
      });
    }

    return { ok: true };
  }

  private async resolveRegistrationPerson(dto: RegisterDto) {
    if (dto.role === "STUDENT") {
      return { studentId: await this.resolveStudent(dto), teacherId: null };
    }

    if (dto.role === "TEACHER") {
      return { studentId: null, teacherId: await this.resolveTeacher(dto) };
    }

    throw new BadRequestException(
      apiError("REGISTRATION_ROLE_NOT_ALLOWED", "Эта роль недоступна"),
    );
  }

  private async resolveStudent(dto: RegisterDto): Promise<string> {
    if (dto.studentId) {
      const student = await this.prisma.student.findUnique({
        where: { id: dto.studentId },
      });

      if (!student) {
        throw new BadRequestException(
          apiError("STUDENT_NOT_FOUND", "Студент не найден"),
        );
      }

      if (student.userId) {
        throw new ConflictException(
          apiError("STUDENT_ALREADY_LINKED", "Студент уже привязан к аккаунту"),
        );
      }

      return student.id;
    }

    if (!dto.fullName || !dto.groupId) {
      throw new BadRequestException(
        apiError(
          "REGISTRATION_PERSON_REQUIRED",
          "Для студента нужно передать fullName и groupId",
        ),
      );
    }

    const group = await this.prisma.group.findUnique({
      where: { id: dto.groupId },
    });

    if (!group) {
      throw new BadRequestException(
        apiError("GROUP_NOT_FOUND", "Группа не найдена"),
      );
    }

    const fullName = dto.fullName.trim();
    const normalizedFullName = normalizeName(fullName);
    const existing = await this.prisma.student.findUnique({
      where: {
        normalizedFullName_groupId: {
          normalizedFullName,
          groupId: dto.groupId,
        },
      },
    });

    if (existing?.userId) {
      throw new ConflictException(
        apiError("STUDENT_ALREADY_LINKED", "Студент уже привязан к аккаунту"),
      );
    }

    if (existing) return existing.id;

    const student = await this.prisma.student.create({
      data: {
        fullName,
        normalizedFullName,
        groupId: dto.groupId,
      },
    });

    return student.id;
  }

  private async resolveTeacher(dto: RegisterDto): Promise<string> {
    if (dto.teacherId) {
      const teacher = await this.prisma.teacher.findUnique({
        where: { id: dto.teacherId },
      });

      if (!teacher) {
        throw new BadRequestException(
          apiError("TEACHER_NOT_FOUND", "Преподаватель не найден"),
        );
      }

      if (teacher.userId) {
        throw new ConflictException(
          apiError(
            "TEACHER_ALREADY_LINKED",
            "Преподаватель уже привязан к аккаунту",
          ),
        );
      }

      return teacher.id;
    }

    if (!dto.fullName) {
      throw new BadRequestException(
        apiError(
          "REGISTRATION_PERSON_REQUIRED",
          "Для преподавателя нужно передать fullName",
        ),
      );
    }

    const fullName = dto.fullName.trim();
    const normalizedFullName = normalizeTeacherName(fullName);
    const existing = await this.prisma.teacher.findUnique({
      where: { normalizedFullName },
    });

    if (existing?.userId) {
      throw new ConflictException(
        apiError(
          "TEACHER_ALREADY_LINKED",
          "Преподаватель уже привязан к аккаунту",
        ),
      );
    }

    if (existing) return existing.id;

    const teacher = await this.prisma.teacher.create({
      data: {
        fullName,
        normalizedFullName,
      },
    });

    return teacher.id;
  }

  private async checkDevice(userId: string, ip: string, userAgent: string) {
    const existing = await this.prisma.userDevice.findUnique({
      where: { userId_userAgent_ip: { userId, userAgent, ip } },
    });

    if (!existing) {
      await this.prisma.userDevice.create({
        data: { userId, userAgent, ip },
      });

      await this.push.sendToUser(
        userId,
        "Новый вход в аккаунт",
        `Вход с нового устройства: ${this.parseUserAgent(userAgent)}, IP: ${ip}`,
        "/profile",
      );
    } else {
      await this.prisma.userDevice.update({
        where: { userId_userAgent_ip: { userId, userAgent, ip } },
        data: { lastSeenAt: new Date() },
      });
    }
  }

  private parseUserAgent(userAgent: string): string {
    if (userAgent.includes("iPhone")) return "iPhone";
    if (userAgent.includes("Android")) return "Android";
    if (userAgent.includes("Windows")) return "Windows";
    if (userAgent.includes("Mac")) return "Mac";
    if (userAgent.includes("Linux")) return "Linux";
    return "Неизвестное устройство";
  }

  private async createAuthResponse(
    user: CurrentUser,
    userId: string,
  ): Promise<AuthResponse> {
    const accessToken = this.createAccessToken(user);
    const refreshToken = this.createRefreshToken(user);
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: refreshTokenHash },
    });

    return { ...user, accessToken, refreshToken };
  }

  private createAccessToken(user: CurrentUser): string {
    return this.jwt.sign(this.createPayload(user), {
      secret: this.config.get<string>("JWT_SECRET", "dev_jwt_secret"),
      expiresIn: this.config.get<StringValue>(
        "JWT_EXPIRES_IN",
        "15m" as StringValue,
      ),
    });
  }

  private createRefreshToken(user: CurrentUser): string {
    return this.jwt.sign(this.createPayload(user), {
      secret: this.config.get<string>(
        "JWT_REFRESH_SECRET",
        "dev_refresh_secret",
      ),
      expiresIn: this.config.get<StringValue>(
        "JWT_REFRESH_EXPIRES_IN",
        "7d" as StringValue,
      ),
    });
  }

  private createPayload(user: CurrentUser): JwtPayload {
    return {
      sub: user.id,
      username: user.username,
      role: user.role,
    };
  }

  private decodeSubjectUnsafe(token?: string): string | null {
    if (!token) return null;
    const decoded = this.jwt.decode(token);
    if (typeof decoded !== "object" || decoded === null) return null;
    const sub = (decoded as { sub?: unknown }).sub;
    return typeof sub === "string" ? sub : null;
  }

  private toCurrentUser(user: UserWithProfile): CurrentUser {
    const fullName =
      user.student?.fullName ??
      user.teacher?.fullName ??
      user.displayName ??
      null;

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
