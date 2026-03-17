"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { createProject } from "@/lib/api";
import { getCurrentTeamId, getCurrentUserId } from "@/lib/session";

function makeDraftProjectNumber() {
  const stamp = new Date().toISOString().replace(/\D/g, "").slice(2, 14);
  return `EG-${stamp}`;
}

export default function NewProjectPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const createStartedRef = useRef(false);
  const teamId = getCurrentTeamId(session);
  const userId = getCurrentUserId(session);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!teamId || !userId || createStartedRef.current) return;

    createStartedRef.current = true;

    createProject(
      teamId,
      {
        projectNumber: makeDraftProjectNumber(),
        clientFirstName: "New",
        clientLastName: "Project",
        eventDate: new Date().toISOString().slice(0, 10),
        notes: "Draft project created from the builder launcher.",
      },
      userId,
    )
      .then((project) => {
        router.replace(`/projects/${project.id}/editor?setup=1`);
      })
      .catch((createError: unknown) => {
        createStartedRef.current = false;
        setError(
          createError instanceof Error
          ? createError.message
          : "Failed to create a draft project.",
        );
      });
  }, [router, status, teamId, userId]);

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-md rounded-2xl border border-gray-200 bg-white px-8 py-7 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-gray-900">Launching Builder</h1>
          <p className="mt-2 text-sm text-gray-500">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!teamId || !userId) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-md rounded-xl border border-red-200 bg-red-50 px-6 py-5 text-center text-sm text-red-700">
          No active team was found for this account, so a draft project could not be created.
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-md rounded-2xl border border-gray-200 bg-white px-8 py-7 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900">Launching Builder</h1>
        <p className="mt-2 text-sm text-gray-500">
          Creating a draft project and opening the CAD grid.
        </p>
        {error ? (
          <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : (
          <div className="mt-5 inline-flex items-center gap-2 text-sm text-indigo-600">
            <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-600" />
            Preparing editor workspace...
          </div>
        )}
      </div>
    </div>
  );
}
