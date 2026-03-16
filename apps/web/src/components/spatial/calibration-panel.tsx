"use client";

import { useState } from "react";
import { computeScaleRatio } from "@/lib/api";

type AnchorPoint = {
  canvas: [number, number];
  map: [number, number];
};

type CalibrationResult = {
  scaleRatio: number;
  anchorPoints: AnchorPoint[];
};

type Props = {
  teamId: string;
  onCalibrationComplete?: (calibration: CalibrationResult) => void;
};

const DEFAULT_ANCHOR: AnchorPoint = { canvas: [0, 0], map: [0, 0] };

export function CalibrationPanel({ teamId, onCalibrationComplete }: Props) {
  const [anchor1, setAnchor1] = useState<AnchorPoint>({
    ...DEFAULT_ANCHOR,
    canvas: [0, 0],
    map: [0, 0],
  });
  const [anchor2, setAnchor2] = useState<AnchorPoint>({
    ...DEFAULT_ANCHOR,
    canvas: [0, 0],
    map: [0, 0],
  });
  const [canvasUnit, setCanvasUnit] = useState<"FT" | "IN" | "M">("FT");
  const [computing, setComputing] = useState(false);
  const [result, setResult] = useState<{ scaleRatio: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  function updateAnchor(
    which: 1 | 2,
    field: "canvasX" | "canvasY" | "mapLat" | "mapLng",
    raw: string
  ) {
    const val = parseFloat(raw) || 0;
    const setter = which === 1 ? setAnchor1 : setAnchor2;
    setter((prev) => {
      const next = { ...prev, canvas: [...prev.canvas] as [number, number], map: [...prev.map] as [number, number] };
      if (field === "canvasX") next.canvas[0] = val;
      if (field === "canvasY") next.canvas[1] = val;
      if (field === "mapLat") next.map[1] = val;
      if (field === "mapLng") next.map[0] = val;
      return next;
    });
    setResult(null);
    setError(null);
  }

  async function handleCompute() {
    setComputing(true);
    setError(null);
    setResult(null);
    try {
      const res = await computeScaleRatio(
        teamId,
        [anchor1, anchor2],
        canvasUnit
      );
      setResult(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Computation failed");
    } finally {
      setComputing(false);
    }
  }

  function handleApply() {
    if (!result || !onCalibrationComplete) return;
    onCalibrationComplete({
      scaleRatio: result.scaleRatio,
      anchorPoints: [anchor1, anchor2],
    });
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="px-5 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-800">Calibration</h3>
      </div>
      <div className="px-5 py-4 space-y-5">
        <p className="text-xs text-gray-500">
          Set two known points on the canvas and their real-world GPS
          coordinates to calibrate the overlay to scale.
        </p>

        {/* Anchor inputs */}
        {([1, 2] as const).map((n) => {
          const anchor = n === 1 ? anchor1 : anchor2;
          return (
            <div key={n} className="space-y-2">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Anchor {n}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Canvas X
                  </label>
                  <input
                    type="number"
                    value={anchor.canvas[0]}
                    onChange={(e) => updateAnchor(n, "canvasX", e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Canvas Y
                  </label>
                  <input
                    type="number"
                    value={anchor.canvas[1]}
                    onChange={(e) => updateAnchor(n, "canvasY", e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Map Lat
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={anchor.map[1]}
                    onChange={(e) => updateAnchor(n, "mapLat", e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Map Lng
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={anchor.map[0]}
                    onChange={(e) => updateAnchor(n, "mapLng", e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          );
        })}

        {/* Canvas Unit */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Canvas Unit
          </label>
          <select
            value={canvasUnit}
            onChange={(e) =>
              setCanvasUnit(e.target.value as "FT" | "IN" | "M")
            }
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="FT">Feet (FT)</option>
            <option value="IN">Inches (IN)</option>
            <option value="M">Meters (M)</option>
          </select>
        </div>

        {/* Compute button */}
        <button
          onClick={handleCompute}
          disabled={computing}
          className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {computing ? "Computing..." : "Compute Scale"}
        </button>

        {/* Result */}
        {result && (
          <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
            Scale ratio:{" "}
            <span className="font-semibold">{result.scaleRatio.toFixed(6)}</span>{" "}
            canvas units / meter
          </div>
        )}

        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Apply button */}
        {result && onCalibrationComplete && (
          <button
            onClick={handleApply}
            className="w-full rounded-md border border-indigo-600 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            Apply Calibration
          </button>
        )}
      </div>
    </div>
  );
}
