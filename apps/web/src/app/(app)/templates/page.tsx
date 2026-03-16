export const metadata = { title: "Templates | EventGrid" };

export default function TemplatesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Templates</h2>
          <p className="text-muted-foreground mt-1">Reusable layout templates for your team.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          New Template
        </button>
      </div>

      <div className="rounded-lg border">
        <div className="p-8 text-center text-muted-foreground">
          <p className="text-sm">No templates yet. Save a layout as a template to reuse it later.</p>
        </div>
      </div>
    </div>
  );
}
