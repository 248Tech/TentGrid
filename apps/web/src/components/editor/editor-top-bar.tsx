"use client";

import { useEditorStore } from "@/store/editor-store";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useState } from "react";

interface Props {
  project: {
    id: string;
    projectNumber: string;
    clientFirstName: string;
    clientLastName: string;
  };
  teamId: string;
  userId: string;
  onManualSave: () => void;
}

export function EditorTopBar({ project, teamId, userId, onManualSave }: Props) {
  const router = useRouter();
  const saveStatus = useEditorStore((s) => s.saveStatus);
  const lastSavedAt = useEditorStore((s) => s.lastSavedAt);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const undoStack = useEditorStore((s) => s.undoStack);
  const redoStack = useEditorStore((s) => s.redoStack);
  const projectVersionId = useEditorStore((s) => s.projectVersionId);
  const [exporting, setExporting] = useState(false);

  async function handleExport(type: "PNG" | "PDF") {
    if (!projectVersionId) {
      alert("Save the project first before exporting.");
      return;
    }
    setExporting(true);
    try {
      const job = await apiFetch<{ id: string; status: string }>(
        `/api/v1/teams/${teamId}/projects/${project.id}/exports`,
        {
          method: "POST",
          body: JSON.stringify({ exportType: type, projectVersionId, requestedByUserId: userId }),
        },
      );
      alert(`Export job created (${job.id}). Status: ${job.status}`);
    } catch (e) {
      alert("Export failed: " + (e as Error).message);
    } finally {
      setExporting(false);
    }
  }

  const saveLabel =
    saveStatus === "saving"
      ? "Saving..."
      : saveStatus === "saved"
        ? lastSavedAt
          ? `Saved ${lastSavedAt.toLocaleTimeString()}`
          : "Saved"
        : saveStatus === "error"
          ? "Save failed"
          : "Unsaved changes";

  const saveColor =
    saveStatus === "saving"
      ? "text-yellow-600"
      : saveStatus === "saved"
        ? "text-green-600"
        : saveStatus === "error"
          ? "text-red-600"
          : "text-orange-500";

  return (
    <div className="h-11 bg-white border-b flex items-center px-4 gap-3 shrink-0">
      <button
        onClick={() => router.push("/dashboard")}
        className="text-sm text-muted-foreground hover:text-foreground mr-2"
      >
        ← Dashboard
      </button>

      <span className="text-sm font-medium">
        {project.projectNumber} — {project.clientFirstName} {project.clientLastName}
      </span>

      <div className="flex-1" />

      <span className={`text-xs ${saveColor}`}>{saveLabel}</span>

      <div className="flex items-center gap-1">
        <button
          onClick={undo}
          disabled={undoStack.length === 0}
          className="px-2 py-1 text-xs border rounded hover:bg-gray-50 disabled:opacity-40"
          title="Undo (Ctrl+Z)"
        >
          ↩ Undo
        </button>
        <button
          onClick={redo}
          disabled={redoStack.length === 0}
          className="px-2 py-1 text-xs border rounded hover:bg-gray-50 disabled:opacity-40"
          title="Redo (Ctrl+Y)"
        >
          ↪ Redo
        </button>
      </div>

      <button
        onClick={onManualSave}
        className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:opacity-90"
      >
        Save
      </button>

      <div className="relative group">
        <button
          disabled={exporting}
          className="px-3 py-1 text-xs border rounded hover:bg-gray-50 disabled:opacity-50"
        >
          Export ▾
        </button>
        <div className="absolute right-0 top-full mt-1 bg-white border rounded shadow-lg hidden group-hover:block z-50 min-w-[6rem]">
          <button
            onClick={() => { void handleExport("PNG"); }}
            className="block w-full text-left px-3 py-2 text-xs hover:bg-gray-50"
          >
            PNG
          </button>
          <button
            onClick={() => { void handleExport("PDF"); }}
            className="block w-full text-left px-3 py-2 text-xs hover:bg-gray-50"
          >
            PDF
          </button>
        </div>
      </div>
    </div>
  );
}
