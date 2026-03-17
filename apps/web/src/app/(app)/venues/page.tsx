"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Plus, MapPin, Building2 } from "lucide-react";
import {
  listVenues,
  createVenue,
  type VenueSummary,
  type CreateVenuePayload,
} from "@/lib/api";
import { getCurrentTeamId, getCurrentUserId } from "@/lib/session";

const BG_MODE_LABELS: Record<string, string> = {
  GRID: "Grid",
  SATELLITE: "Satellite",
  HYBRID: "Hybrid",
};

const BG_MODE_COLORS: Record<string, string> = {
  GRID: "bg-blue-100 text-blue-700",
  SATELLITE: "bg-green-100 text-green-700",
  HYBRID: "bg-purple-100 text-purple-700",
};

const DEFAULT_FORM: CreateVenuePayload = {
  name: "",
  venueCode: "",
  addressLine1: "",
  city: "",
  state: "",
  postalCode: "",
  notes: "",
  defaultBackgroundMode: "GRID",
};

export default function VenuesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const teamId = getCurrentTeamId(session);
  const userId = getCurrentUserId(session);
  const [venues, setVenues] = useState<VenueSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateVenuePayload>(DEFAULT_FORM);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    if (!teamId) {
      setVenues([]);
      setError("No active team was found for this account.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    listVenues(teamId)
      .then(setVenues)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [status, teamId]);

  function handleFieldChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !teamId || !userId) return;
    setCreating(true);
    setCreateError(null);
    try {
      const created = await createVenue(teamId, form, userId);
      setVenues((prev) => [
        ...prev,
        {
          id: created.id,
          name: created.name,
          venueCode: created.venueCode,
          addressLine1: created.addressLine1,
          city: created.city,
          state: created.state,
          defaultBackgroundMode: created.defaultBackgroundMode,
        },
      ]);
      setForm(DEFAULT_FORM);
      setShowForm(false);
    } catch (e: unknown) {
      setCreateError(e instanceof Error ? e.message : "Failed to create venue");
    } finally {
      setCreating(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="rounded-lg border border-gray-200 p-8 text-center text-gray-400 text-sm">
        Loading venues...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Venues</h2>
          <p className="text-sm text-gray-500 mt-1">
            Reusable venue records for your team.
          </p>
        </div>
        <button
          disabled={!teamId}
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          New Venue
        </button>
      </div>

      {/* New Venue Form */}
      {showForm && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
          <h3 className="text-base font-semibold mb-4">Create New Venue</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Venue Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleFieldChange}
                  required
                  placeholder="e.g. Grand Ballroom"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Venue Code
                </label>
                <input
                  type="text"
                  name="venueCode"
                  value={form.venueCode ?? ""}
                  onChange={handleFieldChange}
                  placeholder="e.g. GB-001"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  name="addressLine1"
                  value={form.addressLine1 ?? ""}
                  onChange={handleFieldChange}
                  placeholder="123 Main St"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={form.city ?? ""}
                    onChange={handleFieldChange}
                    placeholder="City"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={form.state ?? ""}
                    onChange={handleFieldChange}
                    placeholder="TX"
                    maxLength={2}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={form.postalCode ?? ""}
                    onChange={handleFieldChange}
                    placeholder="78701"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Background Mode
                </label>
                <select
                  name="defaultBackgroundMode"
                  value={form.defaultBackgroundMode ?? "GRID"}
                  onChange={handleFieldChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="GRID">Grid</option>
                  <option value="SATELLITE">Satellite</option>
                  <option value="HYBRID">Hybrid</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  name="notes"
                  value={form.notes ?? ""}
                  onChange={handleFieldChange}
                  placeholder="Optional notes"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {createError && (
              <p className="text-sm text-red-600">{createError}</p>
            )}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={creating || !form.name.trim()}
                className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {creating ? "Creating..." : "Create Venue"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setForm(DEFAULT_FORM);
                  setCreateError(null);
                }}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Venues List */}
      {loading ? (
        <div className="rounded-lg border border-gray-200 p-8 text-center text-gray-400 text-sm">
          Loading venues...
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center text-red-600 text-sm">
          {error}
        </div>
      ) : venues.length === 0 ? (
        <div className="rounded-lg border border-gray-200 p-8 text-center">
          <Building2 className="h-8 w-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">
            No venues yet. Add a reusable venue record to get started.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Name
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Code
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Location
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Background
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {venues.map((venue) => {
                const addressParts = [venue.city, venue.state]
                  .filter(Boolean)
                  .join(", ");
                const bgMode = venue.defaultBackgroundMode ?? "GRID";
                return (
                  <tr
                    key={venue.id}
                    onClick={() => router.push(`/venues/${venue.id}`)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {venue.name}
                    </td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                      {venue.venueCode ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {venue.addressLine1 || addressParts ? (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3 shrink-0" />
                          {[venue.addressLine1, addressParts]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          BG_MODE_COLORS[bgMode] ?? "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {BG_MODE_LABELS[bgMode] ?? bgMode}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
