"use client";

import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useAutosave } from "@/hooks/use-autosave";
import { EditorTopBar } from "./editor-top-bar";
import { EditorLeftPanel } from "./editor-left-panel";
import { EditorCanvas } from "./editor-canvas";
import { EditorRightPanel } from "./editor-right-panel";
import { EditorBottomPanel } from "./editor-bottom-panel";

interface Props {
  project: {
    id: string;
    projectNumber: string;
    clientFirstName: string;
    clientLastName: string;
  };
  teamId: string;
  userId: string;
}

export function EditorShell({ project, teamId, userId }: Props) {
  useKeyboardShortcuts();
  const { save } = useAutosave(teamId);

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
      <EditorTopBar
        project={project}
        teamId={teamId}
        userId={userId}
        onManualSave={() => { void save("MANUAL"); }}
      />
      <div className="flex flex-1 overflow-hidden">
        <EditorLeftPanel teamId={teamId} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <EditorCanvas />
          <EditorBottomPanel />
        </div>
        <EditorRightPanel teamId={teamId} userId={userId} />
      </div>
    </div>
  );
}
