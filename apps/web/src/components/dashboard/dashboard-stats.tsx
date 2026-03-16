import { FolderOpen, MapPin, Layout, FileImage } from "lucide-react";

const stats = [
  { label: "Projects", value: "—", icon: FolderOpen, description: "Active projects" },
  { label: "Venues", value: "—", icon: MapPin, description: "Saved venues" },
  { label: "Templates", value: "—", icon: Layout, description: "Reusable templates" },
  { label: "Exports", value: "—", icon: FileImage, description: "Recent exports" },
];

export function DashboardStats() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {stats.map(({ label, value, icon: Icon, description }) => (
        <div key={label} className="rounded-lg border p-4 bg-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">{label}</span>
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{value}</div>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
      ))}
    </div>
  );
}
