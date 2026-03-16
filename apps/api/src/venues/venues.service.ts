import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";

@Injectable()
export class VenuesService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  async list(teamId: string) {
    return this.prisma.venue.findMany({
      where: { teamId, archivedAt: null },
      orderBy: { name: "asc" },
    });
  }

  async findById(teamId: string, id: string) {
    const venue = await this.prisma.venue.findFirst({ where: { id, teamId, archivedAt: null } });
    if (!venue) throw new NotFoundException("Venue not found");
    return venue;
  }

  async create(teamId: string, userId: string, data: { name: string; addressLine1?: string; city?: string; state?: string; notes?: string }) {
    const venue = await this.prisma.venue.create({
      data: { teamId, ...data, createdByUserId: userId, updatedByUserId: userId },
    });
    await this.audit.log({ teamId, actorUserId: userId, entityType: "VENUE", entityId: venue.id, action: "CREATED", metadata: { name: venue.name } });
    return venue;
  }

  async update(teamId: string, id: string, userId: string, data: any) {
    await this.findById(teamId, id);
    const updated = await this.prisma.venue.update({ where: { id }, data: { ...data, updatedByUserId: userId } });
    await this.audit.log({ teamId, actorUserId: userId, entityType: "VENUE", entityId: id, action: "UPDATED", metadata: { fields: Object.keys(data) } });
    return updated;
  }

  async updateGeometry(teamId: string, id: string, userId: string, geometry: Record<string, unknown>) {
    await this.findById(teamId, id);
    const updated = await this.prisma.venue.update({ where: { id }, data: { geometry: geometry as any, updatedByUserId: userId } });
    await this.audit.log({ teamId, actorUserId: userId, entityType: "VENUE", entityId: id, action: "VENUE_GEOMETRY_UPDATED", metadata: {} });
    return updated;
  }

  async updateFixtures(teamId: string, id: string, userId: string, fixtures: Record<string, unknown>) {
    await this.findById(teamId, id);
    const updated = await this.prisma.venue.update({ where: { id }, data: { fixtures: fixtures as any, updatedByUserId: userId } });
    await this.audit.log({ teamId, actorUserId: userId, entityType: "VENUE", entityId: id, action: "VENUE_FIXTURES_UPDATED", metadata: {} });
    return updated;
  }

  async updateUtilities(teamId: string, id: string, userId: string, utilities: Record<string, unknown>) {
    await this.findById(teamId, id);
    const updated = await this.prisma.venue.update({ where: { id }, data: { utilities: utilities as any, updatedByUserId: userId } });
    await this.audit.log({ teamId, actorUserId: userId, entityType: "VENUE", entityId: id, action: "VENUE_UTILITIES_UPDATED", metadata: {} });
    return updated;
  }

  async updateDefaultMapView(teamId: string, id: string, userId: string, mapView: Record<string, unknown>) {
    await this.findById(teamId, id);
    const updated = await this.prisma.venue.update({ where: { id }, data: { defaultMapView: mapView as any, updatedByUserId: userId } });
    await this.audit.log({ teamId, actorUserId: userId, entityType: "VENUE", entityId: id, action: "VENUE_MAP_VIEW_UPDATED", metadata: {} });
    return updated;
  }

  async findByIdWithSpatial(teamId: string, id: string) {
    return this.findById(teamId, id);
  }

  async applyVenueDefaultsToProject(teamId: string, venueId: string, projectId: string, userId: string) {
    const venue = await this.findById(teamId, venueId);
    const project = await this.prisma.project.findFirst({ where: { id: projectId, teamId, archivedAt: null } });
    if (!project) throw new NotFoundException("Project not found");

    const updated = await this.prisma.project.update({
      where: { id: projectId },
      data: {
        defaultBackgroundMode: venue.defaultBackgroundMode,
        updatedByUserId: userId,
      },
    });

    await this.audit.log({
      teamId,
      actorUserId: userId,
      entityType: "VENUE",
      entityId: venueId,
      action: "VENUE_DEFAULTS_APPLIED",
      metadata: { venueId, projectId },
    });

    return updated;
  }
}
