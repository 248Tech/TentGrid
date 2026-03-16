import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bull";
import { AiController } from "./ai.controller";
import { AiService } from "./ai.service";
import { AiProcessor } from "./ai.processor";
import { AiServiceAdapter } from "./ai-service-adapter";
import { AiResultNormalizer } from "./ai-result-normalizer";
import { AssetsModule } from "../assets/assets.module";

export const AI_DIAGRAM_QUEUE = "ai-diagram";

@Module({
  imports: [
    BullModule.registerQueue({ name: AI_DIAGRAM_QUEUE }),
    AssetsModule,
  ],
  controllers: [AiController],
  providers: [AiService, AiProcessor, AiServiceAdapter, AiResultNormalizer],
  exports: [AiService],
})
export class AiModule {}
