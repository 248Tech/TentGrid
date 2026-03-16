# EventGrid Database Schema

## Document Summary
- Database: PostgreSQL
- ORM target: Prisma
- Scope: Implementation-ready relational schema guidance plus canonical JSONB editor payloads
- Source: Aligned to `product_requirements_document.md` and `technical_blueprint.md`

## Modeling Principles
- Use PostgreSQL as the source of truth for users, teams, projects, venues, templates, assets, jobs, and audits.
- Use JSONB for editor-state payloads that need flexibility and versioned migration paths.
- Keep search-critical fields normalized on `projects`, `venues`, and `templates`.
- Version layouts explicitly instead of mutating a single document in place.
- Treat edit locks and live presence as ephemeral runtime data stored in Redis, not Postgres.
- Keep AI workflows isolated through `ai_jobs` and asset references instead of embedding AI state into core project tables.

## Recommended PostgreSQL Extensions
- `pgcrypto` for UUID generation
- `citext` for case-insensitive email and slug fields
- `pg_trgm` for partial-match search on project, venue, and address fields
- `postgis` later if EventGrid outgrows JSONB geometry and needs native GIS operations

## Controlled Enums
| Enum | Values |
| --- | --- |
| `team_role` | `ADMIN`, `SALES`, `DESIGNER`, `VIEWER` |
| `membership_status` | `INVITED`, `ACTIVE`, `SUSPENDED`, `REMOVED` |
| `project_status` | `DRAFT`, `IN_PROGRESS`, `REVIEW`, `APPROVED`, `ARCHIVED` |
| `version_source` | `AUTOSAVE`, `MANUAL`, `TEMPLATE_SEED`, `IMPORT`, `AI_DRAFT` |
| `asset_type` | `IMAGE_UPLOAD`, `PDF_UPLOAD`, `EXPORT_PNG`, `EXPORT_PDF`, `THUMBNAIL`, `TEMPLATE_PREVIEW`, `TEXTURE` |
| `asset_status` | `UPLOADING`, `READY`, `FAILED`, `DELETED` |
| `export_type` | `PNG`, `PDF` |
| `export_status` | `QUEUED`, `PROCESSING`, `COMPLETED`, `FAILED`, `CANCELED` |
| `ai_job_type` | `DIAGRAM_INTERPRETATION`, `TEXTURE_GENERATION` |
| `ai_job_status` | `QUEUED`, `PROCESSING`, `COMPLETED`, `FAILED`, `CANCELED` |
| `background_mode` | `GRID`, `SATELLITE`, `HYBRID` |
| `measurement_unit` | `FT`, `IN`, `M` |
| `object_type` | `TENT`, `TABLE`, `CHAIR`, `STAGE`, `DANCE_FLOOR`, `BAR`, `RESTROOM`, `LOUNGE`, `FENCE`, `SHAPE`, `TEXT`, `IMAGE_OVERLAY`, `VENUE_BOUNDARY`, `MEASUREMENT`, `CUSTOM` |

## Relationship Summary
| Parent | Child | Notes |
| --- | --- | --- |
| `users` | `team_memberships` | Users can belong to multiple teams |
| `teams` | `team_memberships` | Roles are team-scoped, not global |
| `teams` | `projects`, `venues`, `templates`, `assets`, `export_jobs`, `ai_jobs`, `audit_logs` | All business records are team-scoped |
| `projects` | `project_versions` | Every saved layout version belongs to a project |
| `venues` | `projects` | Projects may reference a reusable venue |
| `templates` | `projects` | Projects may originate from a template |
| `assets` | `project_versions`, `templates`, `export_jobs`, `ai_jobs` | Assets are referenced by consumer records |
| `library_object_definitions` | `project_versions`, `templates` | Definitions shape the objects stored inside canvas JSONB |

