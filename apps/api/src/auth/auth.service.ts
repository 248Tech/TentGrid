import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async findOrCreateUser(params: {
    email: string;
    fullName: string;
    authProvider: string;
    authSubject: string;
    avatarUrl?: string;
  }) {
    const { email, fullName, authProvider, authSubject, avatarUrl } = params;

    const existing = await this.prisma.user.findUnique({
      where: { email },
      include: {
        memberships: {
          where: { status: "ACTIVE" },
          include: { team: true },
        },
      },
    });

    if (existing) {
      await this.prisma.user.update({
        where: { id: existing.id },
        data: { lastActiveAt: new Date(), avatarUrl: avatarUrl ?? existing.avatarUrl },
      });
      return existing;
    }

    return this.prisma.user.create({
      data: { email, fullName, authProvider, authSubject, avatarUrl },
      include: {
        memberships: {
          where: { status: "ACTIVE" },
          include: { team: true },
        },
      },
    });
  }

  async getUserWithMemberships(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        memberships: {
          where: { status: "ACTIVE" },
          include: { team: { select: { id: true, name: true, slug: true } } },
        },
      },
    });

    if (!user) throw new UnauthorizedException("User not found");
    return user;
  }
}
