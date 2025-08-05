import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserRequest } from '../interfaces/user.interface';

export const User = createParamDecorator(
  (data: keyof UserRequest['user'], ctx: ExecutionContext) => {
    const request: UserRequest = ctx.switchToHttp().getRequest();

    if (!request.user) {
      return null;
    }

    return data ? request.user[data] : request.user;
  },
);
