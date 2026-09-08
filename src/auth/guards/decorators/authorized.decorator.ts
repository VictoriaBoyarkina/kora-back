import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { Request } from "express";
import type { User } from "../../../../generated/prisma/client";

export const Authorized = createParamDecorator(
  (data: keyof User | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();

    const user = request.user as User | undefined;

    return data ? user?.[data] : user;
  },
);
