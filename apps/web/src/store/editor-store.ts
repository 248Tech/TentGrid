"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { v4 as uuid } from "uuid";
import type { CanvasDocument, CanvasObject, Layer, CountsSummary, ViewportState } from "@eventgrid/types";

const DEFAULT_LAYERS: Layer[] = [
  { id: "layer-base-map", name: "Base Map", kind: "BASE_MAP", visible: true, locked: false, zIndex: 0 },
  { id: "layer-venue", name: "Venue", kind: "VENUE", visible: true, locked: false, zIndex: 1 },
  { id: "layer-tent", name: "Tent", kind: "TENT", visible: true, locked: false, zIndex: 2 },
  { id: "layer-furniture", name: "Furniture", kind: "FURNITURE", visible: true, locked: false, zIndex: 3 },
  { id: "layer-decor", name: "Decor", kind: "DECOR", visible: true, locked: false, zIndex: 4 },
  { id: "layer-labels", name: "Labels", kind: "LABEL", visible: true, locked: false, zIndex: 5 },
  { id: "layer-overlay", name: "Overlays", kind: "OVERLAY", visible: true, locked: false, zIndex: 6 },
  { id: "layer-measurements", name: "Measurements", kind: "MEASUREMENT", visible: true, locked: false, zIndex: 7 },
];

function makeEmptyDocument(): CanvasDocument {
  return {
    schemaVersion: 1,
    documentId: uuid(),
    units: "FT",
    grid: { enabled: true, size: 50, snapEnabled: true, color: "#e5e7eb" },
    viewport: { x: 0, y: 0, zoom: 1 },
    background: { mode: "GRID" },
    layers: DEFAULT_LAYERS,
    objects: [],
    metadata: { totalObjects: 0, countsByType: {} },
  };
}

function computeCounts(objects: CanvasObject[]): CountsSummary {
  const countsByType: Record<string, number> = {};
  for (const obj of objects) {
    countsByType[obj.type] = (countsByType[obj.type] ?? 0) + 1;
  }
  return {
    totalObjects: objects.length,
    countsByType,
    tableCount: countsByType["TABLE"] ?? 0,
    chairCount: countsByType["CHAIR"] ?? 0,
  };
}

type SaveStatus = "saved" | "saving" | "unsaved" | "error";
type ActiveTool = "select" | "pan" | "tent" | "shape" | "text" | "measurement";

interface EditorState {
  document: CanvasDocument;
  projectId: string | null;
  projectVersionId: string | null;
  selectedIds: string[];
  undoStack: CanvasObject[][];
  redoStack: CanvasObject[][];
  activeLayerId: string;
  saveStatus: SaveStatus;
  lastSavedAt: Date | null;
  gridVisible: boolean;
  snapEnabled: boolean;
  activeTool: ActiveTool;

  loadDocument: (doc: CanvasDocument, projectId: string, versionId: string | null) => void;
  setViewport: (viewport: ViewportState) => void;
  setGridVisible: (visible: boolean) => void;
  setSnapEnabled: (enabled: boolean) => void;
  setActiveTool: (tool: ActiveTool) => void;

  addObject: (obj: CanvasObject) => void;
  updateObject: (id: string, patch: Partial<CanvasObject>) => void;
  deleteObjects: (ids: string[]) => void;
  duplicateObjects: (ids: string[]) => void;
  moveObjects: (ids: string[], dx: number, dy: number) => void;
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;

  selectObjects: (ids: string[]) => void;
  clearSelection: () => void;
  selectAll: () => void;

  updateLayer: (layerId: string, patch: Partial<Layer>) => void;
  setActiveLayer: (layerId: string) => void;

  undo: () => void;
  redo: () => void;
  pushUndoSnapshot: () => void;

  setSaveStatus: (status: SaveStatus) => void;
  setLastSavedAt: (date: Date) => void;
  setProjectVersionId: (id: string) => void;

  getDocument: () => CanvasDocument;
}

function pushUndo(stack: CanvasObject[][], objects: CanvasObject[]) {
  stack.push(JSON.parse(JSON.stringify(objects)) as CanvasObject[]);
  if (stack.length > 50) stack.shift();
}

