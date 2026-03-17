"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { apiFetch } from "@/lib/api-client";

function getTeamId(session: ReturnType<typeof useSession>["data"]): string {
  return (session as any)?.memberships?.[0]?.teamId ?? "";
}

export default function TemplatesPage() {
  const { data: session } = useSession();
  const teamId = getTeamId(session);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !teamId) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await apiFetch(`/api/v1/teams/${teamId}/templates`, {
        method: "POST",
        body: JSON.stringify({ name: name.trim(), description: description.trim() || undefined }),
      });
      setSuccessMsg(`Template "${name.trim()}" created.`);
      setName("");
      setDescription("");
      setShowForm(false);
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : "Failed to create template");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Templates</h2>
          <p className="text-muted-foreground mt-1">Reusable layout templates for your team.</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setSuccessMsg(null); setSubmitError(null); }}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          New Template
        </button>
      </div>

      {successMsg && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMsg}
        </div>
      )}

      <div className="rounded-lg border">
        <div className="p-8 text-center text-muted-foreground">
          <p className="text-sm">No templates yet. Save a layout as a template to reuse it later.</p>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">New Template</h2>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground text-xl">
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Wedding Reception Layout"
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description"
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {submitError && (
                <p className="text-sm text-red-600">{submitError}</p>
              )}
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !name.trim()}
                  className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded hover:opacity-90 disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Create Template"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