## Core Tables
### `users`
| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `email` | `citext` | Required, unique |
| `full_name` | `text` | Required |
| `auth_provider` | `text` | Default `authjs` |
| `auth_subject` | `text` | External auth subject, unique with provider |
| `avatar_url` | `text` | Nullable |
| `last_active_at` | `timestamptz` | Nullable |
| `created_at` | `timestamptz` | Default `now()` |
| `updated_at` | `timestamptz` | Default `now()` |

Indexes:

- Unique: `email`
- Unique: `(auth_provider, auth_subject)`

### `teams`
| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `name` | `text` | Required |
| `slug` | `citext` | Required, unique |
| `settings` | `jsonb` | Team-level defaults and feature flags |
| `created_at` | `timestamptz` | Default `now()` |
| `updated_at` | `timestamptz` | Default `now()` |

Indexes:

- Unique: `slug`

### `team_memberships`
| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `team_id` | `uuid` | FK to `teams.id` |
| `user_id` | `uuid` | FK to `users.id` |
| `role` | `team_role` | Required |
| `status` | `membership_status` | Default `ACTIVE` |
| `invited_by_user_id` | `uuid` | Nullable FK to `users.id` |
| `joined_at` | `timestamptz` | Nullable |
| `created_at` | `timestamptz` | Default `now()` |
| `updated_at` | `timestamptz` | Default `now()` |

Constraints and indexes:

- Unique: `(team_id, user_id)`
- Index: `(user_id, status)`

### `venues`
| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `team_id` | `uuid` | FK to `teams.id` |
| `name` | `text` | Required |
| `venue_code` | `text` | Optional team-specific identifier |
| `address_line1` | `text` | Nullable |
| `address_line2` | `text` | Nullable |
| `city` | `text` | Nullable |
| `state` | `text` | Nullable |
| `postal_code` | `text` | Nullable |
| `country` | `text` | Nullable |
| `latitude` | `numeric(9,6)` | Nullable |
| `longitude` | `numeric(9,6)` | Nullable |
| `default_background_mode` | `background_mode` | Default `GRID` |
| `default_map_view` | `jsonb` | Persisted `MapViewState` defaults |
| `geometry` | `jsonb` | Venue boundary and persistent fixtures |
| `fixtures` | `jsonb` | Optional structured fixture list |
| `utilities` | `jsonb` | Optional utilities and service points |
| `notes` | `text` | Nullable |
| `created_by_user_id` | `uuid` | Nullable FK to `users.id` |
| `updated_by_user_id` | `uuid` | Nullable FK to `users.id` |
| `created_at` | `timestamptz` | Default `now()` |
| `updated_at` | `timestamptz` | Default `now()` |
| `archived_at` | `timestamptz` | Nullable |

Indexes:

- Index: `(team_id, name)`
- Index: `(team_id, city, state)`
- Optional trigram search index on `name`, `address_line1`, `city`, `state`

### `templates`
| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `team_id` | `uuid` | FK to `teams.id` |
| `name` | `text` | Required |
| `category` | `text` | Nullable |
| `description` | `text` | Nullable |
| `preview_asset_id` | `uuid` | Nullable FK to `assets.id` |
| `source_project_version_id` | `uuid` | Nullable FK to `project_versions.id` |
| `canvas_document` | `jsonb` | Persisted `CanvasDocument` |
| `counts_summary` | `jsonb` | Cached `CountsSummary` |
| `created_by_user_id` | `uuid` | Nullable FK to `users.id` |
| `updated_by_user_id` | `uuid` | Nullable FK to `users.id` |
| `created_at` | `timestamptz` | Default `now()` |
| `updated_at` | `timestamptz` | Default `now()` |
| `archived_at` | `timestamptz` | Nullable |

Indexes:

- Index: `(team_id, name)`
- Index: `(team_id, category)`

