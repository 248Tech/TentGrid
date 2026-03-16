import { Controller, Get, Post, Param, Body, NotFoundException } from "@nestjs/common";
import { JobsService } from "./jobs.service";

@Controller()
export class JobsController {
  constructor(private readonly jobs: JobsService) {}

  @Get("v1/jobs/status")
  getStatus() {
    return this.jobs.getQueueStatus();
  }

  @Post("v1/teams/:teamId/projects/:projectId/exports")
  async createExport(
    @Param("teamId") teamId: string,
    @Param("projectId") projectId: string,
    @Body()
    body: {
      exportType: "PNG" | "PDF";
      projectVersionId: string;
      requestedByUserId: string;
    },
  ) {
    return this.jobs.createAndEnqueueExport(
      teamId,
      projectId,
      body.projectVersionId,
      body.exportType,
      body.requestedByUserId,
    );
  }

  @Get("v1/teams/:teamId/projects/:projectId/exports/:exportId")
  async getExport(
    @Param("teamId") teamId: string,
    @Param("projectId") projectId: string,
    @Param("exportId") exportId: string,
  ) {
    const job = await this.jobs.getExportJob(teamId, projectId, exportId);
    if (!job) throw new NotFoundException("Export job not found");
    return job;
  }
}
