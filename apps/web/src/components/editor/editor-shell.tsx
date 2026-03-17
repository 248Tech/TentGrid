"use client";

import dynamic from "next/dynamic";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useAutosave } from "@/hooks/use-autosave";
import { EditorTopBar } from "./editor-top-bar";
import { EditorLeftPanel } from "./editor-left-panel";
import { EditorRightPanel } from "./editor-right-panel";
import { EditorBottomPanel } from "./editor-bottom-panel";
import { NewProjectSetup } from "./new-project-setup";

const EditorCanvas = dynamic(
  () => import("./editor-canvas").then((mod) => mod.EditorCanvas),
  {
    ssr: false,
    loading: () => <div className="flex-1 bg-gray-200" />,
  },
);

interface Props {
  project: {
    id: string;
    projectNumber: string;
    clientFirstName: string;
    clientLastName: string;
    eventDate: string;
    notes: string | null;
    venueId: string | null;
  };
  teamId: string;
  userId: string;
  setupMode?: boolean;
}

export function EditorShell({ project, teamId, userId, setupMode = false }: Props) {
  useKeyboardShortcuts();
  const { save } = useAutosave(teamId);

  return (
    <div className="relative h-screen flex flex-col bg-gray-100 overflow-hidden">
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
      <NewProjectSetup
        project={project}
        teamId={teamId}
        userId={userId}
        open={setupMode}
      />
    </div>
  );
}
