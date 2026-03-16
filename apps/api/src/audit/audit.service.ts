import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { pinoLogger } from "../common/logger";

@Injectable()
export class AuditService {
  private readonly logger = pinoLogger.child({ context: "AuditService" });

  constructor(private readonly prisma: PrismaService) {}

  async log(params: {
    teamId: string;
    actorUserId?: string;
    entityType: string;
    entityId: string;
    action: string;
    metadata?: Record<string, unknown>;
  }) {
    try {
      await this.prisma.auditLog.create({
        data: {
          teamId: params.teamId,
          actorUserId: params.actorUserId,
          entityType: params.entityType,
          entityId: params.entityId,
          action: params.action,
          metadata: (params.metadata ?? {}) as any,
        },
      });
      this.logger.debug(
        { entityType: params.entityType, entityId: params.entityId, action: params.action },
        "Audit log created",
      );
    } catch (err) {
      // Audit failures must not block business operations
      this.logger.error({ err, params }, "Failed to write audit log");
    }
  }
}
