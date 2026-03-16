import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";

@Injectable()
export class ReviewService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async addComment(params: {
    teamId: string;
    projectVersionId: string;
    authorUserId: string;
    body: string;
  }) {
    const comment = await this.prisma.reviewComment.create({
      data: {
        teamId: params.teamId,
        projectVersionId: params.projectVersionId,
        authorUserId: params.authorUserId,
        body: params.body,
      },
      include: { author: { select: { id: true, fullName: true, email: true } } },
    });

    await this.audit.log({
      teamId: params.teamId,
      actorUserId: params.authorUserId,
      entityType: "PROJECT_VERSION",
      entityId: params.projectVersionId,
      action: "COMMENT_ADDED",
      metadata: { commentId: comment.id },
    });

    return comment;
  }

  async listComments(teamId: string, projectVersionId: string) {
    return this.prisma.reviewComment.findMany({
      where: { teamId, projectVersionId },
      include: { author: { select: { id: true, fullName: true, avatarUrl: true } } },
      orderBy: { createdAt: "asc" },
    });
  }

  async resolveComment(teamId: string, commentId: string, resolvedByUserId: string) {
    const comment = await this.prisma.reviewComment.findFirst({ where: { id: commentId, teamId } });
    if (!comment) throw new NotFoundException("Comment not found");

    return this.prisma.reviewComment.update({
      where: { id: commentId },
      data: { resolvedAt: new Date(), resolvedByUserId },
    });
  }

  async submitApproval(params: {
    teamId: string;
    projectVersionId: string;
    reviewerUserId: string;
    decision: string;
    notes?: string;
  }) {
    const approval = await this.prisma.reviewApproval.upsert({
      where: {
        teamId_projectVersionId_reviewerUserId: {
          teamId: params.teamId,
          projectVersionId: params.projectVersionId,
          reviewerUserId: params.reviewerUserId,
        },
      },
      update: { decision: params.decision, notes: params.notes ?? null },
      create: {
        teamId: params.teamId,
        projectVersionId: params.projectVersionId,
        reviewerUserId: params.reviewerUserId,
        decision: params.decision,
        notes: params.notes ?? null,
      },
      include: { reviewer: { select: { id: true, fullName: true } } },
    });

    await this.audit.log({
      teamId: params.teamId,
      actorUserId: params.reviewerUserId,
      entityType: "PROJECT_VERSION",
      entityId: params.projectVersionId,
      action: "REVIEW_SUBMITTED",
      metadata: { decision: params.decision },
    });

    return approval;
  }

  async getReviewSummary(teamId: string, projectVersionId: string) {
    const [comments, approvals] = await Promise.all([
      this.prisma.reviewComment.findMany({ where: { teamId, projectVersionId } }),
      this.prisma.reviewApproval.findMany({
        where: { teamId, projectVersionId },
        include: { reviewer: { select: { id: true, fullName: true } } },
      }),
    ]);

    const unresolvedCommentCount = comments.filter((c) => !c.resolvedAt).length;

    let overallDecision: string | null = null;
    if (approvals.length > 0) {
      const decisions = approvals.map((a) => a.decision);
      if (decisions.includes("REJECTED")) overallDecision = "REJECTED";
      else if (decisions.includes("NEEDS_CHANGES")) overallDecision = "NEEDS_CHANGES";
      else if (decisions.every((d) => d === "APPROVED")) overallDecision = "APPROVED";
    }

    return { projectVersionId, commentCount: comments.length, unresolvedCommentCount, approvals, overallDecision };
  }
}
