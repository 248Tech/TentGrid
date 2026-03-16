import { Injectable, NotFoundException, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type { QuoteSummary, QuoteLineItem } from "@eventgrid/types";

@Injectable()
export class QuotesService {
  private readonly logger = new Logger(QuotesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async generateQuoteSummary(teamId: string, projectId: string, versionId: string): Promise<QuoteSummary> {
    const version = await this.prisma.projectVersion.findFirst({
      where: { id: versionId, projectId, project: { teamId } },
      include: { project: { select: { id: true } } },
    });
    if (!version) throw new NotFoundException("Project version not found");

    const doc = version.canvasDocument as any;
    const objects: any[] = doc?.objects ?? [];

    const lineItems = await this.buildLineItems(objects, teamId);

    const totalGuestCapacity = lineItems.reduce((sum, li) => {
      const cap = li.quantity * ((li as any).guestCapacity ?? 0);
      return sum + cap;
    }, 0);

    const totalQuotedPrice = lineItems.every((li) => li.quotedPrice != null)
      ? lineItems.reduce((sum, li) => sum + (li.quotedPrice ?? 0) * li.quantity, 0)
      : undefined;

    return {
      projectId,
      projectVersionId: versionId,
      generatedAt: new Date().toISOString(),
      lineItems,
      totalObjects: objects.length,
      totalGuestCapacity,
      totalQuotedPrice,
      currency: "USD",
      notes: [],
    };
  }

  private async buildLineItems(objects: any[], teamId: string): Promise<QuoteLineItem[]> {
    const lineMap = new Map<string, QuoteLineItem & { guestCapacity: number }>();

    for (const obj of objects) {
      const key = `${obj.type}::${obj.subtype}`;
      if (lineMap.has(key)) {
        lineMap.get(key)!.quantity += 1;
      } else {
        // Look up library definition for pricing metadata
        const def = await this.prisma.libraryObjectDefinition.findFirst({
          where: { OR: [{ isSystem: true }, { teamId }], type: obj.type, subtype: obj.subtype },
        });
        const pricing = (def?.pricingMetadata as any) ?? {};
        const capacity = (def?.capacityRules as any)?.seats ?? 0;

        lineMap.set(key, {
          objectId: obj.id ?? key,
          objectType: obj.type,
          objectSubtype: obj.subtype,
          displayName: def?.displayName ?? `${obj.type} ${obj.subtype}`,
          quantity: 1,
          sku: pricing.sku,
          unitCost: pricing.unitCost,
          quotedPrice: pricing.quotedPrice,
          laborEstimateHours: pricing.laborEstimateHours,
          notes: pricing.notes,
          guestCapacity: capacity,
        });
      }
    }

    return Array.from(lineMap.values()).map(({ guestCapacity, ...item }) => item);
  }
}
