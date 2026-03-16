"use client";

type MapViewState = {
  center: [number, number];
  zoom: number;
  bearing: number;
  pitch: number;
};

type Props = {
  value: MapViewState | null;
  onChange: (mapView: MapViewState) => void;
  label?: string;
};

const DEFAULTS: MapViewState = {
  center: [0, 0],
  zoom: 14,
  bearing: 0,
  pitch: 0,
};

export function MapViewEditor({ value, onChange, label }: Props) {
  const current = value ?? DEFAULTS;

  function update(field: keyof MapViewState | "lat" | "lng", raw: string) {
    const num = parseFloat(raw);
    const val = isNaN(num) ? 0 : num;

    if (field === "lat") {
      onChange({ ...current, center: [current.center[0], val] });
    } else if (field === "lng") {
      onChange({ ...current, center: [val, current.center[1]] });
    } else {
      onChange({ ...current, [field]: val });
    }
  }

  return (
    <div className="space-y-3">
      {label && (
        <p className="text-sm font-medium text-gray-700">{label}</p>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Center Latitude
          </label>
          <input
            type="number"
            step="0.000001"
            value={current.center[1]}
            onChange={(e) => update("lat", e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Center Longitude
          </label>
          <input
            type="number"
            step="0.000001"
            value={current.center[0]}
            onChange={(e) => update("lng", e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Zoom
          </label>
          <input
            type="number"
            min={0}
            max={22}
            step={0.1}
            value={current.zoom}
            onChange={(e) => update("zoom", e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Bearing
          </label>
          <input
            type="number"
            min={-180}
            max={180}
            value={current.bearing}
            onChange={(e) => update("bearing", e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Pitch
          </label>
          <input
            type="number"
            min={0}
            max={60}
            value={current.pitch}
            onChange={(e) => update("pitch", e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
    </div>
  );
}
