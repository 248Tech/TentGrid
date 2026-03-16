import { Controller, Get, Post, Param, Body, Query } from "@nestjs/common";
import { AssetsService } from "./assets.service";

@Controller("v1/teams/:teamId/assets")
export class AssetsController {
  constructor(private readonly assets: AssetsService) {}

  @Get()
  list(@Param("teamId") teamId: string, @Query("type") type?: string) {
    return this.assets.list(teamId, type);
  }

  @Post("initiate-upload")
  initiateUpload(@Param("teamId") teamId: string, @Body() body: any) {
    const { actorUserId, ...params } = body;
    return this.assets.initiateUpload(teamId, actorUserId, params);
  }

  @Post(":id/mark-ready")
  markReady(@Param("teamId") teamId: string, @Param("id") id: string) {
    return this.assets.markReady(teamId, id);
  }

  @Get(":id/download-url")
  getDownloadUrl(@Param("teamId") teamId: string, @Param("id") id: string) {
    return this.assets.getDownloadUrl(teamId, id);
  }
}
