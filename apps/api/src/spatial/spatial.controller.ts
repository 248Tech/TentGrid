import { Controller, Get, Post, Param, Body } from "@nestjs/common";
import { SpatialService } from "./spatial.service";

@Controller("v1/teams/:teamId/spatial")
export class SpatialController {
  constructor(private readonly spatial: SpatialService) {}

  @Post("calibration/compute-scale")
  computeScale(
    @Param("teamId") _teamId: string,
    @Body() body: { anchorPoints: Array<{ canvas: [number, number]; map: [number, number] }>; canvasUnit?: string },
  ) {
    const scaleRatio = this.spatial.computeScaleRatio(body.anchorPoints, body.canvasUnit);
    return { scaleRatio };
  }

  @Get("config")
  getConfig(@Param("teamId") _teamId: string) {
    return {
      mapboxPublicToken: process.env["MAPBOX_PUBLIC_TOKEN"] ?? null,
      defaultCenter: [0, 0] as [number, number],
      defaultZoom: 14,
    };
  }

  @Post("map-view/validate")
  validateMapView(@Param("teamId") _teamId: string, @Body() body: { mapView: unknown }) {
    const valid = this.spatial.isValidMapView(body.mapView);
    if (valid) {
      return { valid: true };
    }

    const errors: string[] = [];
    const mv = body.mapView as Record<string, unknown> | null | undefined;
    if (!mv || typeof mv !== "object") {
      errors.push("mapView must be an object");
    } else {
      if (!Array.isArray(mv["center"]) || mv["center"].length !== 2) {
        errors.push("center must be an array of two numbers [lng, lat]");
      }
      if (typeof mv["zoom"] !== "number") errors.push("zoom must be a number");
      if (typeof mv["bearing"] !== "number") errors.push("bearing must be a number");
      if (typeof mv["pitch"] !== "number") errors.push("pitch must be a number");
    }

    return { valid: false, errors };
  }
}
