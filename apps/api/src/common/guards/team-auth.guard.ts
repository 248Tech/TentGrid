import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PrismaService } from "../../prisma/prisma.service";
import { ROLES_KEY } from "../decorators/roles.decorator";
import type { Request } from "express";

@Injectable()
export class TeamAuthGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request & { user?: any; teamMembership?: any }>();
    const user = req.user;

    if (!user?.id) {
      throw new UnauthorizedException("Authentication required");
    }

    const rawTeamId = req.params["teamId"] ?? req.headers["x-team-id"];
    const teamId = Array.isArray(rawTeamId) ? rawTeamId[0] : rawTeamId;
    if (!teamId) {
      throw new ForbiddenException("Team context required");
    }

    const membership = await this.prisma.teamMembership.findUnique({
      where: { teamId_userId: { teamId, userId: user.id } },
    });

    if (!membership || membership.status !== "ACTIVE") {
      throw new ForbiddenException("Not a member of this team");
    }

    req.teamMembership = membership;

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (requiredRoles && !requiredRoles.includes(membership.role)) {
      throw new ForbiddenException("Insufficient role for this action");
    }

    return true;
  }
}
