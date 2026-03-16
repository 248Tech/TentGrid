import { DashboardStats } from "./dashboard-stats";
import { RecentProjects } from "./recent-projects";
import { QuickActions } from "./quick-actions";

interface DashboardShellProps {
  user: { name: string; email: string };
}

export function DashboardShell({ user }: DashboardShellProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Welcome back, {user.name.split(" ")[0]}
        </h2>
        <p className="text-muted-foreground mt-1">
          Here&apos;s what&apos;s happening with your team&apos;s events.
        </p>
      </div>

      <QuickActions />
      <DashboardStats />
      <RecentProjects />
    </div>
  );
}
