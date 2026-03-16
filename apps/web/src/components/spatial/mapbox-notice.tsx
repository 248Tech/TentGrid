"use client";

import { AlertTriangle } from "lucide-react";

type Props = {
  isConfigured: boolean;
  children: React.ReactNode;
};

export function MapboxNotice({ isConfigured, children }: Props) {
  return (
    <div>
      {!isConfigured && (
        <div className="mb-3 flex items-start gap-2 rounded-md border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>
            Map background requires a Mapbox token. Configure{" "}
            <code className="font-mono text-xs bg-yellow-100 px-1 py-0.5 rounded">
              NEXT_PUBLIC_MAPBOX_TOKEN
            </code>{" "}
            to enable satellite and hybrid views.
          </span>
        </div>
      )}
      {children}
    </div>
  );
}
