import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";

interface CanvasObjectLike {
  type: string;
}

function computeCountsSummary(objects: CanvasObjectLike[]) {
  const countsByType: Record<string, number> = {};
  for (const obj of objects) {
    countsByType[obj.type] = (countsByType[obj.type] ?? 0) + 1;
  }
  return {
    totalObjects: objects.length,
    tableCount: countsByType["TABLE"] ?? 0,
    chairCount: countsByType["CHAIR"] ?? 0,
    countsByType,
  };
}

@Injectable()
export class ProjectVersionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  private async assertProjectBelongsToTeam(teamId: string, projectId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, teamId, archivedAt: null },
    });
    if (!project) throw new NotFoundException("Project not found");
    return project;
  }

  async saveVersion(
    teamId: string,
    projectId: string,
    userId: string,
    data: {
      canvasDocument: Record<string, unknown> | null;
      source: "AUTOSAVE" | "MANUAL";
      label?: string;
    },
  ) {
    await this.assertProjectBelongsToTeam(teamId, projectId);

    const aggregate = await this.prisma.projectVersion.aggregate({
      where: { projectId },
      _max: { versionNumber: true },
    });
    const nextVersionNumber = (aggregate._max.versionNumber ?? 0) + 1;

    const rawObjects = (data.canvasDocument?.["objects"] as CanvasObjectLike[] | undefined) ?? [];
    const countsSummary = computeCountsSummary(rawObjects);

    const version = await this.prisma.projectVersion.create({
      data: {
        projectId,
        versionNumber: nextVersionNumber,
        source: data.source as any,
        label: data.label ?? null,
        canvasDocument: (data.canvasDocument ?? undefined) as any,
        countsSummary: countsSummary as any,
        createdByUserId: userId,
        autosavedAt: data.source === "AUTOSAVE" ? new Date() : null,
      },
    });

    await this.prisma.project.update({
      where: { id: projectId },
      data: { currentVersionId: version.id, updatedByUserId: userId },
    });

    if (data.source === "MANUAL") {
      await this.audit.log({
        teamId,
        actorUserId: userId,
        entityType: "PROJECT_VERSION",
        entityId: version.id,
        action: "VERSION_SAVED",
        metadata: { projectId, versionNumber: nextVersionNumber, label: data.label },
      });
    }

    return version;
  }

  async getLatestVersion(teamId: string, projectId: string) {
    const project = await this.assertProjectBelongsToTeam(teamId, projectId);

    if (!project.currentVersionId) {
      return null;
    }

    const version = await this.prisma.projectVersion.findFirst({
      where: { id: project.currentVersionId, projectId },
    });
    return version ?? null;
  }

  async getVersion(teamId: string, projectId: string, versionId: string) {
    await this.assertProjectBelongsToTeam(teamId, projectId);

    const version = await this.prisma.projectVersion.findFirst({
      where: { id: versionId, projectId },
    });
    if (!version) throw new NotFoundException("Version not found");
    return version;
  }

  async listVersions(
    teamId: string,
    projectId: string,
    query?: { source?: "AUTOSAVE" | "MANUAL" | "TEMPLATE_SEED" | "IMPORT" | "AI_DRAFT"; limit?: number; offset?: number },
  ) {
    await this.assertProjectBelongsToTeam(teamId, projectId);

    return this.prisma.projectVersion.findMany({
      where: {
        projectId,
        ...(query?.source ? { source: query.source as any } : {}),
      },
      select: {
        id: true,
        projectId: true,
        versionNumber: true,
        source: true,
        label: true,
        countsSummary: true,
        thumbnailAssetId: true,
        createdByUserId: true,
        autosavedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: query?.limit ?? 50,
      skip: query?.offset ?? 0,
    });
  }

  async restoreVersion(teamId: string, projectId: string, userId: string, versionId: string) {
    const source = await this.getVersion(teamId, projectId, versionId);

    const aggregate = await this.prisma.projectVersion.aggregate({
      where: { projectId },
      _max: { versionNumber: true },
    });
    const nextVersionNumber = (aggregate._max.versionNumber ?? 0) + 1;

    const rawObjects = ((source.canvasDocument as any)?.["objects"] as CanvasObjectLike[] | undefined) ?? [];
    const countsSummary = computeCountsSummary(rawObjects);

    const restored = await this.prisma.projectVersion.create({
      data: {
        projectId,
        versionNumber: nextVersionNumber,
        source: "MANUAL",
        label: `Restored from v${source.versionNumber}`,
        canvasDocument: (source.canvasDocument ?? undefined) as any,
        countsSummary: countsSummary as any,
        createdByUserId: userId,
        autosavedAt: null,
      },
    });

    await this.prisma.project.update({
      where: { id: projectId },
      data: { currentVersionId: restored.id, updatedByUserId: userId },
    });

    await this.audit.log({
      teamId,
      actorUserId: userId,
      entityType: "PROJECT_VERSION",
      entityId: restored.id,
      action: "VERSION_RESTORED",
      metadata: { projectId, restoredFromVersionId: versionId, restoredFromVersionNumber: source.versionNumber },
    });

    return restored;
  }
}
