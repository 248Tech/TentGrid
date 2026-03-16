import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";

@Injectable()
export class TeamsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findById(id: string) {
    const team = await this.prisma.team.findUnique({ where: { id } });
    if (!team) throw new NotFoundException("Team not found");
    return team;
  }

  async listMembers(teamId: string) {
    return this.prisma.teamMembership.findMany({
      where: { teamId, status: "ACTIVE" },
      include: { user: { select: { id: true, email: true, fullName: true, avatarUrl: true } } },
      orderBy: { createdAt: "asc" },
    });
  }

  async updateMemberRole(teamId: string, userId: string, role: string, actorUserId: string) {
    const membership = await this.prisma.teamMembership.findUnique({
      where: { teamId_userId: { teamId, userId } },
    });
    if (!membership) throw new NotFoundException("Membership not found");

    const updated = await this.prisma.teamMembership.update({
      where: { teamId_userId: { teamId, userId } },
      data: { role: role as any },
    });

    await this.audit.log({
      teamId,
      actorUserId,
      entityType: "TEAM_MEMBERSHIP",
      entityId: membership.id,
      action: "UPDATED",
      metadata: { role },
    });

    return updated;
  }
}
