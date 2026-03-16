const publicApiBase = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:4000";
const internalApiBase = process.env["API_INTERNAL_URL"] ?? publicApiBase;
const API_BASE = typeof window === "undefined" ? internalApiBase : publicApiBase;

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API error ${res.status}: ${body}`);
  }

  return res.json() as Promise<T>;
}

export const api = {
  teams: {
    get: (id: string) => apiFetch(`/api/v1/teams/${id}`),
    members: (id: string) => apiFetch(`/api/v1/teams/${id}/members`),
  },
  projects: {
    list: (teamId: string) => apiFetch(`/api/v1/teams/${teamId}/projects`),
    get: (teamId: string, id: string) => apiFetch(`/api/v1/teams/${teamId}/projects/${id}`),
    create: (teamId: string, data: unknown) =>
      apiFetch(`/api/v1/teams/${teamId}/projects`, { method: "POST", body: JSON.stringify(data) }),
  },
  venues: {
    list: (teamId: string) => apiFetch(`/api/v1/teams/${teamId}/venues`),
    get: (teamId: string, id: string) => apiFetch(`/api/v1/teams/${teamId}/venues/${id}`),
  },
  templates: {
    list: (teamId: string) => apiFetch(`/api/v1/teams/${teamId}/templates`),
  },
  assets: {
    initiateUpload: (teamId: string, data: unknown) =>
      apiFetch(`/api/v1/teams/${teamId}/assets/initiate-upload`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
};