export const useEditorStore = create<EditorState>()(
  immer((set, get) => ({
    document: makeEmptyDocument(),
    projectId: null,
    projectVersionId: null,
    selectedIds: [],
    undoStack: [],
    redoStack: [],
    activeLayerId: "layer-furniture",
    saveStatus: "saved",
    lastSavedAt: null,
    gridVisible: true,
    snapEnabled: true,
    activeTool: "select",

    loadDocument(doc, projectId, versionId) {
      set((s) => {
        s.document = doc;
        s.projectId = projectId;
        s.projectVersionId = versionId;
        s.selectedIds = [];
        s.undoStack = [];
        s.redoStack = [];
        s.saveStatus = "saved";
      });
    },

    setViewport(viewport) {
      set((s) => { s.document.viewport = viewport; });
    },

    setGridVisible(visible) {
      set((s) => {
        s.gridVisible = visible;
        s.document.grid.enabled = visible;
      });
    },

    setSnapEnabled(enabled) {
      set((s) => {
        s.snapEnabled = enabled;
        s.document.grid.snapEnabled = enabled;
      });
    },

    setActiveTool(tool) {
      set((s) => { s.activeTool = tool; });
    },

    pushUndoSnapshot() {
      set((s) => {
        pushUndo(s.undoStack, s.document.objects);
        s.redoStack = [];
        s.saveStatus = "unsaved";
      });
    },

    addObject(obj) {
      set((s) => {
        pushUndo(s.undoStack, s.document.objects);
        s.redoStack = [];
        s.document.objects.push(obj);
        s.document.metadata = computeCounts(s.document.objects);
        s.saveStatus = "unsaved";
      });
    },

    updateObject(id, patch) {
      set((s) => {
        pushUndo(s.undoStack, s.document.objects);
        s.redoStack = [];
        const idx = s.document.objects.findIndex((o) => o.id === id);
        if (idx !== -1) Object.assign(s.document.objects[idx]!, patch);
        s.saveStatus = "unsaved";
      });
    },

    deleteObjects(ids) {
      set((s) => {
        pushUndo(s.undoStack, s.document.objects);
        s.redoStack = [];
        s.document.objects = s.document.objects.filter((o) => !ids.includes(o.id));
        s.selectedIds = s.selectedIds.filter((id) => !ids.includes(id));
        s.document.metadata = computeCounts(s.document.objects);
        s.saveStatus = "unsaved";
      });
    },

    duplicateObjects(ids) {
      set((s) => {
        pushUndo(s.undoStack, s.document.objects);
        s.redoStack = [];
        const newObjects: CanvasObject[] = [];
        for (const id of ids) {
          const original = s.document.objects.find((o) => o.id === id);
          if (!original) continue;
          const copy = JSON.parse(JSON.stringify(original)) as CanvasObject;
          copy.id = uuid();
          copy.transform.x += 20;
          copy.transform.y += 20;
          newObjects.push(copy);
        }
        s.document.objects.push(...newObjects);
        s.selectedIds = newObjects.map((o) => o.id);
        s.document.metadata = computeCounts(s.document.objects);
        s.saveStatus = "unsaved";
      });
    },

    moveObjects(ids, dx, dy) {
      set((s) => {
        for (const id of ids) {
          const obj = s.document.objects.find((o) => o.id === id);
          if (obj) {
            obj.transform.x += dx;
            obj.transform.y += dy;
          }
        }
        s.saveStatus = "unsaved";
      });
    },

    bringForward(id) {
      set((s) => {
        const idx = s.document.objects.findIndex((o) => o.id === id);
        if (idx !== -1 && idx < s.document.objects.length - 1) {
          const a = s.document.objects[idx]!;
          const b = s.document.objects[idx + 1]!;
          s.document.objects[idx] = b;
          s.document.objects[idx + 1] = a;
        }
        s.saveStatus = "unsaved";
      });
    },

    sendBackward(id) {
      set((s) => {
        const idx = s.document.objects.findIndex((o) => o.id === id);
        if (idx > 0) {
          const a = s.document.objects[idx - 1]!;
          const b = s.document.objects[idx]!;
          s.document.objects[idx - 1] = b;
          s.document.objects[idx] = a;
        }
        s.saveStatus = "unsaved";
      });
    },

    bringToFront(id) {
      set((s) => {
        const idx = s.document.objects.findIndex((o) => o.id === id);
        if (idx !== -1) {
          const [obj] = s.document.objects.splice(idx, 1);
          if (obj) s.document.objects.push(obj);
        }
        s.saveStatus = "unsaved";
      });
    },

    sendToBack(id) {
      set((s) => {
        const idx = s.document.objects.findIndex((o) => o.id === id);
        if (idx !== -1) {
          const [obj] = s.document.objects.splice(idx, 1);
          if (obj) s.document.objects.unshift(obj);
        }
        s.saveStatus = "unsaved";
      });
    },

    selectObjects(ids) {
      set((s) => { s.selectedIds = ids; });
    },

    clearSelection() {
      set((s) => { s.selectedIds = []; });
    },

    selectAll() {
      set((s) => { s.selectedIds = s.document.objects.map((o) => o.id); });
    },

    updateLayer(layerId, patch) {
      set((s) => {
        const layer = s.document.layers.find((l) => l.id === layerId);
        if (layer) Object.assign(layer, patch);
        s.saveStatus = "unsaved";
      });
    },

    setActiveLayer(layerId) {
      set((s) => { s.activeLayerId = layerId; });
    },

    undo() {
      set((s) => {
        const snapshot = s.undoStack.pop();
        if (!snapshot) return;
        pushUndo(s.redoStack, s.document.objects);
        s.document.objects = snapshot;
        s.document.metadata = computeCounts(s.document.objects);
        s.saveStatus = "unsaved";
        s.selectedIds = [];
      });
    },

    redo() {
      set((s) => {
        const snapshot = s.redoStack.pop();
        if (!snapshot) return;
        pushUndo(s.undoStack, s.document.objects);
        s.document.objects = snapshot;
        s.document.metadata = computeCounts(s.document.objects);
        s.saveStatus = "unsaved";
        s.selectedIds = [];
      });
    },

    setSaveStatus(status) {
      set((s) => { s.saveStatus = status; });
    },

    setLastSavedAt(date) {
      set((s) => { s.lastSavedAt = date; });
    },

    setProjectVersionId(id) {
      set((s) => { s.projectVersionId = id; });
    },

    getDocument() {
      return get().document;
    },
  })),
);
