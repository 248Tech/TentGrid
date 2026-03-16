# EventGrid v0.0.1

Initial public project cut for EventGrid.

## Highlights

- Browser-based event layout workspace with project, template, venue, and version records.
- Core editor shell for layout drafting, object placement, tent configuration, reporting, and export-oriented workflows.
- Business workflow support for project search, counts, table numbering, and snapshot-based revisions.
- Venue and spatial groundwork with reusable venue geometry, map view persistence, and calibration support.
- AI/review/quote scaffolding wired into the API and Python sidecar so the stack can run end-to-end in local demo mode.
- Single-script deployment path via `scripts/deploy-local.ps1` and full container orchestration via `docker compose`.

## Initial release scope

`v0.0.1` is an initial runnable release for local deployment, evaluation, and continued product development. It is optimized for internal demos and iterative build-out rather than hardened production use.

## Known limitations

- Credential auth is demo-local only.
- AI diagram interpretation is still scaffolded and returns stub detections.
- GitHub OAuth is optional and must be configured manually.
- Production hosting, secrets management, observability, and managed object storage should be treated as post-`v0.0.1` hardening work.

## First run

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\deploy-local.ps1
```

Then open `http://localhost:3000` and sign in with:

- `admin@eventgrid.dev` / any password
- `sales@eventgrid.dev` / any password
