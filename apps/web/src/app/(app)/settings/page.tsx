export const metadata = { title: "Settings | EventGrid" };

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground mt-1">Manage your account and team preferences.</p>
      </div>

      <div className="grid gap-6">
        <section className="rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Profile</h3>
          <p className="text-sm text-muted-foreground">Profile settings will be available in Phase 2.</p>
        </section>

        <section className="rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Team</h3>
          <p className="text-sm text-muted-foreground">Team management settings will be available in Phase 2.</p>
        </section>

        <section className="rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Notifications</h3>
          <p className="text-sm text-muted-foreground">Notification preferences will be available in Phase 2.</p>
        </section>
      </div>
    </div>
  );
}
