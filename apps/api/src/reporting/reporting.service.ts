import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

export interface CanvasObjectLike {
  id: string;
  type: string;
  transform?: { x: number; y: number; width: number; height: number };
  reporting?: {
    quantity?: number;
    guestCapacity?: number;
    tableNumber?: string;
    countsTowardGuestCapacity?: boolean;
  };
}

export interface CountsSummary {
  totalObjects: number;
  guestCount?: number;
  seatedGuestCount?: number;
  cocktailCapacity?: number;
  tableCount?: number;
  chairCount?: number;
  countsByType: Record<string, number>;
  notes?: string[];
}

export type TableNumberingFormat = "SEQUENTIAL" | "PREFIX" | "ZONE";

export interface TableNumberingOptions {
  format: TableNumberingFormat;
  prefix?: string;
  zoneAxis?: "X" | "Y";
  zoneCount?: number;
}

@Injectable()
export class ReportingService {
  constructor(private readonly prisma: PrismaService) {}

  computeCounts(canvasDocument: Record<string, unknown>): CountsSummary {
    const objects = (canvasDocument["objects"] as CanvasObjectLike[] | undefined) ?? [];
    const notes: string[] = [];

    const countsByType: Record<string, number> = {};
    for (const obj of objects) {
      countsByType[obj.type] = (countsByType[obj.type] ?? 0) + 1;
    }

    const tableCount = countsByType["TABLE"] ?? 0;
    const chairCount = countsByType["CHAIR"] ?? 0;

    // Seated guest count: sum guestCapacity from chairs that count toward capacity
    let seatedGuestCount = 0;
    const chairs = objects.filter((o) => o.type === "CHAIR");
    for (const chair of chairs) {
      if (chair.reporting?.countsTowardGuestCapacity === false) continue;
      seatedGuestCount += chair.reporting?.guestCapacity ?? 1;
    }

    // Cocktail capacity: sum guestCapacity from LOUNGE objects
    let cocktailCapacity = 0;
    const lounges = objects.filter((o) => o.type === "LOUNGE");
    for (const lounge of lounges) {
      if (lounge.reporting?.guestCapacity) {
        cocktailCapacity += lounge.reporting.guestCapacity;
      }
    }

    // Guest count: use document-level override if present, else seatedGuestCount
    const metadataOverride = (canvasDocument["metadata"] as any)?.guestCount;
    const guestCount = typeof metadataOverride === "number" ? metadataOverride : seatedGuestCount;

    if (seatedGuestCount === 0 && chairCount > 0) {
      notes.push("Some chairs may not be configured for guest capacity tracking.");
    }

    return {
      totalObjects: objects.length,
      guestCount,
      seatedGuestCount,
      cocktailCapacity: cocktailCapacity > 0 ? cocktailCapacity : undefined,
      tableCount,
      chairCount,
      countsByType,
      notes: notes.length > 0 ? notes : undefined,
    };
  }

  numberTables(objects: CanvasObjectLike[], options: TableNumberingOptions): CanvasObjectLike[] {
    const tables = objects.filter((o) => o.type === "TABLE");
    if (tables.length === 0) return objects;

    const prefix = options.prefix ?? "T";

    if (options.format === "SEQUENTIAL") {
      // Sort top-to-bottom, left-to-right
      const sorted = [...tables].sort((a, b) => {
        const ay = a.transform?.y ?? 0;
        const by = b.transform?.y ?? 0;
        if (Math.abs(ay - by) > 50) return ay - by;
        return (a.transform?.x ?? 0) - (b.transform?.x ?? 0);
      });
      const assignments = new Map<string, string>();
      sorted.forEach((t, i) => assignments.set(t.id, String(i + 1)));
      return objects.map((o) =>
        assignments.has(o.id)
          ? { ...o, reporting: { ...o.reporting, tableNumber: assignments.get(o.id) } }
          : o,
      );
    }

    if (options.format === "PREFIX") {
      const sorted = [...tables].sort((a, b) => {
        const ay = a.transform?.y ?? 0;
        const by = b.transform?.y ?? 0;
        if (Math.abs(ay - by) > 50) return ay - by;
        return (a.transform?.x ?? 0) - (b.transform?.x ?? 0);
      });
      const assignments = new Map<string, string>();
      sorted.forEach((t, i) => assignments.set(t.id, `${prefix}${i + 1}`));
      return objects.map((o) =>
        assignments.has(o.id)
          ? { ...o, reporting: { ...o.reporting, tableNumber: assignments.get(o.id) } }
          : o,
      );
    }

    if (options.format === "ZONE") {
      const axis = options.zoneAxis ?? "X";
      const zoneCount = options.zoneCount ?? 3;
      const zoneNames = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

      // Determine axis range
      const values = tables.map((t) => (axis === "X" ? t.transform?.x ?? 0 : t.transform?.y ?? 0));
      const minVal = Math.min(...values);
      const maxVal = Math.max(...values);
      const range = maxVal - minVal || 1;
      const zoneSize = range / zoneCount;

      // Group tables by zone
      const zoneGroups: Map<number, CanvasObjectLike[]> = new Map();
      for (const table of tables) {
        const val = axis === "X" ? (table.transform?.x ?? 0) : (table.transform?.y ?? 0);
        const zoneIndex = Math.min(Math.floor((val - minVal) / zoneSize), zoneCount - 1);
        if (!zoneGroups.has(zoneIndex)) zoneGroups.set(zoneIndex, []);
        zoneGroups.get(zoneIndex)!.push(table);
      }

      const assignments = new Map<string, string>();
      for (const [zoneIndex, zoneTables] of zoneGroups.entries()) {
        const zoneName = zoneNames[zoneIndex] ?? String(zoneIndex + 1);
        const sorted = [...zoneTables].sort((a, b) => {
          // Within zone sort by opposite axis
          if (axis === "X") return (a.transform?.y ?? 0) - (b.transform?.y ?? 0);
          return (a.transform?.x ?? 0) - (b.transform?.x ?? 0);
        });
        sorted.forEach((t, i) => assignments.set(t.id, `${zoneName}${i + 1}`));
      }

      return objects.map((o) =>
        assignments.has(o.id)
          ? { ...o, reporting: { ...o.reporting, tableNumber: assignments.get(o.id) } }
          : o,
      );
    }

    return objects;
  }

  async getVersionCounts(teamId: string, projectId: string, versionId: string): Promise<CountsSummary> {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, teamId, archivedAt: null },
    });
    if (!project) throw new NotFoundException("Project not found");

    const version = await this.prisma.projectVersion.findFirst({
      where: { id: versionId, projectId },
    });
    if (!version) throw new NotFoundException("Version not found");

    if (!version.canvasDocument) {
      return { totalObjects: 0, countsByType: {} };
    }

    return this.computeCounts(version.canvasDocument as Record<string, unknown>);
  }

  async getVersionCanvasDocument(teamId: string, projectId: string, versionId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, teamId, archivedAt: null },
    });
    if (!project) throw new NotFoundException("Project not found");

    const version = await this.prisma.projectVersion.findFirst({
      where: { id: versionId, projectId },
    });
    if (!version) throw new NotFoundException("Version not found");

    return version;
  }
}
