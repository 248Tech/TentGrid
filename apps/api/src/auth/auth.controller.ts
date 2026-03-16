import { Controller, Get, Post, Body, Req, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import type { Request } from "express";

@Controller("v1/auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  /** Called by the frontend Auth.js callbacks to sync user data */
  @Post("sync")
  async syncUser(
    @Body() body: { email: string; name: string; provider: string; subject: string; avatarUrl?: string },
    @Req() req: Request,
  ) {
    const secret = req.headers["x-internal-secret"];
    if (secret !== process.env["API_INTERNAL_SECRET"]) {
      throw new UnauthorizedException("Invalid internal secret");
    }

    const user = await this.auth.findOrCreateUser({
      email: body.email,
      fullName: body.name,
      authProvider: body.provider,
      authSubject: body.subject,
      avatarUrl: body.avatarUrl,
    });

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      memberships: user.memberships,
    };
  }
}
