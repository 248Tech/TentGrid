import { Controller, Get, Post, Param, Body, Query } from "@nestjs/common";
import { SkinsService } from "./skins.service";

@Controller("v1/skins")
export class SkinsController {
  constructor(private readonly skins: SkinsService) {}

  @Get("presets")
  list(@Query("teamId") teamId?: string, @Query("category") category?: string) {
    return this.skins.listPresets(teamId, category);
  }

  @Get("presets/:id")
  getOne(@Param("id") id: string) {
    return this.skins.getPreset(id);
  }

  @Post("presets")
  create(@Body() body: { teamId: string; name: string; category: string; objectTypes: string[]; styleConfig: Record<string, unknown> }) {
    const { teamId, ...data } = body;
    return this.skins.createCustomPreset(teamId, data);
  }
}
