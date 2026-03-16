"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Check, AlertCircle } from "lucide-react";
import {
  getVenue,
  updateVenueGeometry,
  updateVenueFixtures,
  updateVenueUtilities,
  updateVenueMapView,
  applyVenueToProject,
  type VenueDetail,
} from "@/lib/api";
import { BackgroundModeToggle } from "@/components/spatial/background-mode-toggle";

const TEAM_ID = process.env.NEXT_PUBLIC_TEAM_ID ?? "dev-team";
const ACTOR_USER_ID = "system";

type SaveState = "idle" | "saving" | "saved" | "error";

function useSaveState() {
  const [state, setState] = useState<SaveState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function setSaving() {
    setState("saving");
    setErrorMsg(null);
  }
  function setSaved() {
    setState("saved");
    setTimeout(() => setState("idle"), 2500);
  }
  function setError(msg: string) {
    setState("error");
    setErrorMsg(msg);
  }

  return { state, errorMsg, setSaving, setSaved, setError };
}

function SaveIndicator({
  state,
  errorMsg,
}: {
  state: SaveState;
  errorMsg: string | null;
}) {
  if (state === "idle") return null;
  if (state === "saving")
    return <span className="text-sm text-gray-400">Saving...</span>;
  if (state === "saved")
    return (
      <span className="inline-flex items-center gap-1 text-sm text-green-600">
        <Check className="h-4 w-4" /> Saved
      </span>
    );
  if (state === "error")
    return (
      <span className="inline-flex items-center gap-1 text-sm text-red-600">
        <AlertCircle className="h-4 w-4" /> {errorMsg ?? "Error saving"}
      </span>
    );
  return null;
}

function JsonTextarea({
  label,
  value,
  onChange,
  rows,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows ?? 8}
        spellCheck={false}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
        placeholder={`Paste ${label} here...`}
      />
    </div>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="px-5 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="px-5 py-4 space-y-4">{children}</div>
    </div>
  );
}

function parseGeometrySummary(geometry: unknown) {
  if (!geometry || typeof geometry !== "object") return null;
  const g = geometry as Record<string, unknown>;
  const boundary = g.boundary as { points?: unknown[] } | undefined;
  const obstacles = g.obstacles as unknown[] | undefined;
  const entrances = g.entrances as unknown[] | undefined;
  return {
    boundaryPoints: boundary?.points?.length ?? 0,
    obstacles: obstacles?.length ?? 0,
    entrances: entrances?.length ?? 0,
  };
}

