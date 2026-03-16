"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { Stage, Layer, Rect, Ellipse, RegularPolygon, Text, Transformer } from "react-konva";
import type Konva from "konva";
import { useEditorStore } from "@/store/editor-store";
import { v4 as uuid } from "uuid";
import type { CanvasObject } from "@eventgrid/types";

const GRID_COLOR = "#e5e7eb";

function getDefaultFill(type: string): string {
  const fills: Record<string, string> = {
    TENT: "#f0fdf4",
    TABLE: "#fef3c7",
    CHAIR: "#dbeafe",
    STAGE: "#f3f4f6",
    DANCE_FLOOR: "#fdf4ff",
    BAR: "#fff7ed",
    RESTROOM: "#f0f9ff",
    LOUNGE: "#fdf2f8",
    FENCE: "#f9fafb",
    SHAPE: "#ffffff",
    MEASUREMENT: "#eff6ff",
  };
  return fills[type] ?? "#f9fafb";
}

interface ObjectShapeProps {
  obj: CanvasObject;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (patch: Partial<CanvasObject>) => void;
}

function ObjectShape({ obj, isSelected, onSelect, onChange }: ObjectShapeProps) {
  const { transform, geometry, style, visibility } = obj;
  if (!visibility.visible) return null;

  const fill = style.fill ?? getDefaultFill(obj.type);
  const stroke = isSelected ? "#3b82f6" : (style.stroke ?? "#374151");
  const strokeWidth = isSelected ? 2 : 1;

  const commonProps = {
    id: obj.id,
    x: transform.x,
    y: transform.y,
    width: transform.width,
    height: transform.height,
    rotation: transform.rotation,
    fill,
    stroke,
    strokeWidth,
    opacity: style.opacity ?? 1,
    draggable: !visibility.locked,
    onClick: onSelect,
    onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => {
      onChange({
        transform: { ...transform, x: e.target.x(), y: e.target.y() },
      });
    },
    onTransformEnd: (e: Konva.KonvaEventObject<Event>) => {
      const node = e.target as Konva.Node;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();
      node.scaleX(1);
      node.scaleY(1);
      onChange({
        transform: {
          x: node.x(),
          y: node.y(),
          width: Math.max(5, transform.width * scaleX),
          height: Math.max(5, transform.height * scaleY),
          rotation: node.rotation(),
        },
      });
    },
  };

  if (obj.type === "TEXT" || geometry.shape === "TEXT") {
    return (
      <Text
        {...commonProps}
        text={(obj.metadata?.["text"] as string | undefined) ?? obj.name ?? "Label"}
        fontSize={16}
        fill={style.fill ?? "#1f2937"}
        stroke={undefined}
      />
    );
  }

  if (geometry.shape === "OVAL") {
    return (
      <Ellipse
        {...commonProps}
        x={transform.x + transform.width / 2}
        y={transform.y + transform.height / 2}
        radiusX={transform.width / 2}
        radiusY={transform.height / 2}
      />
    );
  }

  if (geometry.shape === "POLYGON" && obj.metadata?.["sides"]) {
    return (
      <RegularPolygon
        {...commonProps}
        x={transform.x + transform.width / 2}
        y={transform.y + transform.height / 2}
        sides={obj.metadata["sides"] as number}
        radius={Math.min(transform.width, transform.height) / 2}
      />
    );
  }

  return (
    <Rect
      {...commonProps}
      cornerRadius={obj.type === "DANCE_FLOOR" ? 4 : 0}
    />
  );
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  gridSize: number,
  stageX: number,
  stageY: number,
  scale: number,
) {
  const effectiveGridSize = gridSize * scale;
  if (effectiveGridSize < 5) return;

  ctx.strokeStyle = GRID_COLOR;
  ctx.lineWidth = 0.5;
  ctx.beginPath();

  const startX = ((-stageX % effectiveGridSize) + effectiveGridSize) % effectiveGridSize;
  const startY = ((-stageY % effectiveGridSize) + effectiveGridSize) % effectiveGridSize;

  for (let x = startX; x < width; x += effectiveGridSize) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
  }
  for (let y = startY; y < height; y += effectiveGridSize) {
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }
  ctx.stroke();
}

