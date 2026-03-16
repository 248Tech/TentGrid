import { Injectable } from "@nestjs/common";

@Injectable()
export class SpatialService {
  mergeMapView(
    canvasDocument: Record<string, unknown>,
    mapView: Record<string, unknown>,
  ): Record<string, unknown> {
    const background = (canvasDocument["background"] as Record<string, unknown>) ?? {};
    return {
      ...canvasDocument,
      background: {
        ...background,
        mapView: {
          ...((background["mapView"] as Record<string, unknown>) ?? {}),
          ...mapView,
        },
      },
    };
  }

  setBackgroundMode(
    canvasDocument: Record<string, unknown>,
    mode: "GRID" | "SATELLITE" | "HYBRID",
  ): Record<string, unknown> {
    const background = (canvasDocument["background"] as Record<string, unknown>) ?? {};
    return {
      ...canvasDocument,
      background: {
        ...background,
        mode,
      },
    };
  }

  extractMapView(canvasDocument: Record<string, unknown>): Record<string, unknown> | null {
    const background = canvasDocument["background"] as Record<string, unknown> | undefined;
    if (!background) return null;
    const mapView = background["mapView"] as Record<string, unknown> | undefined;
    return mapView ?? null;
  }

  isValidMapView(mapView: unknown): boolean {
    if (!mapView || typeof mapView !== "object") return false;
    const mv = mapView as Record<string, unknown>;
    if (!Array.isArray(mv["center"]) || mv["center"].length !== 2) return false;
    if (typeof mv["zoom"] !== "number") return false;
    if (typeof mv["bearing"] !== "number") return false;
    if (typeof mv["pitch"] !== "number") return false;
    return true;
  }

  computeScaleRatio(
    anchorPoints: Array<{ canvas: [number, number]; map: [number, number] }>,
    canvasUnit?: string,
  ): number {
    if (!anchorPoints || anchorPoints.length < 2) return 0;

    const p1 = anchorPoints[0];
    const p2 = anchorPoints[1];

    // Euclidean distance on canvas
    const dx = p2.canvas[0] - p1.canvas[0];
    const dy = p2.canvas[1] - p1.canvas[1];
    const canvasDistance = Math.sqrt(dx * dx + dy * dy);
    if (canvasDistance === 0) return 0;

    // Haversine distance between two [lat, lng] map points
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const lat1 = toRad(p1.map[0]);
    const lat2 = toRad(p2.map[0]);
    const dLat = toRad(p2.map[0] - p1.map[0]);
    const dLng = toRad(p2.map[1] - p1.map[1]);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const earthRadiusMeters = 6371000;
    let realWorldDistanceMeters = earthRadiusMeters * c;

    if (realWorldDistanceMeters === 0) return 0;

    // Convert canvas distance to meters if a unit is specified
    // canvasDistance is in canvasUnit; we want the ratio (canvas units per meter)
    // If canvasUnit is "FT", 1 ft = 0.3048 m, so 1 meter = 1/0.3048 ft
    // scaleRatio = canvasDistance / realWorldDistanceInMeters (canvas units per meter)
    // But we keep canvasDistance in its native unit and express the ratio accordingly
    if (canvasUnit === "FT") {
      // Convert real-world distance from meters to feet for consistent units
      realWorldDistanceMeters = realWorldDistanceMeters / 0.3048;
    } else if (canvasUnit === "IN") {
      // Convert real-world distance from meters to inches
      realWorldDistanceMeters = realWorldDistanceMeters / 0.0254;
    }
    // For "M" or undefined, no conversion needed

    return canvasDistance / realWorldDistanceMeters;
  }
}
