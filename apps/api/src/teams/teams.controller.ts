import { Controller, Get, Patch, Param, Body } from "@nestjs/common";
import { TeamsService } from "./teams.service";

@Controller("v1/teams")
export class TeamsController {
  constructor(private readonly teams: TeamsService) {}

  @Get(":id")
  getTeam(@Param("id") id: string) {
    return this.teams.findById(id);
  }

  @Get(":id/members")
  listMembers(@Param("id") id: string) {
    return this.teams.listMembers(id);
  }

  @Patch(":teamId/members/:userId/role")
  updateRole(
    @Param("teamId") teamId: string,
    @Param("userId") userId: string,
    @Body() body: { role: string; actorUserId: string },
  ) {
    return this.teams.updateMemberRole(teamId, userId, body.role, body.actorUserId);
  }
}
