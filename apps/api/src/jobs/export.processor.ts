import { Processor, Process } from "@nestjs/bull";
import { Job } from "bull";
import { EXPORT_QUEUE } from "./jobs.module";
import { PrismaService } from "../prisma/prisma.service";
import { pinoLogger } from "../common/logger";

@Processor(EXPORT_QUEUE)
export class ExportProcessor {
  private readonly logger = pinoLogger.child({ context: "ExportProcessor" });

  constructor(private readonly prisma: PrismaService) {}

  @Process("process-export")
  async handleExport(job: Job<{ exportJobId: string; projectId: string; exportType: string }>) {
    const { exportJobId, exportType } = job.data;
    this.logger.info({ exportJobId, exportType }, "Processing export job");

    try {
      await this.prisma.exportJob.update({
        where: { id: exportJobId },
        data: { status: "PROCESSING", startedAt: new Date() },
      });

      // Phase 2 will implement actual canvas rendering and PDF/PNG generation here.
      // For now we mark it completed as a proof of infrastructure.
      await this.prisma.exportJob.update({
        where: { id: exportJobId },
        data: { status: "COMPLETED", completedAt: new Date() },
      });

      this.logger.info({ exportJobId }, "Export job completed");
    } catch (err) {
      this.logger.error({ exportJobId, err }, "Export job failed");
      await this.prisma.exportJob.update({
        where: { id: exportJobId },
        data: { status: "FAILED", errorMessage: (err as Error).message },
      });
      throw err;
    }
  }
}
