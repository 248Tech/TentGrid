import { useEffect } from "react";
import { useEditorStore } from "@/store/editor-store";

export function useKeyboardShortcuts() {
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const deleteObjects = useEditorStore((s) => s.deleteObjects);
  const duplicateObjects = useEditorStore((s) => s.duplicateObjects);
  const selectedIds = useEditorStore((s) => s.selectedIds);
  const selectAll = useEditorStore((s) => s.selectAll);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      const ctrl = e.ctrlKey || e.metaKey;

      if (ctrl && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (ctrl && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        redo();
      } else if ((e.key === "Delete" || e.key === "Backspace") && selectedIds.length > 0) {
        e.preventDefault();
        deleteObjects(selectedIds);
      } else if (ctrl && e.key === "d" && selectedIds.length > 0) {
        e.preventDefault();
        duplicateObjects(selectedIds);
      } else if (ctrl && e.key === "a") {
        e.preventDefault();
        selectAll();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [undo, redo, deleteObjects, duplicateObjects, selectedIds, selectAll]);
}
