# EventGrid v0.0.2

Usability update for local demos and operator workflows.

## Highlights

- New project creation now launches directly into the CAD editor through a draft-project flow.
- The editor includes a setup panel for saving project details, selecting or creating a venue, and dropping starter objects with preset measurements.
- `/projects` no longer 404s, and the templates and settings pages now provide working product surfaces instead of placeholders.
- Session-to-team resolution is now wired through backend auth sync so venue, template, settings, and project screens can resolve the active team consistently.
- Local deployment is more reliable through corrected seed/bootstrap commands, improved Docker build/runtime paths, and verified full-stack startup.

## Usability updates

- Project creation entry points were consolidated so dashboard and quick-action flows lead into the actual editor experience.
- Venue management now uses the signed-in user and active team instead of invalid hardcoded fallback identifiers.
- Sign-out now forces a clean redirect back to the sign-in page.
- Team settings now expose account context, workspace information, and member role management.
- Templates can now be created directly as reusable blank layout starters.

## Operational updates

- Root `pnpm db:seed` now works correctly.
- API and web Dockerfiles were updated to build from the current workspace layout and use the correct runtime entrypoints.
- The API container now pushes schema changes on startup before seeding and launching.
- Job queue constants were extracted into a shared module.

## Known limitations

- Credential auth remains demo-local.
- AI diagram interpretation remains scaffolded.
- Web builds still emit the known `next-auth` / `jose` Edge Runtime warning, but the build completes successfully.

## First run

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\deploy-local.ps1
```

Then open `http://localhost:3000` and sign in with:

- `admin@eventgrid.dev` / any password
- `sales@eventgrid.dev` / any password
