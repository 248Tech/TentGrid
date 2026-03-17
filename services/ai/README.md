# EventGrid AI Service

Async diagram interpretation sidecar for EventGrid. Runs as a FastAPI service alongside the main stack.

## Quick start (via Docker Compose)

The AI service starts automatically as part of the full stack:

```bash
# Linux/macOS
bash scripts/deploy-local.sh

# Windows
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\deploy-local.ps1
```

Health check: `http://localhost:8000/health`

## Local development (standalone)

```bash
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## API

- `POST /api/v1/diagram/submit` — Submit a diagram for processing
- `GET /api/v1/diagram/result/{external_job_id}` — Poll for result
- `GET /health` — Health check

## Integration

The NestJS `AiProcessor` in `apps/api/src/ai/ai.processor.ts` calls this service.
Set `AI_SERVICE_URL=http://localhost:8000` in the API `.env` file (done automatically by the deploy scripts).

If the service is unavailable, the processor creates an empty stub draft and marks the job completed so the user can still proceed.

## Production implementation

Replace `_process_job()` in `main.py` with calls to a real CV pipeline:
1. Download asset from S3
2. Run boundary detection (e.g. SAM, Detectron2)
3. Classify detected regions into EventGrid object types
4. Infer real-world dimensions
5. Return populated `detections` array with confidence scores
