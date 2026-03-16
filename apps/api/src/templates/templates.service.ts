import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";

@Injectable()
export class TemplatesService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  async list(teamId: string) {
    return this.prisma.template.findMany({
      where: { teamId, archivedAt: null },
      orderBy: { name: "asc" },
    });
  }

  async findById(teamId: string, id: string) {
    const template = await this.prisma.template.findFirst({ where: { id, teamId, archivedAt: null } });
    if (!template) throw new NotFoundException("Template not found");
    return template;
  }

  async create(teamId: string, userId: string, data: { name: string; category?: string; description?: string; canvasDocument?: any }) {
    const template = await this.prisma.template.create({
      data: { teamId, ...data, createdByUserId: userId, updatedByUserId: userId },
    });
    await this.audit.log({ teamId, actorUserId: userId, entityType: "TEMPLATE", entityId: template.id, action: "CREATED", metadata: { name: template.name } });
    return template;
  }
}