export function EditorCanvas() {
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gridCanvasRef = useRef<HTMLCanvasElement>(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [stageScale, setStageScale] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef<{ x: number; y: number } | null>(null);

  const objects = useEditorStore((s) => s.document.objects);
  const layers = useEditorStore((s) => s.document.layers);
  const gridConfig = useEditorStore((s) => s.document.grid);
  const selectedIds = useEditorStore((s) => s.selectedIds);
  const selectObjects = useEditorStore((s) => s.selectObjects);
  const clearSelection = useEditorStore((s) => s.clearSelection);
  const updateObject = useEditorStore((s) => s.updateObject);
  const activeTool = useEditorStore((s) => s.activeTool);
  const activeLayerId = useEditorStore((s) => s.activeLayerId);
  const addObject = useEditorStore((s) => s.addObject);
  const gridVisible = useEditorStore((s) => s.gridVisible);

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setStageSize({ width, height });
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const tr = transformerRef.current;
    const stage = stageRef.current;
    if (!tr || !stage) return;
    const nodes = selectedIds
      .map((id) => stage.findOne(`#${id}`) as Konva.Node | undefined)
      .filter((n): n is Konva.Node => !!n);
    tr.nodes(nodes);
    tr.getLayer()?.batchDraw();
  }, [selectedIds]);

  useEffect(() => {
    const canvas = gridCanvasRef.current;
    if (!canvas || !gridVisible) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx, canvas.width, canvas.height, gridConfig.size, stagePos.x, stagePos.y, stageScale);
  }, [gridVisible, gridConfig.size, stagePos, stageScale, stageSize]);

  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();
      const stage = stageRef.current;
      if (!stage) return;
      const scaleBy = 1.05;
      const pointer = stage.getPointerPosition();
      if (!pointer) return;
      const mousePointTo = {
        x: (pointer.x - stagePos.x) / stageScale,
        y: (pointer.y - stagePos.y) / stageScale,
      };
      const newScale = e.evt.deltaY > 0 ? stageScale / scaleBy : stageScale * scaleBy;
      const clamped = Math.min(Math.max(newScale, 0.1), 10);
      setStageScale(clamped);
      setStagePos({
        x: pointer.x - mousePointTo.x * clamped,
        y: pointer.y - mousePointTo.y * clamped,
      });
    },
    [stageScale, stagePos],
  );

  const handleMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (activeTool === "pan" || e.evt.button === 1) {
        setIsPanning(true);
        panStart.current = { x: e.evt.clientX - stagePos.x, y: e.evt.clientY - stagePos.y };
        return;
      }
      if (e.target === stageRef.current) clearSelection();
    },
    [activeTool, stagePos, clearSelection],
  );

  const handleMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!isPanning || !panStart.current) return;
      setStagePos({
        x: e.evt.clientX - panStart.current.x,
        y: e.evt.clientY - panStart.current.y,
      });
    },
    [isPanning],
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    panStart.current = null;
  }, []);

  const handleClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (activeTool === "pan") return;
      if (e.target === stageRef.current) clearSelection();
    },
    [activeTool, clearSelection],
  );

  const handleDblClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (activeTool !== "shape" && activeTool !== "text") return;
      const stage = stageRef.current;
      if (!stage) return;
      const pointer = stage.getPointerPosition();
      if (!pointer) return;
      const x = (pointer.x - stagePos.x) / stageScale;
      const y = (pointer.y - stagePos.y) / stageScale;

      if (activeTool === "text") {
        addObject({
          id: uuid(),
          type: "TEXT",
          subtype: "LABEL",
          layerId: activeLayerId,
          name: "Label",
          transform: { x, y, width: 100, height: 30, rotation: 0 },
          geometry: { shape: "TEXT" },
          dimensions: { width: 2, depth: 0.5, unit: "FT" },
          visibility: { visible: true, locked: false, snapEnabled: true },
          style: { fill: "#1f2937" },
          metadata: { text: "Label" },
        });
      } else if (activeTool === "shape") {
        addObject({
          id: uuid(),
          type: "SHAPE",
          subtype: "RECTANGLE",
          layerId: activeLayerId,
          transform: { x, y, width: 100, height: 100, rotation: 0 },
          geometry: { shape: "RECT" },
          dimensions: { width: 2, depth: 2, unit: "FT" },
          visibility: { visible: true, locked: false, snapEnabled: true },
          style: { fill: "#e5e7eb", stroke: "#374151" },
          metadata: {},
        });
      }
    },
    [activeTool, addObject, activeLayerId, stagePos, stageScale],
  );

  const visibleLayerIds = new Set(layers.filter((l) => l.visible).map((l) => l.id));
  const visibleObjects = objects.filter((o) => visibleLayerIds.has(o.layerId));

  return (
    <div
      ref={containerRef}
      className="flex-1 relative overflow-hidden bg-gray-200"
      style={{ cursor: activeTool === "pan" || isPanning ? "grab" : "default" }}
    >
      {gridVisible && (
        <canvas
          ref={gridCanvasRef}
          width={stageSize.width}
          height={stageSize.height}
          className="absolute inset-0 pointer-events-none"
        />
      )}
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        x={stagePos.x}
        y={stagePos.y}
        scaleX={stageScale}
        scaleY={stageScale}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
        onDblClick={handleDblClick}
      >
        <Layer>
          {visibleObjects.map((obj) => (
            <ObjectShape
              key={obj.id}
              obj={obj}
              isSelected={selectedIds.includes(obj.id)}
              onSelect={() => {
                if (activeTool === "select") selectObjects([obj.id]);
              }}
              onChange={(patch) => updateObject(obj.id, patch)}
            />
          ))}
          <Transformer
            ref={transformerRef}
            rotateEnabled={true}
            enabledAnchors={[
              "top-left", "top-center", "top-right",
              "middle-left", "middle-right",
              "bottom-left", "bottom-center", "bottom-right",
            ]}
            boundBoxFunc={(oldBox, newBox) => {
              if (newBox.width < 10 || newBox.height < 10) return oldBox;
              return newBox;
            }}
          />
        </Layer>
      </Stage>

      <div className="absolute bottom-4 right-4 bg-white border rounded px-2 py-1 text-xs text-muted-foreground select-none">
        {Math.round(stageScale * 100)}%
      </div>
    </div>
  );
}
