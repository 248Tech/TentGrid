const publicApiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const internalApiBase = process.env.API_INTERNAL_URL ?? publicApiBase;

export const API_BASE =
  typeof window === "undefined" ? internalApiBase : publicApiBase;

export function buildUrl(path: string): string {
  return `${API_BASE}${path}`;
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(buildUrl(path), {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API error ${res.status}: ${body}`);
  }

  return res.json() as Promise<T>;
}

// ─── Types ───────────────────────────────────────────────────────────────────

export type ProjectSearchResult = {
  id: string;
  projectNumber: string;
  clientFirstName: string;
  clientLastName: string;
  venueNameSnapshot: string | null;
  eventDate: string;
  status: string;
  updatedAt: string;
  venue: { id: string; name: string } | null;
  versions: Array<{
    id: string;
    versionNumber: number;
    source: string;
    label: string | null;
    createdAt: string;
    thumbnailAssetId: string | null;
  }>;
};

export type ProjectVersionSummary = {
  id: string;
  projectId: string;
  versionNumber: number;
  source: string;
  label: string | null;
  createdAt: string;
  autosavedAt: string | null;
  thumbnailAssetId: string | null;
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

// ─── Project search ───────────────────────────────────────────────────────────

export async function searchProjects(
  teamId: string,
  params: {
    q?: string;
    status?: string;
    eventDateFrom?: string;
    eventDateTo?: string;
    limit?: number;
    offset?: number;
  }
): Promise<ProjectSearchResult[]> {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.status) query.set("status", params.status);
  if (params.eventDateFrom) query.set("eventDateFrom", params.eventDateFrom);
  if (params.eventDateTo) query.set("eventDateTo", params.eventDateTo);
  if (params.limit != null) query.set("limit", String(params.limit));
  if (params.offset != null) query.set("offset", String(params.offset));

  const qs = query.toString();
  return apiFetch<ProjectSearchResult[]>(
    `/api/v1/teams/${teamId}/projects/search${qs ? `?${qs}` : ""}`
  );
}

// ─── Versions ─────────────────────────────────────────────────────────────────

export async function listVersions(
  teamId: string,
  projectId: string
): Promise<ProjectVersionSummary[]> {
  return apiFetch<ProjectVersionSummary[]>(
    `/api/v1/teams/${teamId}/projects/${projectId}/versions`
  );
}

export async function createSnapshot(
  teamId: string,
  projectId: string,
  data: {
    actorUserId: string;
    label: string;
    canvasDocument?: unknown;
    countsSummary?: unknown;
  }
): Promise<ProjectVersionSummary> {
  return apiFetch<ProjectVersionSummary>(
    `/api/v1/teams/${teamId}/projects/${projectId}/versions`,
    { method: "POST", body: JSON.stringify(data) }
  );
}

export async function restoreVersion(
  teamId: string,
  projectId: string,
  versionId: string,
  actorUserId: string
): Promise<ProjectVersionSummary> {
  return apiFetch<ProjectVersionSummary>(
    `/api/v1/teams/${teamId}/projects/${projectId}/versions/${versionId}/restore`,
    { method: "POST", body: JSON.stringify({ actorUserId }) }
  );
}

export async function getVersionCounts(
  teamId: string,
  projectId: string,
  versionId: string
): Promise<CountsSummary> {
  return apiFetch<CountsSummary>(
    `/api/v1/teams/${teamId}/projects/${projectId}/versions/${versionId}/counts`
  );
}

// ─── Venue Types ───────────────────────────────────────────────────────────────

export type VenueSummary = {
  id: string;
  name: string;
  venueCode: string | null;
  addressLine1: string | null;
  city: string | null;
  state: string | null;
  defaultBackgroundMode: string;
};

export type VenueDetail = VenueSummary & {
  geometry: unknown;
  fixtures: unknown;
  utilities: unknown;
  defaultMapView: unknown;
  latitude: number | null;
  longitude: number | null;
  notes: string | null;
};

export type CreateVenuePayload = {
  name: string;
  venueCode?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  notes?: string;
  defaultBackgroundMode?: string;
};

// ─── Venue CRUD ───────────────────────────────────────────────────────────────

export async function listVenues(teamId: string): Promise<VenueSummary[]> {
  return apiFetch<VenueSummary[]>(`/api/v1/teams/${teamId}/venues`);
}

export async function getVenue(
  teamId: string,
  venueId: string
): Promise<VenueDetail> {
  return apiFetch<VenueDetail>(`/api/v1/teams/${teamId}/venues/${venueId}`);
}

export async function createVenue(
  teamId: string,
  data: CreateVenuePayload,
  actorUserId: string
): Promise<VenueDetail> {
  return apiFetch<VenueDetail>(`/api/v1/teams/${teamId}/venues`, {
    method: "POST",
    body: JSON.stringify({ ...data, actorUserId }),
  });
}

export async function updateVenue(
  teamId: string,
  venueId: string,
  data: Partial<CreateVenuePayload>,
  actorUserId: string
): Promise<VenueDetail> {
  return apiFetch<VenueDetail>(`/api/v1/teams/${teamId}/venues/${venueId}`, {
    method: "PATCH",
    body: JSON.stringify({ ...data, actorUserId }),
  });
}

// ─── Venue Spatial Endpoints ──────────────────────────────────────────────────

export async function updateVenueGeometry(
  teamId: string,
  venueId: string,
  geometry: unknown,
  actorUserId: string
): Promise<unknown> {
  return apiFetch<unknown>(
    `/api/v1/teams/${teamId}/venues/${venueId}/geometry`,
    { method: "PATCH", body: JSON.stringify({ geometry, actorUserId }) }
  );
}

export async function updateVenueFixtures(
  teamId: string,
  venueId: string,
  fixtures: unknown,
  actorUserId: string
): Promise<unknown> {
  return apiFetch<unknown>(
    `/api/v1/teams/${teamId}/venues/${venueId}/fixtures`,
    { method: "PATCH", body: JSON.stringify({ fixtures, actorUserId }) }
  );
}

export async function updateVenueUtilities(
  teamId: string,
  venueId: string,
  utilities: unknown,
  actorUserId: string
): Promise<unknown> {
  return apiFetch<unknown>(
    `/api/v1/teams/${teamId}/venues/${venueId}/utilities`,
    { method: "PATCH", body: JSON.stringify({ utilities, actorUserId }) }
  );
}

export async function updateVenueMapView(
  teamId: string,
  venueId: string,
  mapView: unknown,
  actorUserId: string
): Promise<unknown> {
  return apiFetch<unknown>(
    `/api/v1/teams/${teamId}/venues/${venueId}/map-view`,
    { method: "PATCH", body: JSON.stringify({ mapView, actorUserId }) }
  );
}

export async function applyVenueToProject(
  teamId: string,
  venueId: string,
  projectId: string,
  actorUserId: string
): Promise<unknown> {
  return apiFetch<unknown>(
    `/api/v1/teams/${teamId}/venues/${venueId}/apply-to-project`,
    { method: "POST", body: JSON.stringify({ projectId, actorUserId }) }
  );
}

// ─── Spatial Config ───────────────────────────────────────────────────────────

export async function getMapboxConfig(teamId: string): Promise<{
  mapboxPublicToken: string | null;
  defaultCenter: [number, number];
  defaultZoom: number;
}> {
  return apiFetch(`/api/v1/teams/${teamId}/spatial/mapbox-config`);
}

// ─── Calibration ──────────────────────────────────────────────────────────────

export async function computeScaleRatio(
  teamId: string,
  anchorPoints: Array<{ canvas: [number, number]; map: [number, number] }>,
  canvasUnit?: string
): Promise<{ scaleRatio: number }> {
  return apiFetch<{ scaleRatio: number }>(
    `/api/v1/teams/${teamId}/spatial/calibrate`,
    {
      method: "POST",
      body: JSON.stringify({ anchorPoints, canvasUnit }),
    }
  );
}