### `projects`
| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `team_id` | `uuid` | FK to `teams.id` |
| `project_number` | `text` | Required, unique within team |
| `status` | `project_status` | Default `DRAFT` |
| `client_first_name` | `text` | Required |
| `client_last_name` | `text` | Required |
| `client_company` | `text` | Nullable |
| `venue_name_snapshot` | `text` | Stores the project-facing venue name even if no venue record exists |
| `venue_id` | `uuid` | Nullable FK to `venues.id` |
| `template_id` | `uuid` | Nullable FK to `templates.id` |
| `event_date` | `date` | Required |
| `address_line1` | `text` | Nullable |
| `address_line2` | `text` | Nullable |
| `city` | `text` | Nullable |
| `state` | `text` | Nullable |
| `postal_code` | `text` | Nullable |
| `country` | `text` | Nullable |
| `default_background_mode` | `background_mode` | Default `GRID` |
| `current_version_id` | `uuid` | Nullable FK to `project_versions.id` |
| `guest_count_override` | `integer` | Nullable |
| `notes` | `text` | Nullable |
| `created_by_user_id` | `uuid` | Nullable FK to `users.id` |
| `updated_by_user_id` | `uuid` | Nullable FK to `users.id` |
| `created_at` | `timestamptz` | Default `now()` |
| `updated_at` | `timestamptz` | Default `now()` |
| `archived_at` | `timestamptz` | Nullable |

Indexes:

- Unique: `(team_id, project_number)`
- Index: `(team_id, event_date)`
- Index: `(team_id, status, updated_at desc)`
- Trigram search index on `project_number`, `client_first_name`, `client_last_name`, `venue_name_snapshot`, `address_line1`, `city`, `state`

### `project_versions`
| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `project_id` | `uuid` | FK to `projects.id` |
| `version_number` | `integer` | Required, sequential within project |
| `source` | `version_source` | Required |
| `label` | `text` | Nullable manual snapshot label |
| `canvas_document` | `jsonb` | Persisted `CanvasDocument` |
| `counts_summary` | `jsonb` | Cached `CountsSummary` |
| `thumbnail_asset_id` | `uuid` | Nullable FK to `assets.id` |
| `created_by_user_id` | `uuid` | Nullable FK to `users.id` |
| `autosaved_at` | `timestamptz` | Nullable for autosave records |
| `created_at` | `timestamptz` | Default `now()` |

Constraints and indexes:

- Unique: `(project_id, version_number)`
- Index: `(project_id, created_at desc)`
- Index: `(project_id, source, autosaved_at desc)`

### `library_object_definitions`
| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `team_id` | `uuid` | Nullable for system-wide defaults; FK to `teams.id` when present |
| `is_system` | `boolean` | True when shared across all teams |
| `type` | `object_type` | Required |
| `subtype` | `text` | Required |
| `display_name` | `text` | Required |
| `default_dimensions` | `jsonb` | Canonical size defaults |
| `anchor_definitions` | `jsonb` | Attachment anchors and slot rules |
| `style_defaults` | `jsonb` | Default vector style and material preset |
| `capacity_rules` | `jsonb` | Guest count or seating rules |
| `geometry_preset` | `jsonb` | Optional shape metadata |
| `pricing_metadata` | `jsonb` | Optional future quote fields |
| `is_active` | `boolean` | Default `true` |
| `created_at` | `timestamptz` | Default `now()` |
| `updated_at` | `timestamptz` | Default `now()` |

Constraints and indexes:

- Index: `(is_system, type, subtype)`
- Index: `(team_id, type, subtype)`

### `assets`
| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `team_id` | `uuid` | FK to `teams.id` |
| `type` | `asset_type` | Required |
| `status` | `asset_status` | Required |
| `storage_provider` | `text` | Default `s3` |
| `bucket` | `text` | Required |
| `object_key` | `text` | Required |
| `original_filename` | `text` | Nullable |
| `mime_type` | `text` | Nullable |
| `byte_size` | `bigint` | Nullable |
| `width` | `integer` | Nullable |
| `height` | `integer` | Nullable |
| `page_count` | `integer` | Nullable |
| `checksum_sha256` | `text` | Nullable |
| `metadata` | `jsonb` | Arbitrary file metadata |
| `created_by_user_id` | `uuid` | Nullable FK to `users.id` |
| `created_at` | `timestamptz` | Default `now()` |
| `updated_at` | `timestamptz` | Default `now()` |
| `deleted_at` | `timestamptz` | Nullable |

