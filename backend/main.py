from dotenv import load_dotenv
load_dotenv()

import os
from typing import Optional

from fastapi import FastAPI, HTTPException, Request, BackgroundTasks, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl

from scorer import scan
from db import (
    get_cached_scan, store_scan, check_rate_limit, get_recent_scans, get_stats,
    get_user_from_jwt, get_user_info_from_jwt, get_user_scans,
    add_watched_url, remove_watched_url, get_watched_urls,
    get_all_watched_for_alerts, update_watched_score,
)

CRON_SECRET = os.environ.get("CRON_SECRET", "")

app = FastAPI(title="AgentReadiness API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://agent-sites-five.vercel.app"],
    allow_methods=["POST", "GET", "DELETE", "PATCH"],
    allow_headers=["*"],
)


class ScanRequest(BaseModel):
    url: HttpUrl


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


@app.post("/scan")
async def scan_url(
    req: ScanRequest,
    request: Request,
    bg: BackgroundTasks,
    authorization: Optional[str] = Header(default=None),
):
    ip = _client_ip(request)

    if not check_rate_limit(ip, limit=15):
        raise HTTPException(
            status_code=429,
            detail="Rate limit reached: 15 scans per IP per 24 hours.",
        )

    cached = get_cached_scan(str(req.url))
    if cached:
        return cached

    result = await scan(str(req.url))
    if "error" in result:
        raise HTTPException(status_code=422, detail=result["error"])

    user_id: Optional[str] = None
    if authorization and authorization.startswith("Bearer "):
        user_id = get_user_from_jwt(authorization[7:])

    bg.add_task(store_scan, result, ip, user_id)
    return result


@app.get("/user/scans")
def user_scans_endpoint(authorization: Optional[str] = Header(default=None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    user_id = get_user_from_jwt(authorization[7:])
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return get_user_scans(user_id)


class WatchRequest(BaseModel):
    url: HttpUrl
    score: int


def _require_user(authorization: Optional[str]) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    user_id = get_user_from_jwt(authorization[7:])
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return user_id


def _require_cron(x_cron_secret: Optional[str]) -> None:
    if not CRON_SECRET or x_cron_secret != CRON_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized")


@app.post("/watch")
def add_watch(req: WatchRequest, authorization: Optional[str] = Header(default=None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    info = get_user_info_from_jwt(authorization[7:])
    if not info:
        raise HTTPException(status_code=401, detail="Unauthorized")
    existing = get_watched_urls(info["id"])
    if len(existing) >= 10:
        raise HTTPException(status_code=429, detail="Watch limit reached: max 10 URLs per account.")
    add_watched_url(info["id"], info["email"] or "", str(req.url), req.score)
    return {"ok": True}


@app.delete("/watch")
def remove_watch(url: str, authorization: Optional[str] = Header(default=None)):
    user_id = _require_user(authorization)
    remove_watched_url(user_id, url)
    return {"ok": True}


@app.get("/watch")
def list_watches(authorization: Optional[str] = Header(default=None)):
    user_id = _require_user(authorization)
    return get_watched_urls(user_id)


@app.get("/watches/all")
def all_watches(x_cron_secret: Optional[str] = Header(default=None)):
    _require_cron(x_cron_secret)
    return get_all_watched_for_alerts()


@app.patch("/watch/{watch_id}/score")
def patch_watch_score(watch_id: str, score: int, x_cron_secret: Optional[str] = Header(default=None)):
    _require_cron(x_cron_secret)
    update_watched_score(watch_id, score)
    return {"ok": True}


@app.get("/recent")
def recent_scans():
    return get_recent_scans()


@app.get("/stats")
def stats_endpoint():
    return get_stats()


@app.get("/health")
def health():
    return {"status": "ok"}
