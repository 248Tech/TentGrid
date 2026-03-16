export type ReviewDecision = "APPROVED" | "REJECTED" | "NEEDS_CHANGES";

export type ReviewComment = {
  id: string;
  projectVersionId: string;
  authorUserId: string;
  authorName?: string;
  body: string;
  resolvedAt: string | null;
  createdAt: string;
};

export type ReviewApproval = {
  id: string;
  projectVersionId: string;
  reviewerUserId: string;
  reviewerName?: string;
  decision: ReviewDecision;
  notes: string | null;
  createdAt: string;
};

export type ReviewSummary = {
  projectVersionId: string;
  commentCount: number;
  unresolvedCommentCount: number;
  approvals: ReviewApproval[];
  overallDecision: ReviewDecision | null;
};
