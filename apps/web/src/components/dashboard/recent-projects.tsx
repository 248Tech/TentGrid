export function RecentProjects() {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Recent Projects
        </h3>
      </div>
      <div className="rounded-lg border">
        <div className="p-8 text-center text-muted-foreground">
          <p className="text-sm">No recent projects.</p>
          <p className="text-xs mt-1">Create your first project to see it here.</p>
        </div>
      </div>
    </div>
  );
}
