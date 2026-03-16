import { Processor, Process } from "@nestjs/bull";
import { Logger } from "@nestjs/common";
import { Job } from "bull";
import { AI_DIAGRAM_QUEUE } from "./ai.module";
import { PrismaService } from "../prisma/prisma.service";
import { AiServiceAdapter } from "./ai-service-adapter";
import { AiResultNormalizer } from "./ai-result-normalizer";
import { StorageService } from "../storage/storage.service";
import { randomUUID } from "crypto";

@Processor(AI_DIAGRAM_QUEUE)
export class AiProcessor {
  private readonly logger = new Logger(AiProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly adapter: AiServiceAdapter,
    private readonly normalizer: AiResultNormalizer,
    private readonly storage: StorageService,
  ) {}

  @Process("process-diagram")
  async handleDiagram(job: Job<{ aiJobId: string; assetId: string; teamId: string }>) {
    const { aiJobId, assetId, teamId } = job.data;
    this.logger.log(`Processing AI diagram job ${aiJobId}`);

    await this.prisma.aiJob.update({
      where: { id: aiJobId },
      data: { status: "PROCESSING", startedAt: new Date() },
    });

    try {
      const asset = await this.prisma.asset.findFirst({
        where: { id: assetId, teamId, deletedAt: null },
      });
      if (!asset) throw new Error(`Asset ${assetId} not found`);

      const assetUrl = await this.storage.getPresignedDownloadUrl(asset.bucket, asset.objectKey);
      const submitResult = await this.adapter.submitDiagramJob({
        jobId: aiJobId,
        assetUrl,
        mimeType: asset.mimeType ?? "image/png",
      });

      let rawResult = null;
      if (submitResult.submitted && submitResult.externalJobId) {
        // Poll up to 30 times with 2s intervals (60s timeout)
        for (let i = 0; i < 30; i++) {
          await new Promise((r) => setTimeout(r, 2000));
          rawResult = await this.adapter.pollJobResult(submitResult.externalJobId);
          if (rawResult) break;
        }
      }

      if (!rawResult) {
        // AI service unavailable — create a stub draft so the flow still works
        this.logger.warn(`AI service unavailable for job ${aiJobId} — creating stub draft`);
        rawResult = {
          schemaVersion: 1 as const,
          jobId: aiJobId,
          inputAssetId: assetId,
          overallConfidence: 0,
          detections: [],
          suggestedDocument: null,
          warnings: ["AI service was unavailable. This is an empty draft."],
          processingNotes: [],
        };
      }

      const canvasDocument = this.normalizer.normalize(rawResult);

      const aiJob = await this.prisma.aiJob.findFirst({ where: { id: aiJobId } });
      if (!aiJob) throw new Error("AI job record disappeared");

      // Find the next version number
      let projectId = aiJob.projectId;
      let versionNumber = 1;
      if (projectId) {
        const agg = await this.prisma.projectVersion.aggregate({
          where: { projectId },
          _max: { versionNumber: true },
        });
        versionNumber = (agg._max.versionNumber ?? 0) + 1;
      } else {
        projectId = null;
      }

      const draftVersion = projectId
        ? await this.prisma.projectVersion.create({
            data: {
              projectId,
              versionNumber,
              source: "AI_DRAFT",
              label: "AI Diagram Draft",
              canvasDocument: canvasDocument as any,
              countsSummary: canvasDocument.metadata as any,
              createdByUserId: aiJob.requestedByUserId,
            },
          })
        : null;

      await this.prisma.aiJob.update({
        where: { id: aiJobId },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          confidence: rawResult.overallConfidence,
          resultPayload: rawResult as any,
          outputVersionId: draftVersion?.id ?? null,
        },
      });

      this.logger.log(`AI diagram job ${aiJobId} completed${draftVersion ? ` — draft version ${draftVersion.id}` : ""}`);
    } catch (err) {
      this.logger.error({ err }, `AI diagram job ${aiJobId} failed`);
      await this.prisma.aiJob.update({
        where: { id: aiJobId },
        data: { status: "FAILED", errorMessage: (err as Error).message },
      });
      throw err;
    }
  }
}
