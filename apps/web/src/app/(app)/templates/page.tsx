"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { v4 as uuid } from "uuid";
import { createTemplate, listTemplates, type TemplateSummary } from "@/lib/api";
import { getCurrentTeamId, getCurrentUserId } from "@/lib/session";

const DEFAULT_TEMPLATE_FORM = {
  name: "",
  category: "",
  description: "",
};

function makeBlankCanvasDocument() {
  return {
    schemaVersion: 1,
    documentId: uuid(),
    units: "FT",
    grid: { enabled: true, size: 50, snapEnabled: true, color: "#e5e7eb" },
    viewport: { x: 0, y: 0, zoom: 1 },
    background: { mode: "GRID" },
    layers: [
      { id: "layer-base-map", name: "Base Map", kind: "BASE_MAP", visible: true, locked: false, zIndex: 0 },
      { id: "layer-venue", name: "Venue", kind: "VENUE", visible: true, locked: false, zIndex: 1 },
      { id: "layer-tent", name: "Tent", kind: "TENT", visible: true, locked: false, zIndex: 2 },
      { id: "layer-furniture", name: "Furniture", kind: "FURNITURE", visible: true, locked: false, zIndex: 3 },
      { id: "layer-decor", name: "Decor", kind: "DECOR", visible: true, locked: false, zIndex: 4 },
      { id: "layer-labels", name: "Labels", kind: "LABEL", visible: true, locked: false, zIndex: 5 },
      { id: "layer-overlay", name: "Overlays", kind: "OVERLAY", visible: true, locked: false, zIndex: 6 },
      { id: "layer-measurements", name: "Measurements", kind: "MEASUREMENT", visible: true, locked: false, zIndex: 7 },
    ],
    objects: [],
    metadata: { totalObjects: 0, countsByType: {} },
  };
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function TemplatesPage() {
  const { data: session, status } = useSession();
  const teamId = getCurrentTeamId(session);
  const userId = getCurrentUserId(session);

  const [templates, setTemplates] = useState<TemplateSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(DEFAULT_TEMPLATE_FORM);

  useEffect(() => {
    if (status === "loading") return;

    if (!teamId) {
      setLoading(false);
      setError("No active team was found for this account.");
      return;
    }

    setLoading(true);
    setError(null);

    listTemplates(teamId)
      .then(setTemplates)
      .catch((loadError: unknown) => {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load templates.",
        );
      })
      .finally(() => setLoading(false));
  }, [status, teamId]);

  async function handleCreateTemplate(event: React.FormEvent) {
    event.preventDefault();
    if (!teamId || !userId || !form.name.trim()) return;

    setCreating(true);
    setError(null);

    try {
      const created = await createTemplate(
        teamId,
        {
          name: form.name.trim(),
          category: form.category.trim() || undefined,
          description: form.description.trim() || undefined,
          canvasDocument: makeBlankCanvasDocument(),
        },
        userId,
      );

      setTemplates((current) => [created, ...current]);
      setForm(DEFAULT_TEMPLATE_FORM);
      setShowForm(false);
    } catch (createError: unknown) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Failed to create template.",
      );
    } finally {
      setCreating(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
        Loading templates...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Templates</h2>
          <p className="mt-1 text-muted-foreground">
            Save reusable starter layouts for your team.
          </p>
        </div>
        <button
          onClick={() => setShowForm((value) => !value)}
          disabled={!teamId}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          {showForm ? "Cancel" : "New Template"}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreateTemplate} className="rounded-lg border bg-gray-50 p-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-gray-700">
              Template Name
              <input
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="Spring Banquet Starter"
                required
              />
            </label>
            <label className="text-sm font-medium text-gray-700">
              Category
              <input
                value={form.category}
                onChange={(event) =>
                  setForm((current) => ({ ...current, category: event.target.value }))
                }
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="Banquet"
              />
            </label>
          </div>
          <label className="block text-sm font-medium text-gray-700">
            Description
            <textarea
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
              rows={3}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="A blank reusable layout with your preferred starter geometry."
            />
          </label>
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setForm(DEFAULT_TEMPLATE_FORM);
              }}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating || !form.name.trim()}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create Template"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
          Loading templates...
        </div>
      ) : templates.length === 0 ? (
        <div className="rounded-lg border p-8 text-center text-muted-foreground">
          <p className="text-sm">No templates yet.</p>
          <p className="mt-1 text-xs">
            Create a blank starter template here or save one from the editor sidebar.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {templates.map((template) => (
            <article key={template.id} className="rounded-lg border bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">{template.name}</h3>
                  <p className="mt-1 text-xs uppercase tracking-wide text-gray-400">
                    {template.category ?? "Uncategorized"}
                  </p>
                </div>
                <span className="rounded-full bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-600">
                  Updated {formatDate(template.updatedAt)}
                </span>
              </div>
              <p className="mt-3 text-sm text-gray-600">
                {template.description ?? "Blank reusable layout template."}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
