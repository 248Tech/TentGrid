"use client";

import { useState } from "react";
import { useEditorStore } from "@/store/editor-store";
import { apiFetch } from "@/lib/api";

interface Props {
  teamId: string;
  userId: string;
}

export function EditorRightPanel({ teamId, userId }: Props) {
  const selectedIds = useEditorStore((s) => s.selectedIds);
  const objects = useEditorStore((s) => s.document.objects);
  const updateObject = useEditorStore((s) => s.updateObject);
  const deleteObjects = useEditorStore((s) => s.deleteObjects);
  const duplicateObjects = useEditorStore((s) => s.duplicateObjects);
  const bringForward = useEditorStore((s) => s.bringForward);
  const sendBackward = useEditorStore((s) => s.sendBackward);
  const bringToFront = useEditorStore((s) => s.bringToFront);
  const sendToBack = useEditorStore((s) => s.sendToBack);
  const metadata = useEditorStore((s) => s.document.metadata);
  const getDocument = useEditorStore((s) => s.getDocument);
  const projectVersionId = useEditorStore((s) => s.projectVersionId);
  const projectId = useEditorStore((s) => s.projectId);

  const [activeTab, setActiveTab] = useState<"properties" | "counts">("properties");
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [showTemplateForm, setShowTemplateForm] = useState(false);

  const selected = selectedIds.length === 1
    ? objects.find((o) => o.id === selectedIds[0])
    : undefined;

  async function saveAsTemplate() {
    if (!templateName.trim()) return;
    setSavingTemplate(true);
    try {
      const doc = getDocument();
      await apiFetch(`/api/v1/teams/${teamId}/templates`, {
        method: "POST",
        body: JSON.stringify({
          name: templateName,
          canvasDocument: doc,
          sourceProjectVersionId: projectVersionId,
          actorUserId: userId,
        }),
      });
      setShowTemplateForm(false);
      setTemplateName("");
      alert("Template saved!");
    } catch (e) {
      alert("Failed to save template: " + (e as Error).message);
    } finally {
      setSavingTemplate(false);
    }
  }

  return (
    <div className="w-64 bg-white border-l flex flex-col overflow-hidden shrink-0">
      {/* Tabs */}
      <div className="flex border-b">
        {(["properties", "counts"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-xs font-medium capitalize ${
              activeTab === tab
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === "properties" ? (
          <>
            {selected ? (
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Object</p>
                  <p className="text-sm font-medium">{selected.name ?? selected.type}</p>
                  <p className="text-xs text-muted-foreground">
                    {selected.type} / {selected.subtype}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Position</p>
                  <div className="grid grid-cols-2 gap-1">
                    <div>
                      <label className="text-[10px] text-muted-foreground">X</label>
                      <input
                        type="number"
                        value={Math.round(selected.transform.x)}
                        onChange={(e) =>
                          updateObject(selected.id, {
                            transform: { ...selected.transform, x: Number(e.target.value) },
                          })
                        }
                        className="w-full border rounded px-2 py-1 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground">Y</label>
                      <input
                        type="number"
                        value={Math.round(selected.transform.y)}
                        onChange={(e) =>
                          updateObject(selected.id, {
                            transform: { ...selected.transform, y: Number(e.target.value) },
                          })
                        }
                        className="w-full border rounded px-2 py-1 text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Dimensions</p>
                  <div className="grid grid-cols-2 gap-1">
                    <div>
                      <label className="text-[10px] text-muted-foreground">W (ft)</label>
                      <input
                        type="number"
                        value={selected.dimensions.width}
                        onChange={(e) => {
                          const w = Number(e.target.value);
                          updateObject(selected.id, {
                            dimensions: { ...selected.dimensions, width: w },
                            transform: { ...selected.transform, width: w * 50 },
                          });
                        }}
                        className="w-full border rounded px-2 py-1 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground">D (ft)</label>
                      <input
                        type="number"
                        value={selected.dimensions.depth}
                        onChange={(e) => {
                          const d = Number(e.target.value);
                          updateObject(selected.id, {
                            dimensions: { ...selected.dimensions, depth: d },
                            transform: { ...selected.transform, height: d * 50 },
                          });
                        }}
                        className="w-full border rounded px-2 py-1 text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">Rotation (°)</label>
                  <input
                    type="number"
                    value={Math.round(selected.transform.rotation)}
                    onChange={(e) =>
                      updateObject(selected.id, {
                        transform: { ...selected.transform, rotation: Number(e.target.value) },
                      })
                    }
                    className="w-full border rounded px-2 py-1 text-xs mt-1"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      updateObject(selected.id, {
                        visibility: { ...selected.visibility, visible: !selected.visibility.visible },
                      })
                    }
                    className="flex-1 py-1 text-xs border rounded hover:bg-gray-50"
                  >
                    {selected.visibility.visible ? "Hide" : "Show"}
                  </button>
                  <button
                    onClick={() =>
                      updateObject(selected.id, {
                        visibility: { ...selected.visibility, locked: !selected.visibility.locked },
                      })
                    }
                    className="flex-1 py-1 text-xs border rounded hover:bg-gray-50"
                  >
                    {selected.visibility.locked ? "Unlock" : "Lock"}
                  </button>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Layer Order</p>
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      onClick={() => bringForward(selected.id)}
                      className="py-1 text-xs border rounded hover:bg-gray-50"
                    >
                      ↑ Forward
                    </button>
                    <button
                      onClick={() => sendBackward(selected.id)}
                      className="py-1 text-xs border rounded hover:bg-gray-50"
                    >
                      ↓ Backward
                    </button>
                    <button
                      onClick={() => bringToFront(selected.id)}
                      className="py-1 text-xs border rounded hover:bg-gray-50"
                    >
                      ⇑ Front
                    </button>
                    <button
                      onClick={() => sendToBack(selected.id)}
                      className="py-1 text-xs border rounded hover:bg-gray-50"
                    >
                      ⇓ Back
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => duplicateObjects([selected.id])}
                    className="flex-1 py-1 text-xs border rounded hover:bg-gray-50"
                  >
                    Duplicate
                  </button>
                  <button
                    onClick={() => deleteObjects([selected.id])}
                    className="flex-1 py-1 text-xs border rounded hover:bg-red-50 hover:text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : selectedIds.length > 1 ? (
              <div className="space-y-3">
                <p className="text-sm font-medium">{selectedIds.length} objects selected</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => duplicateObjects(selectedIds)}
                    className="flex-1 py-1 text-xs border rounded hover:bg-gray-50"
                  >
                    Duplicate
                  </button>
                  <button
                    onClick={() => deleteObjects(selectedIds)}
                    className="flex-1 py-1 text-xs border rounded hover:bg-red-50 hover:text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Select an object to edit properties
              </p>
            )}
          </>
        ) : (
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">Object Summary</p>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Total Objects</span>
                <span className="font-medium">{metadata.totalObjects}</span>
              </div>
              {(metadata.tableCount ?? 0) > 0 && (
                <div className="flex justify-between text-xs">
                  <span>Tables</span>
                  <span className="font-medium">{metadata.tableCount}</span>
                </div>
              )}
              {(metadata.chairCount ?? 0) > 0 && (
                <div className="flex justify-between text-xs">
                  <span>Chairs</span>
                  <span className="font-medium">{metadata.chairCount}</span>
                </div>
              )}
              {Object.entries(metadata.countsByType).map(([type, count]) => (
                <div key={type} className="flex justify-between text-xs">
                  <span className="capitalize">{type.replace(/_/g, " ").toLowerCase()}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Save as template */}
      <div className="border-t p-3">
        {showTemplateForm ? (
          <div className="space-y-2">
            <input
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Template name"
              className="w-full border rounded px-2 py-1.5 text-xs"
            />
            <div className="flex gap-1">
              <button
                onClick={() => setShowTemplateForm(false)}
                className="flex-1 py-1 text-xs border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => { void saveAsTemplate(); }}
                disabled={savingTemplate || !templateName.trim()}
                className="flex-1 py-1 text-xs bg-primary text-primary-foreground rounded hover:opacity-90 disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowTemplateForm(true)}
            className="w-full py-1.5 text-xs border rounded hover:bg-gray-50 text-muted-foreground"
          >
            Save as Template
          </button>
        )}
      </div>
    </div>
  );
}