Constraints and indexes:

- Unique: `(bucket, object_key)`
- Index: `(team_id, type, status, created_at desc)`

### `export_jobs`
| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `team_id` | `uuid` | FK to `teams.id` |
| `project_id` | `uuid` | FK to `projects.id` |
| `project_version_id` | `uuid` | FK to `project_versions.id` |
| `requested_by_user_id` | `uuid` | FK to `users.id` |
| `export_type` | `export_type` | Required |
| `status` | `export_status` | Required |
| `parameters` | `jsonb` | Export options and layout settings |
| `output_asset_id` | `uuid` | Nullable FK to `assets.id` |
| `error_message` | `text` | Nullable |
| `started_at` | `timestamptz` | Nullable |
| `completed_at` | `timestamptz` | Nullable |
| `created_at` | `timestamptz` | Default `now()` |
| `updated_at` | `timestamptz` | Default `now()` |

Indexes:

- Index: `(team_id, status, created_at desc)`
- Index: `(project_id, created_at desc)`

### `ai_jobs`
| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `team_id` | `uuid` | FK to `teams.id` |
| `project_id` | `uuid` | Nullable FK to `projects.id` |
| `project_version_id` | `uuid` | Nullable FK to `project_versions.id` |
| `requested_by_user_id` | `uuid` | FK to `users.id` |
| `input_asset_id` | `uuid` | FK to `assets.id` |
| `output_version_id` | `uuid` | Nullable FK to `project_versions.id` |
| `job_type` | `ai_job_type` | Required |
| `status` | `ai_job_status` | Required |
| `parameters` | `jsonb` | Model and workflow parameters |
| `result_payload` | `jsonb` | Normalized AI result and diagnostics |
| `confidence` | `numeric(5,4)` | Nullable aggregate confidence score |
| `error_message` | `text` | Nullable |
| `started_at` | `timestamptz` | Nullable |
| `completed_at` | `timestamptz` | Nullable |
| `created_at` | `timestamptz` | Default `now()` |
| `updated_at` | `timestamptz` | Default `now()` |

Indexes:

- Index: `(team_id, status, created_at desc)`
- Index: `(team_id, job_type, created_at desc)`
- Index: `(project_id, created_at desc)`

### `audit_logs`
| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `team_id` | `uuid` | FK to `teams.id` |
| `actor_user_id` | `uuid` | Nullable FK to `users.id` |
| `entity_type` | `text` | For example `PROJECT`, `PROJECT_VERSION`, `TEMPLATE` |
| `entity_id` | `uuid` | Target record identifier |
| `action` | `text` | For example `CREATED`, `UPDATED`, `EXPORTED` |
| `metadata` | `jsonb` | Audit payload and diff summary |
| `created_at` | `timestamptz` | Default `now()` |

Indexes:

- Index: `(team_id, entity_type, entity_id, created_at desc)`
- Index: `(actor_user_id, created_at desc)`

## Canonical JSONB Payloads
These shapes are the contract between the editor, the API, exports, and future AI processing. They should be versioned and migrated explicitly.

### `CanvasDocument`
```ts
type CanvasDocument = {
  schemaVersion: 1;
  documentId: string;
  units: "FT" | "IN" | "M";
  grid: {
    enabled: boolean;
    size: number;
    snapEnabled: boolean;
    color: string;
  };
  viewport: ViewportState;
  background: {
    mode: "GRID" | "SATELLITE" | "HYBRID";
    mapView?: MapViewState;
  };
  layers: Layer[];
  objects: CanvasObject[];
  metadata: CountsSummary;
};
```

