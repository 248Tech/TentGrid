import { Injectable, NotFoundException, Logger } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { StorageService } from "../storage/storage.service";
import { AI_DIAGRAM_QUEUE } from "./ai.module";

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    @InjectQueue(AI_DIAGRAM_QUEUE) private readonly aiQueue: Queue,
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly storage: StorageService,
  ) {}

  async submitDiagramJob(params: {
    teamId: string;
    userId: string;
    assetId: string;
    projectId?: string;
    parameters?: Record<string, unknown>;
  }) {
    const asset = await this.prisma.asset.findFirst({
      where: { id: params.assetId, teamId: params.teamId, deletedAt: null },
    });
    if (!asset) throw new NotFoundException("Asset not found");

    const aiJob = await this.prisma.aiJob.create({
      data: {
        teamId: params.teamId,
        projectId: params.projectId ?? null,
        requestedByUserId: params.userId,
        inputAssetId: params.assetId,
        jobType: "DIAGRAM_INTERPRETATION",
        status: "QUEUED",
        parameters: (params.parameters ?? {}) as any,
      },
    });

    await this.aiQueue.add(
      "process-diagram",
      { aiJobId: aiJob.id, assetId: params.assetId, teamId: params.teamId },
      { attempts: 3, backoff: { type: "exponential", delay: 10_000 }, removeOnComplete: 50 },
    );

    await this.audit.log({
      teamId: params.teamId,
      actorUserId: params.userId,
      entityType: "AI_JOB",
      entityId: aiJob.id,
      action: "SUBMITTED",
      metadata: { jobType: "DIAGRAM_INTERPRETATION", assetId: params.assetId },
    });

    this.logger.log(`AI diagram job ${aiJob.id} queued for asset ${params.assetId}`);
    return aiJob;
  }

  async getJob(teamId: string, jobId: string) {
    const job = await this.prisma.aiJob.findFirst({
      where: { id: jobId, teamId },
      include: { inputAsset: { select: { id: true, originalFilename: true, mimeType: true } } },
    });
    if (!job) throw new NotFoundException("AI job not found");
    return job;
  }

  async listJobs(teamId: string, projectId?: string) {
    return this.prisma.aiJob.findMany({
      where: { teamId, ...(projectId ? { projectId } : {}) },
      include: { inputAsset: { select: { id: true, originalFilename: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  async acceptDraft(params: {
    teamId: string;
    userId: string;
    jobId: string;
    projectId: string;
    label?: string;
  }) {
    const job = await this.getJob(params.teamId, params.jobId);
    if (job.status !== "COMPLETED" || !job.outputVersionId) {
      throw new Error("AI job is not completed or has no output version");
    }

    // Point the project at the accepted AI draft version
    await this.prisma.project.update({
      where: { id: params.projectId },
      data: { currentVersionId: job.outputVersionId, updatedByUserId: params.userId },
    });

    await this.audit.log({
      teamId: params.teamId,
      actorUserId: params.userId,
      entityType: "AI_JOB",
      entityId: params.jobId,
      action: "DRAFT_ACCEPTED",
      metadata: { projectId: params.projectId, outputVersionId: job.outputVersionId },
    });

    return { accepted: true, versionId: job.outputVersionId };
  }
}
