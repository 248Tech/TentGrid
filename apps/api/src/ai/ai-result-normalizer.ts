import { Injectable, Logger } from "@nestjs/common";
import type { AiDiagramResult, CanvasDocument, CanvasObject, Layer } from "@eventgrid/types";
import { randomUUID } from "crypto";

@Injectable()
export class AiResultNormalizer {
  private readonly logger = new Logger(AiResultNormalizer.name);

  normalize(result: AiDiagramResult): CanvasDocument {
    // If the AI service returned a fully-formed document, validate and return it
    if (result.suggestedDocument) {
      return this.sanitizeDocument(result.suggestedDocument);
    }

    // Otherwise build a CanvasDocument from the raw detections
    const defaultLayers = this.buildDefaultLayers();
    const objects = this.detectionsToObjects(result.detections, defaultLayers);

    return {
      schemaVersion: 1,
      documentId: randomUUID(),
      units: "FT",
      grid: { enabled: true, size: 5, snapEnabled: true, color: "#e5e7eb" },
      viewport: { x: 0, y: 0, zoom: 1 },
      background: { mode: "GRID" },
      layers: defaultLayers,
      objects,
      metadata: this.computeCounts(objects),
    };
  }

  private sanitizeDocument(doc: CanvasDocument): CanvasDocument {
    return { ...doc, schemaVersion: 1 };
  }

  private buildDefaultLayers(): Layer[] {
    const layerDefs: Array<{ id: string; name: string; kind: Layer["kind"] }> = [
      { id: "layer-base-map", name: "Base Map", kind: "BASE_MAP" },
      { id: "layer-venue", name: "Venue", kind: "VENUE" },
      { id: "layer-tent", name: "Tents", kind: "TENT" },
      { id: "layer-furniture", name: "Furniture", kind: "FURNITURE" },
      { id: "layer-decor", name: "Decor", kind: "DECOR" },
      { id: "layer-label", name: "Labels", kind: "LABEL" },
      { id: "layer-measurement", name: "Measurements", kind: "MEASUREMENT" },
    ];
    return layerDefs.map((d, i) => ({
      ...d,
      visible: true,
      locked: false,
      zIndex: i,
    }));
  }

  private detectionsToObjects(
    detections: AiDiagramResult["detections"],
    layers: Layer[],
  ): CanvasObject[] {
    const layerByKind = new Map(layers.map((l) => [l.kind, l.id]));

    return detections.map((d) => {
      const layerId =
        layerByKind.get(this.objectTypeToLayerKind(d.type)) ??
        layerByKind.get("FURNITURE") ??
        layers[0]!.id;

      return {
        id: d.objectId,
        type: d.type as CanvasObject["type"],
        subtype: d.subtype,
        layerId,
        transform: d.suggestedTransform,
        geometry: { shape: "RECT" },
        dimensions: {
          width: d.suggestedTransform.width / 10,
          depth: d.suggestedTransform.height / 10,
          unit: "FT",
        },
        visibility: { visible: true, locked: false, snapEnabled: true },
        style: { fill: "#d1d5db", stroke: "#6b7280", opacity: 0.9 },
        metadata: { aiConfidence: d.confidence, aiDetected: true },
      };
    });
  }

  private objectTypeToLayerKind(type: string): Layer["kind"] {
    const map: Record<string, Layer["kind"]> = {
      TENT: "TENT",
      TABLE: "FURNITURE",
      CHAIR: "FURNITURE",
      STAGE: "FURNITURE",
      DANCE_FLOOR: "FURNITURE",
      BAR: "FURNITURE",
      TEXT: "LABEL",
      MEASUREMENT: "MEASUREMENT",
      VENUE_BOUNDARY: "VENUE",
    };
    return map[type] ?? "FURNITURE";
  }

  private computeCounts(objects: CanvasObject[]) {
    const countsByType: Record<string, number> = {};
    for (const o of objects) {
      countsByType[o.type] = (countsByType[o.type] ?? 0) + 1;
    }
    return {
      totalObjects: objects.length,
      tableCount: countsByType["TABLE"] ?? 0,
      chairCount: countsByType["CHAIR"] ?? 0,
      countsByType,
    };
  }
}
