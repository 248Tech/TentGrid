"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { v4 as uuid } from "uuid";
import {
  applyVenueToProject,
  createVenue,
  listVenues,
  updateProject,
  type CreateVenuePayload,
  type VenueSummary,
} from "@/lib/api";
import { useEditorStore } from "@/store/editor-store";
import type { CanvasObject } from "@eventgrid/types";

interface ProjectSetupTarget {
  id: string;
  projectNumber: string;
  clientFirstName: string;
  clientLastName: string;
  eventDate: string;
  notes: string | null;
  venueId: string | null;
}

interface NewProjectSetupProps {
  project: ProjectSetupTarget;
  teamId: string;
  userId: string;
  open: boolean;
}

type StarterPreset = {
  id: string;
  label: string;
  description: string;
  type: CanvasObject["type"];
  subtype: string;
  layerId: string;
  width: number;
  depth: number;
  shape: "RECT" | "OVAL" | "POLYGON";
  fill: string;
  stroke: string;
  sides?: number;
};

const STARTER_PRESETS: StarterPreset[] = [
  {
    id: "tent-40x60",
    label: "40x60 Tent",
    description: "Rectangle tent with a standard event footprint.",
    type: "TENT",
    subtype: "STANDARD_RECTANGLE",
    layerId: "layer-tent",
    width: 40,
    depth: 60,
    shape: "RECT",
    fill: "#f0fdf4",
    stroke: "#16a34a",
  },
  {
    id: "tent-40x40",
    label: "40x40 Tent",
    description: "Square tent for tighter venue footprints.",
    type: "TENT",
    subtype: "STANDARD_SQUARE",
    layerId: "layer-tent",
    width: 40,
    depth: 40,
    shape: "RECT",
    fill: "#ecfccb",
    stroke: "#65a30d",
  },
  {
    id: "table-round-60",
    label: '60" Round Table',
    description: "Banquet-ready round table preset.",
    type: "TABLE",
    subtype: "ROUND_60",
    layerId: "layer-furniture",
    width: 5,
    depth: 5,
    shape: "OVAL",
    fill: "#fef3c7",
    stroke: "#d97706",
  },
  {
    id: "chair-standard",
    label: "Standard Chair",
    description: "Single chair block for seating runs.",
    type: "CHAIR",
    subtype: "STANDARD",
    layerId: "layer-furniture",
    width: 1.5,
    depth: 1.5,
    shape: "RECT",
    fill: "#dbeafe",
    stroke: "#2563eb",
  },
  {
    id: "stage-8x4",
    label: "8x4 Stage",
    description: "Raised stage section for performer layouts.",
    type: "STAGE",
    subtype: "STANDARD",
    layerId: "layer-furniture",
    width: 8,
    depth: 4,
    shape: "RECT",
    fill: "#e5e7eb",
    stroke: "#4b5563",
  },
  {
    id: "dance-floor-20",
    label: "20x20 Dance Floor",
    description: "Standard dance floor starter block.",
    type: "DANCE_FLOOR",
    subtype: "STANDARD",
    layerId: "layer-furniture",
    width: 20,
    depth: 20,
    shape: "RECT",
    fill: "#fdf4ff",
    stroke: "#a21caf",
  },
];

const DEFAULT_VENUE_FORM: CreateVenuePayload = {
  name: "",
  venueCode: "",
  city: "",
  state: "",
  defaultBackgroundMode: "GRID",
};

function toDateInputValue(value: string): string {
  return new Date(value).toISOString().slice(0, 10);
}

function buildStarterObject(preset: StarterPreset): CanvasObject {
  return {
    id: uuid(),
    type: preset.type,
    subtype: preset.subtype,
    layerId: preset.layerId,
    name: preset.label,
    transform: {
      x: 200 + Math.round(Math.random() * 120),
      y: 160 + Math.round(Math.random() * 120),
      width: preset.width * 50,
      height: preset.depth * 50,
      rotation: 0,
    },
    geometry: { shape: preset.shape },
    dimensions: { width: preset.width, depth: preset.depth, unit: "FT" },
    visibility: { visible: true, locked: false, snapEnabled: true },
    style: { fill: preset.fill, stroke: preset.stroke },
    metadata: preset.sides ? { sides: preset.sides } : {},
  };
}

