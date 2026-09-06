import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { RegisterRequest } from "./dto/register.dto";
import { hash, verify } from "argon2";
import { ConfigService } from "@nestjs/config";
import { JwtService, JwtSignOptions } from "@nestjs/jwt";
import type { JwtPayload } from "./interfaces/jwt.interface";
import { LoginRequest } from "./dto/login.dto";
import type { Request, Response } from "express";
import { isDev } from "../utils/is-dev.utils";
import ms from "ms";

@Injectable()
export class AuthService {
  private readonly JWT_ACCESS_TOKEN_TTL: JwtSignOptions["expiresIn"];
  private readonly JWT_REFRESH_TOKEN_TTL: JwtSignOptions["expiresIn"];

  private readonly COOKIE_DOMAIN: string;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.JWT_ACCESS_TOKEN_TTL = configService.getOrThrow(
      "JWT_ACCESS_TOKEN_TTL",
    );
    this.JWT_REFRESH_TOKEN_TTL = configService.getOrThrow(
      "JWT_REFRESH_TOKEN_TTL",
    );

    this.COOKIE_DOMAIN = configService.getOrThrow("COOKIE_DOMAIN");
  }

  async register(res: Response, dto: RegisterRequest) {
    const { name, email, password } = dto;

    const existUser = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (existUser) {
      throw new ConflictException("Пользователь с такой почтой уже существует");
    }

    const user = await this.prismaService.user.create({
      data: { name, email, password: await hash(password) },
    });

    return this.auth(res, user.id);
  }

  async login(res: Response, dto: LoginRequest) {
    const { email, password } = dto;

    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        password: true,
      },
    });

    if (!user) {
      throw new NotFoundException("Пользователь не найден");
    }

    const isValidPassword = await verify(user.password, password);

    if (!isValidPassword) {
      throw new NotFoundException("Пользователь не найден");
    }

    return this.auth(res, user.id);
  }

  async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies["refreshToken"] as string;

    if (!refreshToken) {
      throw new UnauthorizedException("Недействительный рефреш токен");
    }

    const payload: JwtPayload = await this.jwtService.verifyAsync(refreshToken);

    const user = await this.prismaService.user.findUnique({
      where: {
        id: payload.id,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      throw new NotFoundException("Пользователь не найден");
    }

    return this.auth(res, user.id);
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async logout(res: Response) {
    this.setCookie(res, "refreshToken", new Date(0));
    return true;
  }

  private auth(res: Response, id: string) {
    const { accessToken, refreshToken } = this.generateTokens(id);

    this.setCookie(
      res,
      refreshToken,
      new Date(Date.now() + ms(this.JWT_REFRESH_TOKEN_TTL as ms.StringValue)),
    );

    return { accessToken };
  }

  private generateTokens(id: string) {
    const payload: JwtPayload = { id };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.JWT_ACCESS_TOKEN_TTL,
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.JWT_REFRESH_TOKEN_TTL,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  private setCookie(res: Response, value: string, expires: Date) {
    res.cookie("refreshToken", value, {
      httpOnly: true,
      domain: this.COOKIE_DOMAIN,
      expires,
      secure: !isDev(this.configService),
      sameSite: isDev(this.configService) ? "none" : "lax",
    });
  }
}
