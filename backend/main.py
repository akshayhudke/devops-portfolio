from __future__ import annotations

import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict

import yaml
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware


APP_NAME = "resume-api"
BUILD_TIME = os.getenv("BUILD_TIME", "unknown")
GIT_COMMIT = os.getenv("GIT_COMMIT", "unknown")
RESUME_PATH = Path(
    os.getenv("RESUME_PATH", Path(__file__).resolve().parents[1] / "resume.yaml")
)

_cached_resume: Dict[str, Any] | None = None
_cached_mtime: float | None = None


def _load_resume() -> Dict[str, Any]:
    if not RESUME_PATH.exists():
        raise FileNotFoundError(f"Missing resume file at {RESUME_PATH}")

    with RESUME_PATH.open("r", encoding="utf-8") as handle:
        data = yaml.safe_load(handle) or {}

    if not isinstance(data, dict):
        raise ValueError("Resume YAML must be a mapping at the root level.")
    return data


def get_resume() -> Dict[str, Any]:
    global _cached_resume, _cached_mtime
    mtime = RESUME_PATH.stat().st_mtime
    if _cached_resume is None or _cached_mtime != mtime:
        _cached_resume = _load_resume()
        _cached_mtime = mtime
    return _cached_resume


app = FastAPI(title="Resume API", version="1.0.0")

cors_origins = [origin.strip() for origin in os.getenv("CORS_ORIGINS", "*").split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/health")
async def health() -> Dict[str, Any]:
    return {
        "status": "ok",
        "service": APP_NAME,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "build_time": BUILD_TIME,
        "git_commit": GIT_COMMIT,
    }


@app.get("/api/resume")
async def resume() -> Dict[str, Any]:
    try:
        return get_resume()
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