export default function VenueDetailPage() {
  const params = useParams();
  const router = useRouter();
  const venueId = params.venueId as string;

  const [venue, setVenue] = useState<VenueDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // JSON editor state
  const [geometryJson, setGeometryJson] = useState("");
  const [fixturesJson, setFixturesJson] = useState("");
  const [utilitiesJson, setUtilitiesJson] = useState("");

  // Map settings state
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  const [zoom, setZoom] = useState<string>("14");
  const [bgMode, setBgMode] = useState<"GRID" | "SATELLITE" | "HYBRID">("GRID");

  // Apply to project
  const [applyProjectId, setApplyProjectId] = useState("");

  // Save states
  const geometrySave = useSaveState();
  const fixturesSave = useSaveState();
  const utilitiesSave = useSaveState();
  const mapViewSave = useSaveState();
  const applySave = useSaveState();

  const loadVenue = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await getVenue(TEAM_ID, venueId);
      setVenue(data);
      setGeometryJson(
        data.geometry ? JSON.stringify(data.geometry, null, 2) : ""
      );
      setFixturesJson(
        data.fixtures ? JSON.stringify(data.fixtures, null, 2) : ""
      );
      setUtilitiesJson(
        data.utilities ? JSON.stringify(data.utilities, null, 2) : ""
      );
      if (data.latitude != null) setLatitude(String(data.latitude));
      if (data.longitude != null) setLongitude(String(data.longitude));
      if (data.defaultMapView && typeof data.defaultMapView === "object") {
        const mv = data.defaultMapView as Record<string, unknown>;
        if (mv.zoom != null) setZoom(String(mv.zoom));
      }
      if (
        data.defaultBackgroundMode === "GRID" ||
        data.defaultBackgroundMode === "SATELLITE" ||
        data.defaultBackgroundMode === "HYBRID"
      ) {
        setBgMode(data.defaultBackgroundMode);
      }
    } catch (e: unknown) {
      setLoadError(e instanceof Error ? e.message : "Failed to load venue");
    } finally {
      setLoading(false);
    }
  }, [venueId]);

  useEffect(() => {
    loadVenue();
  }, [loadVenue]);

  async function handleSaveGeometry() {
    geometrySave.setSaving();
    try {
      const parsed = geometryJson.trim() ? JSON.parse(geometryJson) : null;
      await updateVenueGeometry(TEAM_ID, venueId, parsed, ACTOR_USER_ID);
      geometrySave.setSaved();
    } catch (e: unknown) {
      geometrySave.setError(
        e instanceof Error ? e.message : "Failed to save geometry"
      );
    }
  }

  async function handleSaveFixtures() {
    fixturesSave.setSaving();
    try {
      const parsed = fixturesJson.trim() ? JSON.parse(fixturesJson) : null;
      await updateVenueFixtures(TEAM_ID, venueId, parsed, ACTOR_USER_ID);
      fixturesSave.setSaved();
    } catch (e: unknown) {
      fixturesSave.setError(
        e instanceof Error ? e.message : "Failed to save fixtures"
      );
    }
  }

  async function handleSaveUtilities() {
    utilitiesSave.setSaving();
    try {
      const parsed = utilitiesJson.trim() ? JSON.parse(utilitiesJson) : null;
      await updateVenueUtilities(TEAM_ID, venueId, parsed, ACTOR_USER_ID);
      utilitiesSave.setSaved();
    } catch (e: unknown) {
      utilitiesSave.setError(
        e instanceof Error ? e.message : "Failed to save utilities"
      );
    }
  }

  async function handleSaveMapView() {
    mapViewSave.setSaving();
    try {
      const mapView = {
        center: [parseFloat(longitude) || 0, parseFloat(latitude) || 0] as [
          number,
          number,
        ],
        zoom: parseFloat(zoom) || 14,
        bearing: 0,
        pitch: 0,
        backgroundMode: bgMode,
      };
      await updateVenueMapView(TEAM_ID, venueId, mapView, ACTOR_USER_ID);
      mapViewSave.setSaved();
    } catch (e: unknown) {
      mapViewSave.setError(
        e instanceof Error ? e.message : "Failed to save map settings"
      );
    }
  }

  async function handleApplyToProject() {
    if (!applyProjectId.trim()) return;
    applySave.setSaving();
    try {
      await applyVenueToProject(
        TEAM_ID,
        venueId,
        applyProjectId.trim(),
        ACTOR_USER_ID
      );
      applySave.setSaved();
    } catch (e: unknown) {
      applySave.setError(
        e instanceof Error ? e.message : "Failed to apply venue"
      );
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-gray-400">
        Loading venue...
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-8 text-center text-sm text-red-600">{loadError}</div>
    );
  }

  if (!venue) return null;

  const geometrySummary = parseGeometrySummary(venue.geometry);

  const addressParts = [
    venue.addressLine1,
    [venue.city, venue.state].filter(Boolean).join(", "),
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.push("/venues")}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          All Venues
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{venue.name}</h2>
            {addressParts && (
              <p className="text-sm text-gray-500 mt-0.5">{addressParts}</p>
            )}
          </div>
          {venue.venueCode && (
            <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              {venue.venueCode}
            </span>
          )}
        </div>
      </div>

      {/* Metadata */}
      <SectionCard title="Venue Info">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-gray-500">Name</dt>
            <dd className="font-medium text-gray-900 mt-0.5">{venue.name}</dd>
          </div>
          {venue.venueCode && (
            <div>
              <dt className="text-gray-500">Code</dt>
              <dd className="font-mono text-gray-900 mt-0.5">
                {venue.venueCode}
              </dd>
            </div>
          )}
          <div>
            <dt className="text-gray-500">Background Mode</dt>
            <dd className="mt-0.5">
              <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                {venue.defaultBackgroundMode}
              </span>
            </dd>
          </div>
          {venue.notes && (
            <div className="col-span-full">
              <dt className="text-gray-500">Notes</dt>
              <dd className="text-gray-900 mt-0.5 whitespace-pre-line">
                {venue.notes}
              </dd>
            </div>
          )}
        </dl>
      </SectionCard>

      {/* Geometry Summary */}
      {geometrySummary && (
        <SectionCard title="Geometry Summary">
          <dl className="flex gap-8 text-sm">
            <div>
              <dt className="text-gray-500">Boundary Points</dt>
              <dd className="text-xl font-bold text-gray-900 mt-0.5">
                {geometrySummary.boundaryPoints}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Obstacles</dt>
              <dd className="text-xl font-bold text-gray-900 mt-0.5">
                {geometrySummary.obstacles}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Entrances</dt>
              <dd className="text-xl font-bold text-gray-900 mt-0.5">
                {geometrySummary.entrances}
              </dd>
            </div>
          </dl>
        </SectionCard>
      )}

      {/* Edit Geometry */}
      <SectionCard title="Edit Geometry">
        <JsonTextarea
          label="Geometry JSON"
          value={geometryJson}
          onChange={setGeometryJson}
          rows={10}
        />
        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveGeometry}
            disabled={geometrySave.state === "saving"}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Save Geometry
          </button>
          <SaveIndicator
            state={geometrySave.state}
            errorMsg={geometrySave.errorMsg}
          />
        </div>
      </SectionCard>

      {/* Edit Fixtures */}
      <SectionCard title="Fixtures">
        <JsonTextarea
          label="Fixtures JSON"
          value={fixturesJson}
          onChange={setFixturesJson}
          rows={8}
        />
        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveFixtures}
            disabled={fixturesSave.state === "saving"}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Save Fixtures
          </button>
          <SaveIndicator
            state={fixturesSave.state}
            errorMsg={fixturesSave.errorMsg}
          />
        </div>
      </SectionCard>

      {/* Edit Utilities */}
      <SectionCard title="Utilities">
        <JsonTextarea
          label="Utilities JSON"
          value={utilitiesJson}
          onChange={setUtilitiesJson}
          rows={8}
        />
        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveUtilities}
            disabled={utilitiesSave.state === "saving"}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Save Utilities
          </button>
          <SaveIndicator
            state={utilitiesSave.state}
            errorMsg={utilitiesSave.errorMsg}
          />
        </div>
      </SectionCard>

      {/* Map Settings */}
      <SectionCard title="Map Settings">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Latitude
            </label>
            <input
              type="number"
              step="0.000001"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="e.g. 30.267153"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Longitude
            </label>
            <input
              type="number"
              step="0.000001"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="e.g. -97.743061"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default Zoom
            </label>
            <input
              type="number"
              min={0}
              max={22}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Background Mode
          </label>
          <BackgroundModeToggle value={bgMode} onChange={setBgMode} />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveMapView}
            disabled={mapViewSave.state === "saving"}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Save Map Settings
          </button>
          <SaveIndicator
            state={mapViewSave.state}
            errorMsg={mapViewSave.errorMsg}
          />
        </div>
      </SectionCard>

      {/* Apply to Project */}
      <SectionCard title="Apply to Project">
        <p className="text-sm text-gray-500">
          Apply this venue&apos;s geometry, fixtures, utilities, and map
          settings as defaults to an existing project.
        </p>
        <div className="flex items-end gap-3">
          <div className="flex-1 max-w-xs">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project ID
            </label>
            <input
              type="text"
              value={applyProjectId}
              onChange={(e) => setApplyProjectId(e.target.value)}
              placeholder="Enter project ID"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={handleApplyToProject}
            disabled={
              applySave.state === "saving" || !applyProjectId.trim()
            }
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Apply Venue Defaults
          </button>
        </div>
        <SaveIndicator
          state={applySave.state}
          errorMsg={applySave.errorMsg}
        />
      </SectionCard>
    </div>
  );
}
