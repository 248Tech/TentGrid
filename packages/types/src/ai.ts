import type { CanvasDocument } from "./canvas";

export type AiJobResultStatus = "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELED";

export type AiObjectDetection = {
  objectId: string;
  type: string;
  subtype: string;
  confidence: number;
  boundingBox: { x: number; y: number; width: number; height: number };
  suggestedTransform: { x: number; y: number; width: number; height: number; rotation: number };
};

export type AiDiagramResult = {
  schemaVersion: 1;
  jobId: string;
  inputAssetId: string;
  overallConfidence: number;
  detections: AiObjectDetection[];
  suggestedDocument: CanvasDocument | null;
  warnings: string[];
  processingNotes: string[];
};

export type AiJobRecord = {
  id: string;
  status: AiJobResultStatus;
  jobType: string;
  confidence: number | null;
  startedAt: string | null;
  completedAt: string | null;
  errorMessage: string | null;
  resultPayload: AiDiagramResult | null;
};
