import type { BackgroundMode, LayerKind, MeasurementUnit, ObjectType } from "./enums";

export type ViewportState = {
  x: number;
  y: number;
  zoom: number;
  rotation?: number;
};

export type MapViewState = {
  center: [number, number];
  zoom: number;
  bearing: number;
  pitch: number;
  calibration?: {
    scaleRatio: number;
    anchorPoints: Array<{
      canvas: [number, number];
      map: [number, number];
    }>;
  };
};

export type Layer = {
  id: string;
  name: string;
  kind: LayerKind;
  visible: boolean;
  locked: boolean;
  zIndex: number;
  colorTag?: string;
};

export type AnchorPoint = {
  id: string;
  x: number;
  y: number;
  angle?: number;
  role?: string;
  occupiedByObjectId?: string;
};

export type CanvasObject = {
  id: string;
  type: ObjectType;
  subtype: string;
  layerId: string;
  name?: string;
  transform: {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
  };
  geometry: {
    shape: "RECT" | "OVAL" | "POLYGON" | "LINE" | "TEXT" | "IMAGE";
    points?: number[];
    radiusX?: number;
    radiusY?: number;
  };
  dimensions: {
    width: number;
    depth: number;
    height?: number;
    unit: MeasurementUnit;
  };
  visibility: {
    visible: boolean;
    locked: boolean;
    snapEnabled: boolean;
  };
  style: {
    fill?: string;
    stroke?: string;
    opacity?: number;
    materialPreset?: string;
    textureAssetId?: string;
  };
  anchors?: AnchorPoint[];
  relations?: {
    parentObjectId?: string;
    childObjectIds?: string[];
    attachmentKey?: string;
  };
  reporting?: {
    quantity?: number;
    guestCapacity?: number;
    tableNumber?: string;
    countsTowardGuestCapacity?: boolean;
    sku?: string;
  };
  metadata: Record<string, unknown>;
};

export type CountsSummary = {
  totalObjects: number;
  guestCount?: number;
  seatedGuestCount?: number;
  cocktailCapacity?: number;
  tableCount?: number;
  chairCount?: number;
  countsByType: Record<string, number>;
  notes?: string[];
};

export type CanvasDocument = {
  schemaVersion: 1;
  documentId: string;
  units: MeasurementUnit;
  grid: {
    enabled: boolean;
    size: number;
    snapEnabled: boolean;
    color: string;
  };
  viewport: ViewportState;
  background: {
    mode: BackgroundMode;
    mapView?: MapViewState;
  };
  layers: Layer[];
  objects: CanvasObject[];
  metadata: CountsSummary;
};
