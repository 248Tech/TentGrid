import { Injectable, Logger } from "@nestjs/common";
import type { AiDiagramResult } from "@eventgrid/types";

@Injectable()
export class AiServiceAdapter {
  private readonly logger = new Logger(AiServiceAdapter.name);
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env["AI_SERVICE_URL"] ?? "http://localhost:8000";
  }

  async submitDiagramJob(params: {
    jobId: string;
    assetUrl: string;
    mimeType: string;
    parameters?: Record<string, unknown>;
  }): Promise<{ submitted: boolean; externalJobId?: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/api/v1/diagram/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_id: params.jobId,
          asset_url: params.assetUrl,
          mime_type: params.mimeType,
          parameters: params.parameters ?? {},
        }),
        signal: AbortSignal.timeout(10_000),
      });

      if (!res.ok) {
        this.logger.warn(`AI service returned ${res.status} for job ${params.jobId}`);
        return { submitted: false };
      }

      const body = (await res.json()) as { external_job_id?: string };
      return { submitted: true, externalJobId: body.external_job_id };
    } catch (err) {
      this.logger.error({ err }, "AI service unreachable — will retry via queue");
      return { submitted: false };
    }
  }

  async pollJobResult(externalJobId: string): Promise<AiDiagramResult | null> {
    try {
      const res = await fetch(`${this.baseUrl}/api/v1/diagram/result/${externalJobId}`, {
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) return null;
      return res.json() as Promise<AiDiagramResult>;
    } catch {
      return null;
    }
  }
}
