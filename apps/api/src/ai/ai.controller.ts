import { Controller, Get, Post, Param, Body, Query } from "@nestjs/common";
import { AiService } from "./ai.service";

@Controller("v1/teams/:teamId/ai")
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Post("jobs")
  submit(
    @Param("teamId") teamId: string,
    @Body() body: { assetId: string; projectId?: string; userId: string; parameters?: Record<string, unknown> },
  ) {
    return this.ai.submitDiagramJob({
      teamId,
      userId: body.userId,
      assetId: body.assetId,
      projectId: body.projectId,
      parameters: body.parameters,
    });
  }

  @Get("jobs")
  list(@Param("teamId") teamId: string, @Query("projectId") projectId?: string) {
    return this.ai.listJobs(teamId, projectId);
  }

  @Get("jobs/:jobId")
  getJob(@Param("teamId") teamId: string, @Param("jobId") jobId: string) {
    return this.ai.getJob(teamId, jobId);
  }

  @Post("jobs/:jobId/accept")
  acceptDraft(
    @Param("teamId") teamId: string,
    @Param("jobId") jobId: string,
    @Body() body: { projectId: string; userId: string; label?: string },
  ) {
    return this.ai.acceptDraft({ teamId, jobId, ...body });
  }
}
