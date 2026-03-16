type Transform = { x: number; y: number; width: number; height: number; rotation: number };
type Positioned = { id: string; transform: Transform };

/**
 * Align all objects to the leftmost x of the selection.
 */
export function alignLeft<T extends Positioned>(objects: T[]): T[] {
  if (objects.length < 2) return objects;
  const minX = Math.min(...objects.map((o) => o.transform.x));
  return objects.map((o) => ({ ...o, transform: { ...o.transform, x: minX } }));
}

/**
 * Align all objects so their right edges match the rightmost right edge.
 */
export function alignRight<T extends Positioned>(objects: T[]): T[] {
  if (objects.length < 2) return objects;
  const maxRight = Math.max(...objects.map((o) => o.transform.x + o.transform.width));
  return objects.map((o) => ({
    ...o,
    transform: { ...o.transform, x: maxRight - o.transform.width },
  }));
}

/**
 * Align all objects to the topmost y.
 */
export function alignTop<T extends Positioned>(objects: T[]): T[] {
  if (objects.length < 2) return objects;
  const minY = Math.min(...objects.map((o) => o.transform.y));
  return objects.map((o) => ({ ...o, transform: { ...o.transform, y: minY } }));
}

/**
 * Align all objects so their bottom edges match the bottommost bottom edge.
 */
export function alignBottom<T extends Positioned>(objects: T[]): T[] {
  if (objects.length < 2) return objects;
  const maxBottom = Math.max(...objects.map((o) => o.transform.y + o.transform.height));
  return objects.map((o) => ({
    ...o,
    transform: { ...o.transform, y: maxBottom - o.transform.height },
  }));
}

/**
 * Align objects so their horizontal centers match the average center x.
 */
export function alignCenterH<T extends Positioned>(objects: T[]): T[] {
  if (objects.length < 2) return objects;
  const avgCenterX =
    objects.reduce((sum, o) => sum + o.transform.x + o.transform.width / 2, 0) / objects.length;
  return objects.map((o) => ({
    ...o,
    transform: { ...o.transform, x: avgCenterX - o.transform.width / 2 },
  }));
}

/**
 * Align objects so their vertical centers match the average center y.
 */
export function alignCenterV<T extends Positioned>(objects: T[]): T[] {
  if (objects.length < 2) return objects;
  const avgCenterY =
    objects.reduce((sum, o) => sum + o.transform.y + o.transform.height / 2, 0) / objects.length;
  return objects.map((o) => ({
    ...o,
    transform: { ...o.transform, y: avgCenterY - o.transform.height / 2 },
  }));
}

/**
 * Distribute objects with equal horizontal gaps between them.
 * Sort by x, fix leftmost and rightmost, distribute middle ones evenly.
 */
export function distributeH<T extends Positioned>(objects: T[]): T[] {
  if (objects.length < 3) return objects;

  const sorted = [...objects].sort((a, b) => a.transform.x - b.transform.x);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  const totalSpan = last.transform.x + last.transform.width - first.transform.x;
  const totalObjectWidth = sorted.reduce((sum, o) => sum + o.transform.width, 0);
  const gapBetween = (totalSpan - totalObjectWidth) / (sorted.length - 1);

  let cursor = first.transform.x + first.transform.width + gapBetween;
  const redistributed = sorted.map((o, i) => {
    if (i === 0 || i === sorted.length - 1) return o;
    const updated = { ...o, transform: { ...o.transform, x: cursor } };
    cursor += o.transform.width + gapBetween;
    return updated;
  });

  // Restore original order
  const byId = new Map(redistributed.map((o) => [o.id, o]));
  return objects.map((o) => byId.get(o.id) ?? o);
}

/**
 * Distribute objects with equal vertical gaps between them.
 * Sort by y, fix topmost and bottommost, distribute middle ones evenly.
 */
export function distributeV<T extends Positioned>(objects: T[]): T[] {
  if (objects.length < 3) return objects;

  const sorted = [...objects].sort((a, b) => a.transform.y - b.transform.y);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  const totalSpan = last.transform.y + last.transform.height - first.transform.y;
  const totalObjectHeight = sorted.reduce((sum, o) => sum + o.transform.height, 0);
  const gapBetween = (totalSpan - totalObjectHeight) / (sorted.length - 1);

  let cursor = first.transform.y + first.transform.height + gapBetween;
  const redistributed = sorted.map((o, i) => {
    if (i === 0 || i === sorted.length - 1) return o;
    const updated = { ...o, transform: { ...o.transform, y: cursor } };
    cursor += o.transform.height + gapBetween;
    return updated;
  });

  // Restore original order
  const byId = new Map(redistributed.map((o) => [o.id, o]));
  return objects.map((o) => byId.get(o.id) ?? o);
}
