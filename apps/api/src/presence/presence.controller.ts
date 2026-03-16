import { Controller, Get, Post, Delete, Param, Body } from "@nestjs/common";
import { PresenceService } from "./presence.service";

@Controller("v1/projects/:projectId/presence")
export class PresenceController {
  constructor(private readonly presence: PresenceService) {}

  @Get()
  getPresent(@Param("projectId") projectId: string) {
    return this.presence.getPresent(projectId);
  }

  @Post("join")
  join(
    @Param("projectId") projectId: string,
    @Body() body: { userId: string; userName?: string; avatarUrl?: string },
  ) {
    return this.presence.join(projectId, body.userId, body);
  }

  @Post("heartbeat")
  heartbeat(
    @Param("projectId") projectId: string,
    @Body() body: { userId: string; cursorPosition?: { x: number; y: number } },
  ) {
    return this.presence.heartbeat(projectId, body.userId, body.cursorPosition);
  }

  @Delete("leave/:userId")
  leave(@Param("projectId") projectId: string, @Param("userId") userId: string) {
    return this.presence.leave(projectId, userId);
  }
}
