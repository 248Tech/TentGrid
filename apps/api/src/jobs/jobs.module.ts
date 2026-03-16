import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bull";
import { ExportProcessor } from "./export.processor";
import { JobsService } from "./jobs.service";
import { JobsController } from "./jobs.controller";

export const EXPORT_QUEUE = "export";
export const AI_QUEUE = "ai";

@Module({
  imports: [
    BullModule.registerQueue({ name: EXPORT_QUEUE }),
    BullModule.registerQueue({ name: AI_QUEUE }),
  ],
  providers: [ExportProcessor, JobsService],
  controllers: [JobsController],
  exports: [JobsService],
})
export class JobsModule {}
