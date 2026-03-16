import { useEffect, useRef, useCallback } from "react";
import { useEditorStore } from "@/store/editor-store";
import { apiFetch } from "@/lib/api";

const AUTOSAVE_DELAY = 3000;

export function useAutosave(teamId: string) {
  const saveStatus = useEditorStore((s) => s.saveStatus);
  const getDocument = useEditorStore((s) => s.getDocument);
  const projectId = useEditorStore((s) => s.projectId);
  const setSaveStatus = useEditorStore((s) => s.setSaveStatus);
  const setLastSavedAt = useEditorStore((s) => s.setLastSavedAt);
  const setProjectVersionId = useEditorStore((s) => s.setProjectVersionId);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback(
    async (source: "AUTOSAVE" | "MANUAL") => {
      if (!projectId || !teamId) return;
      setSaveStatus("saving");
      try {
        const doc = getDocument();
        const result = await apiFetch<{ id: string }>(
          `/api/v1/teams/${teamId}/projects/${projectId}/versions`,
          {
            method: "POST",
            body: JSON.stringify({ canvasDocument: doc, source }),
          },
        );
        setProjectVersionId(result.id);
        setSaveStatus("saved");
        setLastSavedAt(new Date());
      } catch {
        setSaveStatus("error");
      }
    },
    [projectId, teamId, getDocument, setSaveStatus, setLastSavedAt, setProjectVersionId],
  );

  useEffect(() => {
    if (saveStatus !== "unsaved") return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => { void save("AUTOSAVE"); }, AUTOSAVE_DELAY);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [saveStatus, save]);

  return { save };
}
