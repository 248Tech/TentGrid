"use client";

import { useQuery } from "@tanstack/react-query";
import { useEditorStore } from "@/store/editor-store";
import { apiFetch } from "@/lib/api";
import { v4 as uuid } from "uuid";
import type { CanvasObject } from "@eventgrid/types";
import { useState } from "react";
import { TentBuilderDialog } from "./tent-builder-dialog";

interface LibraryObject {
  id: string;
  type: string;
  subtype: string;
  displayName: string;
  defaultDimensions: { width: number; depth: number; unit: string };
  geometryPreset?: { shape?: string; sides?: number } | null;
  styleDefaults?: { fill?: string; stroke?: string } | null;
}

const TYPE_ORDER = [
  "TENT", "TABLE", "CHAIR", "STAGE", "DANCE_FLOOR",
  "BAR", "RESTROOM", "LOUNGE", "FENCE", "SHAPE", "TEXT", "MEASUREMENT",
];

const TYPE_LABELS: Record<string, string> = {
  TENT: "Tents", TABLE: "Tables", CHAIR: "Chairs", STAGE: "Stages",
  DANCE_FLOOR: "Dance Floors", BAR: "Bars", RESTROOM: "Restrooms",
  LOUNGE: "Lounge", FENCE: "Fencing", SHAPE: "Shapes", TEXT: "Text",
  MEASUREMENT: "Measurements",
};

const LAYER_MAP: Record<string, string> = {
  TENT: "layer-tent",
  TABLE: "layer-furniture",
  CHAIR: "layer-furniture",
  STAGE: "layer-furniture",
  DANCE_FLOOR: "layer-furniture",
  BAR: "layer-furniture",
  RESTROOM: "layer-furniture",
  LOUNGE: "layer-furniture",
  FENCE: "layer-decor",
  SHAPE: "layer-decor",
  TEXT: "layer-labels",
  MEASUREMENT: "layer-measurements",
};

type ActiveTool = "select" | "pan" | "tent" | "shape" | "text" | "measurement";

const TOOLS: { id: ActiveTool; label: string; icon: string }[] = [
  { id: "select", label: "Select", icon: "↖" },
  { id: "pan", label: "Pan", icon: "✋" },
  { id: "text", label: "Text", icon: "T" },
  { id: "shape", label: "Shape", icon: "▭" },
];

interface Props {
  teamId: string;
}

export function EditorLeftPanel({ teamId: _teamId }: Props) {
  const addObject = useEditorStore((s) => s.addObject);
  const activeTool = useEditorStore((s) => s.activeTool);
  const setActiveTool = useEditorStore((s) => s.setActiveTool);
  const activeLayerId = useEditorStore((s) => s.activeLayerId);
  const [showTentBuilder, setShowTentBuilder] = useState(false);
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(
    new Set(["TENT", "TABLE", "CHAIR"]),
  );

  const { data: libraryObjects = [] } = useQuery<LibraryObject[]>({
    queryKey: ["library-objects"],
    queryFn: () => apiFetch<LibraryObject[]>("/api/v1/library/objects"),
  });

  const grouped: Record<string, LibraryObject[]> = {};
  for (const obj of libraryObjects) {
    if (!grouped[obj.type]) grouped[obj.type] = [];
    grouped[obj.type]!.push(obj);
  }

  function placeObject(def: LibraryObject) {
    if (def.type === "TENT") {
      setShowTentBuilder(true);
      return;
    }
    const pxW = (def.defaultDimensions.width ?? 4) * 50;
    const pxH = (def.defaultDimensions.depth ?? 4) * 50;
    const shape = (def.geometryPreset?.shape as "RECT" | "OVAL" | "POLYGON" | "LINE" | "TEXT" | "IMAGE" | undefined) ?? "RECT";

    const newObj: CanvasObject = {
      id: uuid(),
      type: def.type as CanvasObject["type"],
      subtype: def.subtype,
      layerId: LAYER_MAP[def.type] ?? "layer-decor",
      name: def.displayName,
      transform: { x: 200, y: 200, width: pxW, height: pxH, rotation: 0 },
      geometry: {
        shape,
      },
      dimensions: {
        width: def.defaultDimensions.width ?? 4,
        depth: def.defaultDimensions.depth ?? 4,
        unit: "FT",
      },
      visibility: { visible: true, locked: false, snapEnabled: true },
      style: {
        fill: def.styleDefaults?.fill ?? undefined,
        stroke: def.styleDefaults?.stroke ?? undefined,
      },
      metadata: {
        libraryObjectId: def.id,
        ...(def.geometryPreset?.sides ? { sides: def.geometryPreset.sides } : {}),
      },
    };
    addObject(newObj);
  }

  function toggleType(type: string) {
    setExpandedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }

  return (
    <div className="w-56 bg-white border-r flex flex-col overflow-hidden shrink-0">
      {/* Tool palette */}
      <div className="p-2 border-b">
        <p className="text-xs font-medium text-muted-foreground px-1 mb-1">TOOLS</p>
        <div className="grid grid-cols-4 gap-1">
          {TOOLS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTool(t.id)}
              className={`py-1 rounded text-xs flex flex-col items-center gap-0.5 ${
                activeTool === t.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-gray-100"
              }`}
              title={t.label}
            >
              <span className="text-base leading-none">{t.icon}</span>
              <span className="text-[9px]">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Object library */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        <p className="text-xs font-medium text-muted-foreground px-1 mb-2">OBJECTS</p>
        {TYPE_ORDER.filter((t) => grouped[t]?.length).map((type) => (
          <div key={type}>
            <button
              className="w-full text-left text-xs font-medium px-1 py-1 hover:bg-gray-50 rounded flex justify-between items-center"
              onClick={() => toggleType(type)}
            >
              <span>{TYPE_LABELS[type] ?? type}</span>
              <span className="text-muted-foreground">
                {expandedTypes.has(type) ? "▾" : "▸"}
              </span>
            </button>
            {expandedTypes.has(type) && (
              <div className="ml-2 space-y-0.5">
                {grouped[type]!.map((def) => (
                  <button
                    key={def.id}
                    onClick={() => placeObject(def)}
                    className="w-full text-left text-xs px-2 py-1.5 rounded hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  >
                    {def.displayName}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {showTentBuilder && (
        <TentBuilderDialog
          onClose={() => setShowTentBuilder(false)}
          onPlace={(obj) => {
            addObject(obj);
            setShowTentBuilder(false);
          }}
          activeLayerId={activeLayerId}
        />
      )}
    </div>
  );
}
