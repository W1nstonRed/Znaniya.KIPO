import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CurrentUser } from '@common/types/current-user';

type RequestWithUser = {
  user?: CurrentUser;
};

export const GetCurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    return request.user;
  },
);
