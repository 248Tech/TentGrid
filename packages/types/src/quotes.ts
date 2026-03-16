export type QuoteLineItem = {
  objectId: string;
  objectType: string;
  objectSubtype: string;
  displayName: string;
  quantity: number;
  sku?: string;
  unitCost?: number;
  quotedPrice?: number;
  laborEstimateHours?: number;
  notes?: string;
};

export type QuoteSummary = {
  projectId: string;
  projectVersionId: string;
  generatedAt: string;
  lineItems: QuoteLineItem[];
  totalObjects: number;
  totalGuestCapacity: number;
  totalQuotedPrice?: number;
  totalLaborHours?: number;
  currency: string;
  notes: string[];
};
