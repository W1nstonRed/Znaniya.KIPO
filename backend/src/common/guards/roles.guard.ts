import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "@common/decorators/roles.decorator";
import type { CurrentUser } from "@common/types/current-user";
import { apiError } from "@common/errors/api-error";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!required || required.length === 0) return true;

    const request = context.switchToHttp().getRequest<{ user?: CurrentUser }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException(
        apiError("FORBIDDEN", "Недостаточно прав"),
      );
    }

    if (!required.includes(user.role)) {
      throw new ForbiddenException(
        apiError("FORBIDDEN", "Недостаточно прав"),
      );
    }

    return true;
  }
}
