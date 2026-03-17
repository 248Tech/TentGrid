import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bull";
import { ExportProcessor } from "./export.processor";
import { JobsService } from "./jobs.service";
import { JobsController } from "./jobs.controller";
import { EXPORT_QUEUE, AI_QUEUE } from "./jobs.constants";

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
