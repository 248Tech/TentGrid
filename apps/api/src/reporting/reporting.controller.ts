import { Controller, Get, Post, Param, Body } from "@nestjs/common";
import { ReportingService, TableNumberingOptions } from "./reporting.service";

@Controller("v1/teams/:teamId/projects/:projectId")
export class ReportingController {
  constructor(private readonly reporting: ReportingService) {}

  @Get("versions/:versionId/counts")
  getCounts(
    @Param("teamId") teamId: string,
    @Param("projectId") projectId: string,
    @Param("versionId") versionId: string,
  ) {
    return this.reporting.getVersionCounts(teamId, projectId, versionId);
  }

  @Post("versions/:versionId/number-tables")
  async numberTables(
    @Param("teamId") teamId: string,
    @Param("projectId") projectId: string,
    @Param("versionId") versionId: string,
    @Body() body: TableNumberingOptions,
  ) {
    const version = await this.reporting.getVersionCanvasDocument(teamId, projectId, versionId);
    const canvasDoc = version.canvasDocument as Record<string, unknown> | null;
    const objects = ((canvasDoc?.["objects"] as unknown[]) ?? []) as any[];
    const updated = this.reporting.numberTables(objects, body);
    const updatedDoc = canvasDoc ? { ...canvasDoc, objects: updated } : { objects: updated };
    const counts = this.reporting.computeCounts(updatedDoc);
    return { objects: updated, counts };
  }
}
