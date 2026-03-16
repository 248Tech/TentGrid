import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";
import { EXPORT_QUEUE } from "./jobs.module";
import { PrismaService } from "../prisma/prisma.service";
import { pinoLogger } from "../common/logger";

@Injectable()
export class JobsService {
  private readonly logger = pinoLogger.child({ context: "JobsService" });

  constructor(
    @InjectQueue(EXPORT_QUEUE) private readonly exportQueue: Queue,
    private readonly prisma: PrismaService,
  ) {}

  async enqueueExport(data: { exportJobId: string; projectId: string; exportType: string }) {
    const job = await this.exportQueue.add("process-export", data, {
      attempts: 3,
      backoff: { type: "exponential", delay: 5000 },
      removeOnComplete: 100,
      removeOnFail: 50,
    });
    this.logger.info({ jobId: job.id, exportJobId: data.exportJobId }, "Export job enqueued");
    return job;
  }

  async createAndEnqueueExport(
    teamId: string,
    projectId: string,
    projectVersionId: string,
    exportType: "PNG" | "PDF",
    requestedByUserId: string,
  ) {
    const exportJob = await this.prisma.exportJob.create({
      data: {
        teamId,
        projectId,
        projectVersionId,
        exportType: exportType as any,
        status: "QUEUED" as any,
        requestedByUserId,
      },
    });

    await this.enqueueExport({
      exportJobId: exportJob.id,
      projectId,
      exportType,
    });

    this.logger.info(
      { exportJobId: exportJob.id, exportType, projectId },
      "Export job created and enqueued",
    );

    return exportJob;
  }

  async getExportJob(teamId: string, projectId: string, exportId: string) {
    return this.prisma.exportJob.findFirst({
      where: { id: exportId, teamId, projectId },
    });
  }

  async getQueueStatus() {
    const [waiting, active, completed, failed] = await Promise.all([
      this.exportQueue.getWaitingCount(),
      this.exportQueue.getActiveCount(),
      this.exportQueue.getCompletedCount(),
      this.exportQueue.getFailedCount(),
    ]);
    return { queue: EXPORT_QUEUE, waiting, active, completed, failed };
  }
}