### `ViewportState`
```ts
type ViewportState = {
  x: number;
  y: number;
  zoom: number;
  rotation?: number;
};
```

### `MapViewState`
```ts
type MapViewState = {
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
```

### `Layer`
```ts
type Layer = {
  id: string;
  name: string;
  kind:
    | "BASE_MAP"
    | "VENUE"
    | "TENT"
    | "FURNITURE"
    | "DECOR"
    | "LABEL"
    | "OVERLAY"
    | "MEASUREMENT"
    | "CUSTOM";
  visible: boolean;
  locked: boolean;
  zIndex: number;
  colorTag?: string;
};
```

### `AnchorPoint`
```ts
type AnchorPoint = {
  id: string;
  x: number;
  y: number;
  angle?: number;
  role?: string;
  occupiedByObjectId?: string;
};
```

### `CanvasObject`
```ts
type CanvasObject = {
  id: string;
  type: string;
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
    unit: "FT" | "IN" | "M";
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
```

### `CountsSummary`
```ts
type CountsSummary = {
  totalObjects: number;
  guestCount?: number;
  seatedGuestCount?: number;
  cocktailCapacity?: number;
  tableCount?: number;
  chairCount?: number;
  countsByType: Record<string, number>;
  notes?: string[];
};
```

## JSONB Placement
| Table | Column | Payload |
| --- | --- | --- |
| `teams` | `settings` | Team defaults, feature flags, UI preferences |
| `venues` | `default_map_view` | `MapViewState` |
| `venues` | `geometry` | Venue boundary, permanent fixtures, entrances, exits |
| `venues` | `fixtures` | Reusable site fixture metadata |
| `venues` | `utilities` | Power, water, loading, and service points |
| `templates` | `canvas_document` | `CanvasDocument` |
| `templates` | `counts_summary` | `CountsSummary` |
| `project_versions` | `canvas_document` | `CanvasDocument` |
| `project_versions` | `counts_summary` | `CountsSummary` |
| `library_object_definitions` | `default_dimensions` | Size defaults |
| `library_object_definitions` | `anchor_definitions` | Attachment anchors |
| `library_object_definitions` | `style_defaults` | Visual defaults |
| `library_object_definitions` | `capacity_rules` | Seating and count logic |
| `library_object_definitions` | `geometry_preset` | Default footprint or points |
| `library_object_definitions` | `pricing_metadata` | Future quote mapping |
| `assets` | `metadata` | File metadata and processing details |
| `export_jobs` | `parameters` | Export options |
| `ai_jobs` | `parameters` | AI model and workflow settings |
| `ai_jobs` | `result_payload` | AI output, confidence, diagnostics |
| `audit_logs` | `metadata` | Diff summaries and action context |

## Search Strategy
- Use normalized `projects` columns for primary search filters.
- Add trigram indexes for partial string matching on project number, client names, venue name, and address data.
- Keep event date and status indexed with standard btree indexes for dashboard filtering.
- Only introduce Elasticsearch or Meilisearch after PostgreSQL search becomes a measured bottleneck.

## Versioning and Retention Rules
- `projects.current_version_id` should always point at the latest user-visible version.
- Autosaves are stored as `project_versions` with source `AUTOSAVE`.
- Manual snapshots are stored as `project_versions` with source `MANUAL` and an optional human-readable label.
- Templates store their own `CanvasDocument` so they can be loaded without joining through a project.
- Soft deletion should use `archived_at` or `deleted_at` fields rather than hard deleting business records.

## Explicitly Deferred Schema
The following tables are intentionally omitted until the product requires them:

- Realtime presence or collaborative cursor tables
- Comment threads and approvals
- Pricing catalog and quote line items
- CRM sync or ERP sync tables
- Native GIS tables beyond optional later PostGIS adoption
