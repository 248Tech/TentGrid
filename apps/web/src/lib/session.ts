import type { Session } from "next-auth";

export interface TeamMembershipSummary {
  id: string;
  teamId: string;
  role: string;
  status: string;
  team: {
    id: string;
    name: string;
    slug: string;
  };
}

export function getSessionMemberships(
  session: Session | null | undefined,
): TeamMembershipSummary[] {
  return ((session as any)?.memberships as TeamMembershipSummary[] | undefined) ?? [];
}

export function getCurrentTeamMembership(
  session: Session | null | undefined,
): TeamMembershipSummary | null {
  return getSessionMemberships(session)[0] ?? null;
}

export function getCurrentTeamId(session: Session | null | undefined): string {
  return getCurrentTeamMembership(session)?.teamId ?? "";
}

export function getCurrentUserId(session: Session | null | undefined): string {
  return ((session?.user as any)?.id as string | undefined) ?? "";
}
