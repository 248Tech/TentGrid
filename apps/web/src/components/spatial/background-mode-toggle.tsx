"use client";

type BackgroundMode = "GRID" | "SATELLITE" | "HYBRID";

type Props = {
  value: BackgroundMode;
  onChange: (mode: BackgroundMode) => void;
  disabled?: boolean;
};

const MODES: { value: BackgroundMode; label: string }[] = [
  { value: "GRID", label: "Grid" },
  { value: "SATELLITE", label: "Satellite" },
  { value: "HYBRID", label: "Hybrid" },
];

export function BackgroundModeToggle({ value, onChange, disabled }: Props) {
  return (
    <div
      className={`inline-flex rounded-md border border-gray-300 overflow-hidden ${
        disabled ? "opacity-50 pointer-events-none" : ""
      }`}
      role="group"
      aria-label="Background mode"
    >
      {MODES.map((mode, i) => {
        const isActive = value === mode.value;
        return (
          <button
            key={mode.value}
            type="button"
            onClick={() => onChange(mode.value)}
            disabled={disabled}
            aria-pressed={isActive}
            className={[
              "px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500",
              i > 0 ? "border-l border-gray-300" : "",
              isActive
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {mode.label}
          </button>
        );
      })}
    </div>
  );
}
