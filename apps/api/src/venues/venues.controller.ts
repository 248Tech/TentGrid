import { Controller, Get, Post, Patch, Param, Body } from "@nestjs/common";
import { VenuesService } from "./venues.service";

@Controller("v1/teams/:teamId/venues")
export class VenuesController {
  constructor(private readonly venues: VenuesService) {}

  @Get()
  list(@Param("teamId") teamId: string) {
    return this.venues.list(teamId);
  }

  @Get(":id")
  findOne(@Param("teamId") teamId: string, @Param("id") id: string) {
    return this.venues.findById(teamId, id);
  }

  @Post()
  create(@Param("teamId") teamId: string, @Body() body: any) {
    const { actorUserId, ...data } = body;
    return this.venues.create(teamId, actorUserId, data);
  }

  @Patch(":id")
  update(@Param("teamId") teamId: string, @Param("id") id: string, @Body() body: any) {
    const { actorUserId, ...data } = body;
    return this.venues.update(teamId, id, actorUserId, data);
  }

  @Patch(":id/geometry")
  updateGeometry(@Param("teamId") teamId: string, @Param("id") id: string, @Body() body: any) {
    const { actorUserId, ...geometry } = body;
    return this.venues.updateGeometry(teamId, id, actorUserId, geometry);
  }

  @Patch(":id/fixtures")
  updateFixtures(@Param("teamId") teamId: string, @Param("id") id: string, @Body() body: any) {
    const { actorUserId, ...fixtures } = body;
    return this.venues.updateFixtures(teamId, id, actorUserId, fixtures);
  }

  @Patch(":id/utilities")
  updateUtilities(@Param("teamId") teamId: string, @Param("id") id: string, @Body() body: any) {
    const { actorUserId, ...utilities } = body;
    return this.venues.updateUtilities(teamId, id, actorUserId, utilities);
  }

  @Patch(":id/map-view")
  updateMapView(@Param("teamId") teamId: string, @Param("id") id: string, @Body() body: any) {
    const { actorUserId, ...mapView } = body;
    return this.venues.updateDefaultMapView(teamId, id, actorUserId, mapView);
  }

  @Post(":id/apply-to-project")
  applyToProject(@Param("teamId") teamId: string, @Param("id") id: string, @Body() body: any) {
    const { actorUserId, projectId } = body;
    return this.venues.applyVenueDefaultsToProject(teamId, id, projectId, actorUserId);
  }
}
