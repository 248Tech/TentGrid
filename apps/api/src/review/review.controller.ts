import { Controller, Get, Post, Patch, Param, Body } from "@nestjs/common";
import { ReviewService } from "./review.service";

@Controller("v1/teams/:teamId/projects/:projectId/versions/:versionId/review")
export class ReviewController {
  constructor(private readonly review: ReviewService) {}

  @Get()
  getSummary(@Param("teamId") teamId: string, @Param("versionId") versionId: string) {
    return this.review.getReviewSummary(teamId, versionId);
  }

  @Get("comments")
  listComments(@Param("teamId") teamId: string, @Param("versionId") versionId: string) {
    return this.review.listComments(teamId, versionId);
  }

  @Post("comments")
  addComment(
    @Param("teamId") teamId: string,
    @Param("versionId") versionId: string,
    @Body() body: { authorUserId: string; body: string },
  ) {
    return this.review.addComment({ teamId, projectVersionId: versionId, ...body });
  }

  @Patch("comments/:commentId/resolve")
  resolveComment(
    @Param("teamId") teamId: string,
    @Param("commentId") commentId: string,
    @Body() body: { resolvedByUserId: string },
  ) {
    return this.review.resolveComment(teamId, commentId, body.resolvedByUserId);
  }

  @Post("approval")
  submitApproval(
    @Param("teamId") teamId: string,
    @Param("versionId") versionId: string,
    @Body() body: { reviewerUserId: string; decision: string; notes?: string },
  ) {
    return this.review.submitApproval({ teamId, projectVersionId: versionId, ...body });
  }
}
