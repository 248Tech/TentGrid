import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async list(teamId: string, query?: { status?: string; limit?: number; offset?: number }) {
    return this.prisma.project.findMany({
      where: {
        teamId,
        archivedAt: null,
        ...(query?.status ? { status: query.status as any } : {}),
      },
      include: {
        venue: { select: { id: true, name: true } },
        template: { select: { id: true, name: true } },
        createdBy: { select: { id: true, fullName: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: query?.limit ?? 50,
      skip: query?.offset ?? 0,
    });
  }

  async findById(teamId: string, id: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, teamId, archivedAt: null },
      include: {
        venue: true,
        template: { select: { id: true, name: true } },
        versions: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: { id: true, versionNumber: true, source: true, label: true, createdAt: true, autosavedAt: true },
        },
      },
    });
    if (!project) throw new NotFoundException("Project not found");
    return project;
  }

  async create(teamId: string, userId: string, data: {
    projectNumber: string;
    clientFirstName: string;
    clientLastName: string;
    eventDate: string;
    clientCompany?: string;
    venueNameSnapshot?: string;
    venueId?: string;
    templateId?: string;
    notes?: string;
  }) {
    const project = await this.prisma.project.create({
      data: {
        teamId,
        projectNumber: data.projectNumber,
        clientFirstName: data.clientFirstName,
        clientLastName: data.clientLastName,
        eventDate: new Date(data.eventDate),
        clientCompany: data.clientCompany,
        venueNameSnapshot: data.venueNameSnapshot,
        venueId: data.venueId,
        templateId: data.templateId,
        notes: data.notes,
        createdByUserId: userId,
        updatedByUserId: userId,
      },
    });

    await this.audit.log({
      teamId,
      actorUserId: userId,
      entityType: "PROJECT",
      entityId: project.id,
      action: "CREATED",
      metadata: { projectNumber: project.projectNumber },
    });

    return project;
  }

  async update(teamId: string, id: string, userId: string, data: Partial<{
    status: string;
    clientFirstName: string;
    clientLastName: string;
    venueNameSnapshot: string;
    notes: string;
  }>) {
    const project = await this.findById(teamId, id);

    const updated = await this.prisma.project.update({
      where: { id: project.id },
      data: { ...data, status: data.status as any, updatedByUserId: userId },
    });

    await this.audit.log({
      teamId,
      actorUserId: userId,
      entityType: "PROJECT",
      entityId: id,
      action: "UPDATED",
      metadata: { fields: Object.keys(data) },
    });

    return updated;
  }

  async archive(teamId: string, id: string, userId: string) {
    await this.findById(teamId, id);
    const updated = await this.prisma.project.update({
      where: { id },
      data: { archivedAt: new Date(), updatedByUserId: userId },
    });

    await this.audit.log({
      teamId, actorUserId: userId, entityType: "PROJECT", entityId: id, action: "ARCHIVED", metadata: {},
    });

    return updated;
  }

  async search(teamId: string, query: {
    q?: string;
    status?: string;
    eventDateFrom?: string;
    eventDateTo?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: Prisma.ProjectWhereInput = {
      teamId,
      archivedAt: null,
      ...(query.status ? { status: query.status as any } : {}),
      ...(query.eventDateFrom || query.eventDateTo
        ? {
            eventDate: {
              ...(query.eventDateFrom ? { gte: new Date(query.eventDateFrom) } : {}),
              ...(query.eventDateTo ? { lte: new Date(query.eventDateTo) } : {}),
            },
          }
        : {}),
      ...(query.q
        ? {
            OR: [
              { projectNumber: { contains: query.q, mode: "insensitive" } },
              { clientFirstName: { contains: query.q, mode: "insensitive" } },
              { clientLastName: { contains: query.q, mode: "insensitive" } },
              { venueNameSnapshot: { contains: query.q, mode: "insensitive" } },
              { addressLine1: { contains: query.q, mode: "insensitive" } },
              { city: { contains: query.q, mode: "insensitive" } },
              { state: { contains: query.q, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    return this.prisma.project.findMany({
      where,
      include: {
        venue: { select: { id: true, name: true } },
        versions: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { id: true, versionNumber: true, source: true, label: true, createdAt: true, thumbnailAssetId: true },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: query.limit ?? 20,
      skip: query.offset ?? 0,
    });
  }
}
