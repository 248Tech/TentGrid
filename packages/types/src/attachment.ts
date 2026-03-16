import type { AnchorPoint, CanvasObject } from "./canvas";

/**
 * AnchorDefinition describes how child slots are arranged around a parent object.
 * Used in library_object_definitions.anchor_definitions.
 */
export type AnchorDefinition = {
  layout: "CIRCULAR" | "RECTANGULAR" | "CUSTOM";
  slotCount: number;
  /** Distance from the parent edge at which the child center sits (canvas units). */
  offsetFromEdge?: number;
  role?: string;
  customSlots?: Array<{ x: number; y: number; angle?: number }>;
};

/**
 * Compute anchor points for a circular arrangement (e.g. chairs around a round table).
 *
 * Places slotCount points around a circle of radius = max(width, height) / 2 + offsetFromEdge.
 * Starts at the top (angle = -π/2) and proceeds clockwise.
 * Anchor x/y are relative to the parent's center.
 */
export function computeCircularAnchors(
  parent: Pick<CanvasObject, "id" | "transform">,
  slotCount: number,
  offsetFromEdge: number = 0
): AnchorPoint[] {
  if (slotCount <= 0) return [];

  const { width, height } = parent.transform;
  const radius = Math.max(width, height) / 2 + offsetFromEdge;
  const anchors: AnchorPoint[] = [];

  for (let i = 0; i < slotCount; i++) {
    // Start at top (-π/2), go clockwise
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / slotCount;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    // Rotation in degrees: 0 = facing up. Child faces outward (+90° offset so front faces away).
    const rotationDeg = ((angle + Math.PI / 2) * 180) / Math.PI;

    anchors.push({
      id: `${parent.id}-anchor-${i}`,
      x,
      y,
      angle: rotationDeg,
      role: "seat",
    });
  }

  return anchors;
}

/**
 * Compute anchor points for a rectangular arrangement (e.g. chairs on all 4 sides of a table).
 *
 * Distributes slotCount chairs across the 4 sides proportionally to each side's length.
 * Anchor x/y are relative to the parent's center.
 */
export function computeRectangularAnchors(
  parent: Pick<CanvasObject, "id" | "transform">,
  slotCount: number,
  offsetFromEdge: number = 0
): AnchorPoint[] {
  if (slotCount <= 0) return [];

  const { width, height } = parent.transform;
  const perimeter = 2 * (width + height);

  // Raw fractional slot counts for each side
  const sides = [
    { name: "top", length: width, outwardAngle: 0 },
    { name: "right", length: height, outwardAngle: 90 },
    { name: "bottom", length: width, outwardAngle: 180 },
    { name: "left", length: height, outwardAngle: 270 },
  ];
  const rawCounts = sides.map((s) => (s.length / perimeter) * slotCount);

  // Distribute using largest-remainder method
  const floored = rawCounts.map(Math.floor);
  const remainder = slotCount - floored.reduce((a, b) => a + b, 0);
  const fractions = rawCounts
    .map((v, i) => ({ i, frac: v - floored[i] }))
    .sort((a, b) => b.frac - a.frac);
  for (let k = 0; k < remainder; k++) floored[fractions[k].i]++;

  const anchors: AnchorPoint[] = [];
  let anchorIndex = 0;

  // Top side: y fixed at -(height/2 + offsetFromEdge), x spans left to right
  const topCount = floored[0];
  for (let i = 0; i < topCount; i++) {
    const t = topCount === 1 ? 0.5 : i / (topCount - 1);
    anchors.push({
      id: `${parent.id}-anchor-${anchorIndex++}`,
      x: -width / 2 + t * width,
      y: -(height / 2 + offsetFromEdge),
      angle: 0,
      role: "seat",
    });
  }

  // Right side: x fixed at +(width/2 + offsetFromEdge), y spans top to bottom
  const rightCount = floored[1];
  for (let i = 0; i < rightCount; i++) {
    const t = rightCount === 1 ? 0.5 : i / (rightCount - 1);
    anchors.push({
      id: `${parent.id}-anchor-${anchorIndex++}`,
      x: width / 2 + offsetFromEdge,
      y: -height / 2 + t * height,
      angle: 90,
      role: "seat",
    });
  }

  // Bottom side: y fixed at +(height/2 + offsetFromEdge), x spans right to left
  const bottomCount = floored[2];
  for (let i = 0; i < bottomCount; i++) {
    const t = bottomCount === 1 ? 0.5 : i / (bottomCount - 1);
    anchors.push({
      id: `${parent.id}-anchor-${anchorIndex++}`,
      x: width / 2 - t * width,
      y: height / 2 + offsetFromEdge,
      angle: 180,
      role: "seat",
    });
  }

  // Left side: x fixed at -(width/2 + offsetFromEdge), y spans bottom to top
  const leftCount = floored[3];
  for (let i = 0; i < leftCount; i++) {
    const t = leftCount === 1 ? 0.5 : i / (leftCount - 1);
    anchors.push({
      id: `${parent.id}-anchor-${anchorIndex++}`,
      x: -(width / 2 + offsetFromEdge),
      y: height / 2 - t * height,
      angle: 270,
      role: "seat",
    });
  }

  return anchors;
}

/**
 * Resolve anchor points from an AnchorDefinition.
 */
export function resolveAnchors(
  parent: Pick<CanvasObject, "id" | "transform">,
  definition: AnchorDefinition
): AnchorPoint[] {
  switch (definition.layout) {
    case "CIRCULAR":
      return computeCircularAnchors(parent, definition.slotCount, definition.offsetFromEdge);

    case "RECTANGULAR":
      return computeRectangularAnchors(parent, definition.slotCount, definition.offsetFromEdge);

    case "CUSTOM": {
      if (!definition.customSlots) return [];
      return definition.customSlots.map((slot, i) => ({
        id: `${parent.id}-anchor-${i}`,
        x: slot.x,
        y: slot.y,
        angle: slot.angle,
        role: definition.role ?? "seat",
      }));
    }

    default:
      return [];
  }
}

/**
 * Given a parent transform and an anchor (relative to parent center), compute
 * the child object's absolute canvas position and rotation.
 *
 * - anchor.x/y are relative to the parent center
 * - The anchor offset is rotated by the parent's own rotation
 * - Child's top-left = rotated offset + parent center - child dimensions/2
 * - Child rotation = anchor.angle + parent rotation
 */
export function anchorToChildTransform(
  parentTransform: CanvasObject["transform"],
  anchor: AnchorPoint,
  childDimensions: { width: number; height: number }
): Pick<CanvasObject["transform"], "x" | "y" | "rotation"> {
  const parentCenterX = parentTransform.x + parentTransform.width / 2;
  const parentCenterY = parentTransform.y + parentTransform.height / 2;

  // Rotate the anchor offset by the parent's rotation
  const parentRotRad = (parentTransform.rotation * Math.PI) / 180;
  const rotatedX = anchor.x * Math.cos(parentRotRad) - anchor.y * Math.sin(parentRotRad);
  const rotatedY = anchor.x * Math.sin(parentRotRad) + anchor.y * Math.cos(parentRotRad);

  return {
    x: parentCenterX + rotatedX - childDimensions.width / 2,
    y: parentCenterY + rotatedY - childDimensions.height / 2,
    rotation: (anchor.angle ?? 0) + parentTransform.rotation,
  };
}
