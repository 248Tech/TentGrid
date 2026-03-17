"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  getTeam,
  listTeamMembers,
  updateTeamMemberRole,
  type TeamMemberSummary,
  type TeamSummary,
} from "@/lib/api";
import {
  getCurrentTeamId,
  getCurrentTeamMembership,
  getCurrentUserId,
} from "@/lib/session";

const ROLE_OPTIONS = ["ADMIN", "SALES", "DESIGNER", "VIEWER"] as const;

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const teamId = getCurrentTeamId(session);
  const userId = getCurrentUserId(session);
  const membership = getCurrentTeamMembership(session);

  const [team, setTeam] = useState<TeamSummary | null>(null);
  const [members, setMembers] = useState<TeamMemberSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    if (!teamId) {
      setLoading(false);
      setError("No active team was found for this account.");
      return;
    }

    setLoading(true);
    setError(null);

    Promise.all([getTeam(teamId), listTeamMembers(teamId)])
      .then(([teamData, memberData]) => {
        setTeam(teamData);
        setMembers(memberData);
      })
      .catch((loadError: unknown) => {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load settings.",
        );
      })
      .finally(() => setLoading(false));
  }, [status, teamId]);

  async function handleRoleChange(memberUserId: string, role: string) {
    if (!teamId || !userId) return;

    setSavingUserId(memberUserId);
    setError(null);

    try {
      const updated = await updateTeamMemberRole(teamId, memberUserId, role, userId);
      setMembers((current) =>
        current.map((member) =>
          member.userId === memberUserId ? updated : member,
        ),
      );
    } catch (saveError: unknown) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Failed to update member role.",
      );
    } finally {
      setSavingUserId(null);
    }
  }

  const canManageRoles = membership?.role === "ADMIN";
  const featureSettings = team?.settings ?? {};

  if (status === "loading") {
    return (
      <div className="rounded-lg border p-6 text-sm text-muted-foreground">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="mt-1 text-muted-foreground">
          Manage your account context, active workspace, and team access.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-lg border p-6 text-sm text-muted-foreground">
          Loading settings...
        </div>
      ) : (
        <div className="grid gap-6">
          <section className="rounded-lg border p-6">
            <h3 className="text-lg font-semibold">Account</h3>
            <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Name</dt>
                <dd className="mt-1 font-medium text-gray-900">
                  {session?.user?.name ?? "Unknown user"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Email</dt>
                <dd className="mt-1 font-medium text-gray-900">
                  {session?.user?.email ?? "No email"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Authentication Provider</dt>
                <dd className="mt-1 font-medium text-gray-900">
                  {(session?.user as any)?.provider ?? "credentials"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Current Team Role</dt>
                <dd className="mt-1 font-medium text-gray-900">
                  {membership?.role ?? "No active membership"}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-lg border p-6">
            <h3 className="text-lg font-semibold">Workspace</h3>
            {team ? (
              <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">Team Name</dt>
                  <dd className="mt-1 font-medium text-gray-900">{team.name}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Slug</dt>
                  <dd className="mt-1 font-mono text-gray-900">{team.slug}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Created</dt>
                  <dd className="mt-1 font-medium text-gray-900">
                    {formatDate(team.createdAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Last Updated</dt>
                  <dd className="mt-1 font-medium text-gray-900">
                    {formatDate(team.updatedAt)}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-muted-foreground">Feature Settings</dt>
                  <dd className="mt-1 rounded-md bg-gray-50 p-3 font-mono text-xs text-gray-700">
                    {JSON.stringify(featureSettings, null, 2)}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                No workspace is available for this account.
              </p>
            )}
          </section>

          <section className="rounded-lg border p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">Team Members</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Review who has access to this workspace and adjust roles when needed.
                </p>
              </div>
              {!canManageRoles && (
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                  Admin access required to change roles
                </span>
              )}
            </div>

            {members.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                No active members were found for this team.
              </p>
            ) : (
              <div className="mt-4 overflow-hidden rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Member</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Email</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {members.map((member) => (
                      <tr key={member.id}>
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {member.user.fullName}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{member.user.email}</td>
                        <td className="px-4 py-3">
                          <select
                            value={member.role}
                            disabled={!canManageRoles || savingUserId === member.userId}
                            onChange={(event) => {
                              void handleRoleChange(member.userId, event.target.value);
                            }}
                            className="rounded-md border border-gray-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:bg-gray-50"
                          >
                            {ROLE_OPTIONS.map((role) => (
                              <option key={role} value={role}>
                                {role}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
