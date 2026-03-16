import { Controller, Get, Param } from "@nestjs/common";
import { QuotesService } from "./quotes.service";

@Controller("v1/teams/:teamId/projects/:projectId/versions/:versionId/quote")
export class QuotesController {
  constructor(private readonly quotes: QuotesService) {}

  @Get()
  generate(
    @Param("teamId") teamId: string,
    @Param("projectId") projectId: string,
    @Param("versionId") versionId: string,
  ) {
    return this.quotes.generateQuoteSummary(teamId, projectId, versionId);
  }
}