export function NewProjectSetup({
  project,
  teamId,
  userId,
  open,
}: NewProjectSetupProps) {
  const queryClient = useQueryClient();
  const addObject = useEditorStore((s) => s.addObject);

  const [dismissed, setDismissed] = useState(false);
  const [projectNumber, setProjectNumber] = useState(project.projectNumber);
  const [clientFirstName, setClientFirstName] = useState(project.clientFirstName);
  const [clientLastName, setClientLastName] = useState(project.clientLastName);
  const [eventDate, setEventDate] = useState(toDateInputValue(project.eventDate));
  const [notes, setNotes] = useState(project.notes ?? "");
  const [selectedVenueId, setSelectedVenueId] = useState(project.venueId ?? "");
  const [venues, setVenues] = useState<VenueSummary[]>([]);
  const [venueForm, setVenueForm] = useState<CreateVenuePayload>(DEFAULT_VENUE_FORM);
  const [showVenueForm, setShowVenueForm] = useState(false);
  const [loadingVenues, setLoadingVenues] = useState(false);
  const [savingProject, setSavingProject] = useState(false);
  const [creatingVenue, setCreatingVenue] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<"neutral" | "error">("neutral");

  useEffect(() => {
    if (open) setDismissed(false);
  }, [open]);

  useEffect(() => {
    setProjectNumber(project.projectNumber);
    setClientFirstName(project.clientFirstName);
    setClientLastName(project.clientLastName);
    setEventDate(toDateInputValue(project.eventDate));
    setNotes(project.notes ?? "");
    setSelectedVenueId(project.venueId ?? "");
  }, [project]);

  useEffect(() => {
    if (!open || dismissed || !teamId) return;

    setLoadingVenues(true);
    listVenues(teamId)
      .then(setVenues)
      .catch((error: unknown) => {
        setStatusTone("error");
        setStatusMessage(
          error instanceof Error ? error.message : "Failed to load venues.",
        );
      })
      .finally(() => setLoadingVenues(false));
  }, [dismissed, open, teamId]);

  if (!open || dismissed) return null;

  async function refreshProject() {
    await queryClient.invalidateQueries({
      queryKey: ["project", teamId, project.id],
    });
  }

  async function handleSaveProjectDetails() {
    if (!teamId || !userId) return;

    setSavingProject(true);
    setStatusMessage(null);

    try {
      await updateProject(
        teamId,
        project.id,
        {
          projectNumber: projectNumber.trim(),
          clientFirstName: clientFirstName.trim(),
          clientLastName: clientLastName.trim(),
          eventDate,
          notes: notes.trim() || undefined,
        },
        userId,
      );
      await refreshProject();
      setStatusTone("neutral");
      setStatusMessage("Project details saved.");
    } catch (error: unknown) {
      setStatusTone("error");
      setStatusMessage(
        error instanceof Error ? error.message : "Failed to save project details.",
      );
    } finally {
      setSavingProject(false);
    }
  }

  async function handleSelectVenue(venue: VenueSummary) {
    if (!teamId || !userId) return;

    setSavingProject(true);
    setStatusMessage(null);

    try {
      await updateProject(
        teamId,
        project.id,
        { venueId: venue.id, venueNameSnapshot: venue.name },
        userId,
      );
      await applyVenueToProject(teamId, venue.id, project.id, userId);
      setSelectedVenueId(venue.id);
      await refreshProject();
      setStatusTone("neutral");
      setStatusMessage(`Venue "${venue.name}" applied to this project.`);
    } catch (error: unknown) {
      setStatusTone("error");
      setStatusMessage(
        error instanceof Error ? error.message : "Failed to apply venue.",
      );
    } finally {
      setSavingProject(false);
    }
  }

  async function handleCreateVenue(event: React.FormEvent) {
    event.preventDefault();
    if (!teamId || !userId || !venueForm.name?.trim()) return;

    setCreatingVenue(true);
    setStatusMessage(null);

    try {
      const created = await createVenue(teamId, venueForm, userId);
      const nextVenue = {
        id: created.id,
        name: created.name,
        venueCode: created.venueCode,
        addressLine1: created.addressLine1,
        city: created.city,
        state: created.state,
        defaultBackgroundMode: created.defaultBackgroundMode,
      };
      setVenues((prev) => [...prev, nextVenue].sort((a, b) => a.name.localeCompare(b.name)));
      setVenueForm(DEFAULT_VENUE_FORM);
      setShowVenueForm(false);
      await handleSelectVenue(nextVenue);
    } catch (error: unknown) {
      setStatusTone("error");
      setStatusMessage(
        error instanceof Error ? error.message : "Failed to create venue.",
      );
    } finally {
      setCreatingVenue(false);
    }
  }

  function handlePlacePreset(preset: StarterPreset) {
    addObject(buildStarterObject(preset));
    setStatusTone("neutral");
    setStatusMessage(`${preset.label} added to the canvas.`);
  }

  return (
    <div className="absolute inset-0 z-30 bg-black/20 p-4">
      <div className="pointer-events-auto ml-auto flex h-full w-full max-w-md flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">New Project Builder</h2>
            <p className="mt-1 text-sm text-gray-500">
              Choose a venue and drop starter objects directly onto the CAD grid.
            </p>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            Close
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-4">
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Project Details</h3>
              <button
                onClick={() => {
                  void handleSaveProjectDetails();
                }}
                disabled={
                  savingProject ||
                  !projectNumber.trim() ||
                  !clientFirstName.trim() ||
                  !clientLastName.trim() ||
                  !eventDate
                }
                className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingProject ? "Saving..." : "Save Details"}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs font-medium text-gray-700">
                Project #
                <input
                  value={projectNumber}
                  onChange={(event) => setProjectNumber(event.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </label>
              <label className="text-xs font-medium text-gray-700">
                Event Date
                <input
                  type="date"
                  value={eventDate}
                  onChange={(event) => setEventDate(event.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </label>
              <label className="text-xs font-medium text-gray-700">
                Client First Name
                <input
                  value={clientFirstName}
                  onChange={(event) => setClientFirstName(event.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </label>
              <label className="text-xs font-medium text-gray-700">
                Client Last Name
                <input
                  value={clientLastName}
                  onChange={(event) => setClientLastName(event.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </label>
            </div>

            <label className="block text-xs font-medium text-gray-700">
              Notes
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={3}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="Event type, guest count, or special notes."
              />
            </label>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Venue</h3>
              <button
                onClick={() => setShowVenueForm((value) => !value)}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                {showVenueForm ? "Cancel" : "Create Venue"}
              </button>
            </div>

            {showVenueForm && (
              <form onSubmit={handleCreateVenue} className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
                <label className="block text-xs font-medium text-gray-700">
                  Venue Name
                  <input
                    value={venueForm.name}
                    onChange={(event) =>
                      setVenueForm((current) => ({ ...current, name: event.target.value }))
                    }
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    required
                  />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-xs font-medium text-gray-700">
                    Code
                    <input
                      value={venueForm.venueCode ?? ""}
                      onChange={(event) =>
                        setVenueForm((current) => ({
                          ...current,
                          venueCode: event.target.value,
                        }))
                      }
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="text-xs font-medium text-gray-700">
                    State
                    <input
                      value={venueForm.state ?? ""}
                      onChange={(event) =>
                        setVenueForm((current) => ({ ...current, state: event.target.value }))
                      }
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    />
                  </label>
                </div>
                <label className="block text-xs font-medium text-gray-700">
                  City
                  <input
                    value={venueForm.city ?? ""}
                    onChange={(event) =>
                      setVenueForm((current) => ({ ...current, city: event.target.value }))
                    }
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  />
                </label>
                <button
                  type="submit"
                  disabled={creatingVenue || !venueForm.name?.trim()}
                  className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {creatingVenue ? "Creating..." : "Create Venue"}
                </button>
              </form>
            )}

            <div className="space-y-2 rounded-xl border border-gray-200 p-3">
              {loadingVenues ? (
                <p className="text-sm text-gray-500">Loading venues...</p>
              ) : venues.length === 0 ? (
                <p className="text-sm text-gray-500">No venues yet. Create one to attach it to this project.</p>
              ) : (
                venues.map((venue) => (
                  <button
                    key={venue.id}
                    onClick={() => {
                      void handleSelectVenue(venue);
                    }}
                    className={`block w-full rounded-lg border px-3 py-2 text-left transition-colors ${
                      selectedVenueId === venue.id
                        ? "border-indigo-300 bg-indigo-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{venue.name}</p>
                        <p className="text-xs text-gray-500">
                          {[venue.city, venue.state].filter(Boolean).join(", ") || "No location set"}
                        </p>
                      </div>
                      {selectedVenueId === venue.id && (
                        <span className="text-xs font-medium text-indigo-700">Selected</span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Starter Objects</h3>
            <div className="grid grid-cols-1 gap-2">
              {STARTER_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handlePlacePreset(preset)}
                  className="rounded-xl border border-gray-200 px-3 py-3 text-left transition-colors hover:border-indigo-300 hover:bg-indigo-50"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{preset.label}</p>
                      <p className="mt-1 text-xs text-gray-500">{preset.description}</p>
                    </div>
                    <span className="rounded-full bg-white px-2 py-1 text-[11px] font-medium text-gray-600">
                      {preset.width}x{preset.depth} ft
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {statusMessage && (
            <div
              className={`rounded-lg px-3 py-2 text-sm ${
                statusTone === "error"
                  ? "bg-red-50 text-red-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {statusMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
