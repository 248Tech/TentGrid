import { Controller, Get, Post, Param, Body } from "@nestjs/common";
import { TemplatesService } from "./templates.service";

@Controller("v1/teams/:teamId/templates")
export class TemplatesController {
  constructor(private readonly templates: TemplatesService) {}

  @Get()
  list(@Param("teamId") teamId: string) {
    return this.templates.list(teamId);
  }

  @Get(":id")
  findOne(@Param("teamId") teamId: string, @Param("id") id: string) {
    return this.templates.findById(teamId, id);
  }

  @Post()
  create(@Param("teamId") teamId: string, @Body() body: any) {
    const { actorUserId, ...data } = body;
    return this.templates.create(teamId, actorUserId, data);
  }
}
