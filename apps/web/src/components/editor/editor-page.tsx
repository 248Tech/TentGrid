"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useEditorStore } from "@/store/editor-store";
import { apiFetch } from "@/lib/api";
import { EditorShell } from "./editor-shell";
import type { CanvasDocument } from "@eventgrid/types";
import { getCurrentTeamId, getCurrentUserId } from "@/lib/session";

interface ProjectData {
  id: string;
  projectNumber: string;
  clientFirstName: string;
  clientLastName: string;
  eventDate: string;
  notes: string | null;
  venueId: string | null;
  venueNameSnapshot: string | null;
  currentVersionId: string | null;
  templateId: string | null;
  template: { id: string; name: string; canvasDocument?: unknown } | null;
  teamId: string;
}

interface VersionData {
  id: string;
  canvasDocument: CanvasDocument | null;
}

const BLANK_LAYERS = [
  { id: "layer-base-map", name: "Base Map", kind: "BASE_MAP" as const, visible: true, locked: false, zIndex: 0 },
  { id: "layer-venue", name: "Venue", kind: "VENUE" as const, visible: true, locked: false, zIndex: 1 },
  { id: "layer-tent", name: "Tent", kind: "TENT" as const, visible: true, locked: false, zIndex: 2 },
  { id: "layer-furniture", name: "Furniture", kind: "FURNITURE" as const, visible: true, locked: false, zIndex: 3 },
  { id: "layer-decor", name: "Decor", kind: "DECOR" as const, visible: true, locked: false, zIndex: 4 },
  { id: "layer-labels", name: "Labels", kind: "LABEL" as const, visible: true, locked: false, zIndex: 5 },
  { id: "layer-overlay", name: "Overlays", kind: "OVERLAY" as const, visible: true, locked: false, zIndex: 6 },
  { id: "layer-measurements", name: "Measurements", kind: "MEASUREMENT" as const, visible: true, locked: false, zIndex: 7 },
];

function makeBlankDocument(): CanvasDocument {
  return {
    schemaVersion: 1,
    documentId: crypto.randomUUID(),
    units: "FT",
    grid: { enabled: true, size: 50, snapEnabled: true, color: "#e5e7eb" },
    viewport: { x: 0, y: 0, zoom: 1 },
    background: { mode: "GRID" },
    layers: BLANK_LAYERS,
    objects: [],
    metadata: { totalObjects: 0, countsByType: {} },
  };
}

export function EditorPage({ projectId }: { projectId: string }) {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const teamId = getCurrentTeamId(session);
  const userId = getCurrentUserId(session);
  const loadDocument = useEditorStore((s) => s.loadDocument);
  const showSetup = searchParams.get("setup") === "1";

  const { data: project, isLoading: projectLoading } = useQuery<ProjectData>({
    queryKey: ["project", teamId, projectId],
    queryFn: () => apiFetch<ProjectData>(`/api/v1/teams/${teamId}/projects/${projectId}`),
    enabled: !!teamId,
  });

  const { data: version, isLoading: versionLoading } = useQuery<VersionData | null>({
    queryKey: ["project-version-latest", teamId, projectId],
    queryFn: () =>
      apiFetch<VersionData>(`/api/v1/teams/${teamId}/projects/${projectId}/versions/latest`).catch(
        () => null,
      ),
    enabled: !!teamId && !!project,
  });

  useEffect(() => {
    if (!project || versionLoading) return;

    if (version?.canvasDocument) {
      loadDocument(version.canvasDocument, projectId, version.id);
    } else if (project.template?.canvasDocument) {
      const doc = project.template.canvasDocument as CanvasDocument;
      loadDocument({ ...doc, documentId: crypto.randomUUID() }, projectId, null);
    } else {
      loadDocument(makeBlankDocument(), projectId, null);
    }
  }, [project, version, versionLoading, projectId, loadDocument]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading project...</p>
      </div>
    );
  }

  if (!teamId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">No active team was found for this account.</p>
      </div>
    );
  }

  if (projectLoading || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading project...</p>
      </div>
    );
  }

  return (
    <EditorShell
      project={project}
      teamId={teamId}
      userId={userId}
      setupMode={showSetup}
    />
  );
}
