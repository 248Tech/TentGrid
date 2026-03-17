"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { searchProjects } from "@/lib/api";
import type { ProjectSearchResult } from "@/lib/api";
import { getCurrentTeamId } from "@/lib/session";

const STATUS_TABS = [
  { label: "All", value: "" },
  { label: "Draft", value: "DRAFT" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Review", value: "REVIEW" },
  { label: "Approved", value: "APPROVED" },
] as const;

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    DRAFT: "Draft",
    IN_PROGRESS: "In Progress",
    REVIEW: "Review",
    APPROVED: "Approved",
    ARCHIVED: "Archived",
  };
  return map[status] ?? status;
}

function statusColor(status: string): string {
  const map: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-600",
    IN_PROGRESS: "bg-blue-100 text-blue-700",
    REVIEW: "bg-yellow-100 text-yellow-700",
    APPROVED: "bg-green-100 text-green-700",
    ARCHIVED: "bg-red-100 text-red-600",
  };
  return map[status] ?? "bg-gray-100 text-gray-600";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function ProjectCard({
  project,
  onClick,
}: {
  project: ProjectSearchResult;
  onClick: () => void;
}) {
  const clientName = `${project.clientFirstName} ${project.clientLastName}`.trim();
  const venueName = project.venue?.name ?? project.venueNameSnapshot ?? "—";
  const versionCount = project.versions.length;

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-gray-400">{project.projectNumber}</span>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColor(project.status)}`}
            >
              {statusLabel(project.status)}
            </span>
          </div>
          <h3 className="mt-1 text-base font-semibold text-gray-900 truncate">{clientName}</h3>
          <p className="mt-0.5 text-sm text-gray-500 truncate">{venueName}</p>
        </div>
        {versionCount > 0 && (
          <span className="shrink-0 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600">
            {versionCount} {versionCount === 1 ? "version" : "versions"}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
        <span>
          Event:{" "}
          <span className="text-gray-600 font-medium">{formatDate(project.eventDate)}</span>
        </span>
        <span className="text-indigo-500 font-medium">Open Editor →</span>
      </div>
    </div>
  );
}

export default function DashboardClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const teamId = getCurrentTeamId(session);

  const [query, setQuery] = useState("");
  const [activeStatus, setActiveStatus] = useState("");
  const [projects, setProjects] = useState<ProjectSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (status === "loading" || !teamId) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void fetchProjects(query, activeStatus);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, activeStatus, teamId]);

  async function fetchProjects(q: string, status: string) {
    if (!teamId) return;
    setLoading(true);
    setError(null);
    try {
      const results = await searchProjects(teamId, {
        q: q.trim() || undefined,
        status: status || undefined,
        limit: 50,
      });
      setProjects(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects.");
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="py-20 text-center text-sm text-muted-foreground">
        Loading projects...
      </div>
    );
  }

  if (!teamId) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        No active team was found for this account.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Projects</h2>
          <p className="mt-1 text-sm text-gray-500">
            Search and manage your team&apos;s event projects.
          </p>
        </div>
        <button
          onClick={() => router.push("/projects/new")}
          className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded hover:opacity-90"
        >
          + New Project
        </button>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by client name, project number, venue…"
          className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div className="flex gap-1 border-b border-gray-200">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveStatus(tab.value)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeStatus === tab.value
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 rounded-lg bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-gray-600 font-medium">
            {query.trim() || activeStatus ? "No projects found" : "No projects yet"}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {query.trim() || activeStatus
              ? "Try adjusting your search or filters."
              : "Create your first project to get started."}
          </p>
          {!query.trim() && !activeStatus && (
            <button
              onClick={() => router.push("/projects/new")}
              className="mt-4 px-4 py-2 text-sm bg-primary text-primary-foreground rounded hover:opacity-90"
            >
              Create Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => router.push(`/projects/${project.id}/editor`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
