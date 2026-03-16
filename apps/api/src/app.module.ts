import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { BullModule } from "@nestjs/bull";
import { TerminusModule } from "@nestjs/terminus";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { TeamsModule } from "./teams/teams.module";
import { ProjectsModule } from "./projects/projects.module";
import { VenuesModule } from "./venues/venues.module";
import { TemplatesModule } from "./templates/templates.module";
import { AssetsModule } from "./assets/assets.module";
import { JobsModule } from "./jobs/jobs.module";
import { ProjectVersionsModule } from "./project-versions/project-versions.module";
import { LibraryModule } from "./library/library.module";
import { ReportingModule } from "./reporting/reporting.module";
import { SpatialModule } from "./spatial/spatial.module";
import { HealthModule } from "./health/health.module";
import { AuditModule } from "./audit/audit.module";
import { appConfig } from "./common/config";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [appConfig] }),
    BullModule.forRoot({
      redis: process.env["REDIS_URL"] ?? "redis://localhost:6379",
    }),
    TerminusModule,
    PrismaModule,
    AuthModule,
    TeamsModule,
    ProjectsModule,
    VenuesModule,
    TemplatesModule,
    AssetsModule,
    JobsModule,
    ProjectVersionsModule,
    LibraryModule,
    ReportingModule,
    SpatialModule,
    HealthModule,
    AuditModule,
  ],
})
export class AppModule {}
