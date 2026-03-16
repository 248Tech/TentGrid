"""
EventGrid AI Service — Diagram Interpretation

This is the stub/scaffold for the Python AI service that will process
uploaded diagrams and return normalized EventGrid object detections.

For Phase 5 development: run `uvicorn main:app --reload` to start locally.
The NestJS AiProcessor will submit jobs here and poll for results.
"""

import asyncio
import uuid
from datetime import datetime
from typing import Optional, Dict, Any, List
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="EventGrid AI Service", version="0.0.1")

# In-memory job store — replace with Redis or DB for production
_jobs: Dict[str, Dict[str, Any]] = {}


class SubmitDiagramRequest(BaseModel):
    job_id: str
    asset_url: str
    mime_type: str
    parameters: Optional[Dict[str, Any]] = {}


class SubmitDiagramResponse(BaseModel):
    external_job_id: str
    status: str


class DiagramResultResponse(BaseModel):
    schemaVersion: int = 1
    jobId: str
    inputAssetId: str
    overallConfidence: float
    detections: List[Dict[str, Any]]
    suggestedDocument: Optional[Dict[str, Any]] = None
    warnings: List[str]
    processingNotes: List[str]


@app.get("/health")
def health():
    return {"status": "ok", "service": "eventgrid-ai", "version": "0.0.1"}


@app.post("/api/v1/diagram/submit", response_model=SubmitDiagramResponse)
async def submit_diagram(request: SubmitDiagramRequest):
    """
    Accept a diagram job for processing.
    In production, this would dispatch to a computer vision pipeline.
    """
    external_id = str(uuid.uuid4())
    _jobs[external_id] = {
        "job_id": request.job_id,
        "asset_url": request.asset_url,
        "mime_type": request.mime_type,
        "status": "PROCESSING",
        "submitted_at": datetime.utcnow().isoformat(),
        "external_id": external_id,
    }

    # Simulate async processing — in production, dispatch to worker pool
    asyncio.create_task(_process_job(external_id))

    return SubmitDiagramResponse(external_job_id=external_id, status="PROCESSING")


@app.get("/api/v1/diagram/result/{external_job_id}")
async def get_result(external_job_id: str):
    """
    Poll for diagram processing result.
    Returns 404 while still processing, result when complete.
    """
    job = _jobs.get(external_job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if job["status"] == "PROCESSING":
        raise HTTPException(status_code=404, detail="Job still processing")

    if job["status"] == "FAILED":
        raise HTTPException(status_code=500, detail=job.get("error", "Unknown error"))

    return job["result"]


async def _process_job(external_id: str):
    """
    Stub processing pipeline. Replace with real CV model calls.

    In production this would:
    1. Download the asset from S3
    2. Run boundary detection
    3. Run object recognition (tents, tables, chairs, etc.)
    4. Infer scale and dimensions
    5. Convert detections to EventGrid CanvasObject format
    6. Compute confidence scores
    """
    await asyncio.sleep(3)  # Simulate processing time

    job = _jobs.get(external_id)
    if not job:
        return

    # Stub result — returns an empty draft with no detections
    # Real implementation would populate detections from CV model output
    job["result"] = {
        "schemaVersion": 1,
        "jobId": job["job_id"],
        "inputAssetId": job["asset_url"].split("/")[-1] if "/" in job["asset_url"] else "unknown",
        "overallConfidence": 0.0,
        "detections": [],
        "suggestedDocument": None,
        "warnings": [
            "AI service is running in stub mode.",
            "Replace _process_job() in main.py with real CV pipeline to enable object detection.",
        ],
        "processingNotes": ["Stub processing completed in ~3 seconds"],
    }
    job["status"] = "COMPLETED"
