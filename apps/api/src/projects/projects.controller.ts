import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from "@nestjs/common";
import { ProjectsService } from "./projects.service";

@Controller("v1/teams/:teamId/projects")
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get("search")
  search(
    @Param("teamId") teamId: string,
    @Query("q") q?: string,
    @Query("status") status?: string,
    @Query("eventDateFrom") eventDateFrom?: string,
    @Query("eventDateTo") eventDateTo?: string,
    @Query("limit") limit?: string,
    @Query("offset") offset?: string,
  ) {
    return this.projects.search(teamId, {
      q, status, eventDateFrom, eventDateTo,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });
  }

  @Get()
  list(
    @Param("teamId") teamId: string,
    @Query("status") status?: string,
    @Query("limit") limit?: string,
    @Query("offset") offset?: string,
  ) {
    return this.projects.list(teamId, {
      status,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });
  }

  @Get(":id")
  findOne(@Param("teamId") teamId: string, @Param("id") id: string) {
    return this.projects.findById(teamId, id);
  }

  @Post()
  create(
    @Param("teamId") teamId: string,
    @Body() body: any,
  ) {
    const { actorUserId, ...data } = body;
    return this.projects.create(teamId, actorUserId, data);
  }

  @Patch(":id")
  update(
    @Param("teamId") teamId: string,
    @Param("id") id: string,
    @Body() body: any,
  ) {
    const { actorUserId, ...data } = body;
    return this.projects.update(teamId, id, actorUserId, data);
  }

  @Delete(":id")
  archive(
    @Param("teamId") teamId: string,
    @Param("id") id: string,
    @Body() body: { actorUserId: string },
  ) {
    return this.projects.archive(teamId, id, body.actorUserId);
  }
}
