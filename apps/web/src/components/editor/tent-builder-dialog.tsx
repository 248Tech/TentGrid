"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { v4 as uuid } from "uuid";
import type { CanvasObject } from "@eventgrid/types";

type FootprintShape = "RECT" | "OVAL" | "POLYGON";

interface FormData {
  width: number;
  depth: number;
  sides: number;
}

interface Props {
  onClose: () => void;
  onPlace: (obj: CanvasObject) => void;
  activeLayerId: string;
}

export function TentBuilderDialog({ onClose, onPlace, activeLayerId }: Props) {
  const [footprint, setFootprint] = useState<FootprintShape>("RECT");
  const { register, handleSubmit } = useForm<FormData>({
    defaultValues: { width: 40, depth: 60, sides: 6 },
  });

  const shapes: { value: FootprintShape; label: string }[] = [
    { value: "RECT", label: "Rectangle" },
    { value: "OVAL", label: "Oval" },
    { value: "POLYGON", label: "Polygon" },
  ];

  function onSubmit(data: FormData) {
    const pxW = data.width * 50;
    const pxH = data.depth * 50;
    const subtype =
      footprint === "POLYGON"
        ? `POLYGON_${data.sides}`
        : footprint === "OVAL"
          ? "STANDARD_OVAL"
          : data.width === data.depth
            ? "STANDARD_SQUARE"
            : "STANDARD_RECTANGLE";

    const obj: CanvasObject = {
      id: uuid(),
      type: "TENT",
      subtype,
      layerId: activeLayerId,
      name: `${data.width}x${data.depth} Tent`,
      transform: { x: 200, y: 150, width: pxW, height: pxH, rotation: 0 },
      geometry: { shape: footprint },
      dimensions: { width: data.width, depth: data.depth, unit: "FT" },
      visibility: { visible: true, locked: false, snapEnabled: true },
      style: { fill: "#f0fdf4", stroke: "#16a34a" },
      metadata: {
        footprint,
        ...(footprint === "POLYGON" ? { sides: data.sides } : {}),
      },
    };
    onPlace(obj);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-sm p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold">Tent Builder</h2>
          <button onClick={onClose} className="text-muted-foreground text-sm">
            ✕
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          {shapes.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setFootprint(s.value)}
              className={`flex-1 py-1.5 text-xs rounded border ${
                footprint === s.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "hover:bg-gray-50"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Width (ft)</label>
              <input
                {...register("width", { valueAsNumber: true, min: 1 })}
                type="number"
                className="w-full border rounded px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Depth (ft)</label>
              <input
                {...register("depth", { valueAsNumber: true, min: 1 })}
                type="number"
                className="w-full border rounded px-2 py-1.5 text-sm"
              />
            </div>
          </div>

          {footprint === "POLYGON" && (
            <div>
              <label className="block text-xs font-medium mb-1">Number of Sides</label>
              <input
                {...register("sides", { valueAsNumber: true, min: 3, max: 20 })}
                type="number"
                className="w-full border rounded px-2 py-1.5 text-sm"
              />
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-1.5 text-xs border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-1.5 text-xs bg-primary text-primary-foreground rounded hover:opacity-90"
            >
              Place Tent
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
