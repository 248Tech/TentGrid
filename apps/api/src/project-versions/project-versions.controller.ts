import { Controller, Get, Post, Param, Body, Query } from "@nestjs/common";
import { ProjectVersionsService } from "./project-versions.service";

@Controller("v1/teams/:teamId/projects/:projectId/versions")
export class ProjectVersionsController {
  constructor(private readonly versions: ProjectVersionsService) {}

  @Get()
  list(
    @Param("teamId") teamId: string,
    @Param("projectId") projectId: string,
    @Query("source") source?: string,
    @Query("limit") limit?: string,
    @Query("offset") offset?: string,
  ) {
    return this.versions.listVersions(teamId, projectId, {
      source: source as any,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });
  }

  @Get("latest")
  getLatest(
    @Param("teamId") teamId: string,
    @Param("projectId") projectId: string,
  ) {
    return this.versions.getLatestVersion(teamId, projectId);
  }

  @Get(":versionId")
  getOne(
    @Param("teamId") teamId: string,
    @Param("projectId") projectId: string,
    @Param("versionId") versionId: string,
  ) {
    return this.versions.getVersion(teamId, projectId, versionId);
  }

  @Post()
  createSnapshot(
    @Param("teamId") teamId: string,
    @Param("projectId") projectId: string,
    @Body() body: { actorUserId: string; label: string; canvasDocument?: Record<string, unknown>; countsSummary?: Record<string, unknown> },
  ) {
    return this.versions.saveVersion(teamId, projectId, body.actorUserId, {
      source: "MANUAL",
      label: body.label,
      canvasDocument: body.canvasDocument ?? null,
    });
  }

  @Post(":versionId/restore")
  restore(
    @Param("teamId") teamId: string,
    @Param("projectId") projectId: string,
    @Param("versionId") versionId: string,
    @Body() body: { actorUserId: string },
  ) {
    return this.versions.restoreVersion(teamId, projectId, body.actorUserId, versionId);
  }
}
