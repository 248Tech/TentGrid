import { Module } from "@nestjs/common";
import { ProjectVersionsController } from "./project-versions.controller";
import { ProjectVersionsService } from "./project-versions.service";

@Module({
  controllers: [ProjectVersionsController],
  providers: [ProjectVersionsService],
  exports: [ProjectVersionsService],
})
export class ProjectVersionsModule {}
