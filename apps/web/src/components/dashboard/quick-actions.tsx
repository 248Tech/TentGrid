import Link from "next/link";
import { PlusCircle, FolderOpen, MapPin, Layout } from "lucide-react";

const actions = [
  { label: "New Project", href: "/projects/new", icon: PlusCircle, description: "Start a new event layout" },
  { label: "Browse Projects", href: "/projects", icon: FolderOpen, description: "Open an existing project" },
  { label: "Venues", href: "/venues", icon: MapPin, description: "Manage venue records" },
  { label: "Templates", href: "/templates", icon: Layout, description: "Browse reusable templates" },
];

export function QuickActions() {
  return (
    <div>
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {actions.map(({ label, href, icon: Icon, description }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col gap-2 rounded-lg border p-4 bg-card hover:bg-accent transition-colors"
          >
            <Icon className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
