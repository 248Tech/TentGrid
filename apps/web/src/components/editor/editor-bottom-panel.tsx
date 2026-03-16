"use client";

import { useState } from "react";
import { useEditorStore } from "@/store/editor-store";

export function EditorBottomPanel() {
  const [showLayers, setShowLayers] = useState(false);
  const layers = useEditorStore((s) => s.document.layers);
  const updateLayer = useEditorStore((s) => s.updateLayer);
  const setActiveLayer = useEditorStore((s) => s.setActiveLayer);
  const activeLayerId = useEditorStore((s) => s.activeLayerId);
  const gridVisible = useEditorStore((s) => s.gridVisible);
  const setGridVisible = useEditorStore((s) => s.setGridVisible);
  const snapEnabled = useEditorStore((s) => s.snapEnabled);
  const setSnapEnabled = useEditorStore((s) => s.setSnapEnabled);

  return (
    <div className="bg-white border-t shrink-0">
      <div className="flex items-center gap-2 px-3 py-1.5 border-b">
        <button
          onClick={() => setShowLayers((v) => !v)}
          className={`text-xs px-2 py-1 rounded ${
            showLayers ? "bg-primary text-primary-foreground" : "hover:bg-gray-100"
          }`}
        >
          Layers
        </button>
        <div className="w-px h-4 bg-border mx-1" />
        <label className="flex items-center gap-1 text-xs cursor-pointer">
          <input
            type="checkbox"
            checked={gridVisible}
            onChange={(e) => setGridVisible(e.target.checked)}
            className="w-3 h-3"
          />
          Grid
        </label>
        <label className="flex items-center gap-1 text-xs cursor-pointer">
          <input
            type="checkbox"
            checked={snapEnabled}
            onChange={(e) => setSnapEnabled(e.target.checked)}
            className="w-3 h-3"
          />
          Snap
        </label>
      </div>

      {showLayers && (
        <div className="max-h-40 overflow-y-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-3 py-1 font-medium text-muted-foreground">Layer</th>
                <th className="text-center px-2 py-1 font-medium text-muted-foreground">Vis</th>
                <th className="text-center px-2 py-1 font-medium text-muted-foreground">Lock</th>
                <th className="w-4 px-2 py-1" />
              </tr>
            </thead>
            <tbody>
              {[...layers]
                .sort((a, b) => b.zIndex - a.zIndex)
                .map((layer) => (
                  <tr
                    key={layer.id}
                    className={`border-b hover:bg-gray-50 cursor-pointer ${
                      activeLayerId === layer.id ? "bg-blue-50" : ""
                    }`}
                    onClick={() => setActiveLayer(layer.id)}
                  >
                    <td className="px-3 py-1">{layer.name}</td>
                    <td className="text-center px-2 py-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateLayer(layer.id, { visible: !layer.visible });
                        }}
                        className="hover:opacity-70"
                      >
                        {layer.visible ? "👁" : "🚫"}
                      </button>
                    </td>
                    <td className="text-center px-2 py-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateLayer(layer.id, { locked: !layer.locked });
                        }}
                        className="hover:opacity-70"
                      >
                        {layer.locked ? "🔒" : "🔓"}
                      </button>
                    </td>
                    <td className="px-2 py-1">
                      {activeLayerId === layer.id && (
                        <span className="text-blue-600 text-[10px]">●</span>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
