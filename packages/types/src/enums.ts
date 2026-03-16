export type TeamRole = "ADMIN" | "SALES" | "DESIGNER" | "VIEWER";

export type MembershipStatus = "INVITED" | "ACTIVE" | "SUSPENDED" | "REMOVED";

export type ProjectStatus =
  | "DRAFT"
  | "IN_PROGRESS"
  | "REVIEW"
  | "APPROVED"
  | "ARCHIVED";

export type VersionSource =
  | "AUTOSAVE"
  | "MANUAL"
  | "TEMPLATE_SEED"
  | "IMPORT"
  | "AI_DRAFT";

export type AssetType =
  | "IMAGE_UPLOAD"
  | "PDF_UPLOAD"
  | "EXPORT_PNG"
  | "EXPORT_PDF"
  | "THUMBNAIL"
  | "TEMPLATE_PREVIEW"
  | "TEXTURE";

export type AssetStatus = "UPLOADING" | "READY" | "FAILED" | "DELETED";

export type ExportType = "PNG" | "PDF";

export type ExportStatus =
  | "QUEUED"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELED";

export type AiJobType = "DIAGRAM_INTERPRETATION" | "TEXTURE_GENERATION";

export type AiJobStatus =
  | "QUEUED"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELED";

export type BackgroundMode = "GRID" | "SATELLITE" | "HYBRID";

export type MeasurementUnit = "FT" | "IN" | "M";

export type ObjectType =
  | "TENT"
  | "TABLE"
  | "CHAIR"
  | "STAGE"
  | "DANCE_FLOOR"
  | "BAR"
  | "RESTROOM"
  | "LOUNGE"
  | "FENCE"
  | "SHAPE"
  | "TEXT"
  | "IMAGE_OVERLAY"
  | "VENUE_BOUNDARY"
  | "MEASUREMENT"
  | "CUSTOM";

export type LayerKind =
  | "BASE_MAP"
  | "VENUE"
  | "TENT"
  | "FURNITURE"
  | "DECOR"
  | "LABEL"
  | "OVERLAY"
  | "MEASUREMENT"
  | "CUSTOM";
