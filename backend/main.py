from dotenv import load_dotenv
load_dotenv()

from typing import Optional

from fastapi import FastAPI, HTTPException, Request, BackgroundTasks, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl

from scorer import scan
from db import get_cached_scan, store_scan, check_rate_limit, get_recent_scans, get_stats, get_user_from_jwt, get_user_scans

app = FastAPI(title="AgentReadiness API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://agent-sites-five.vercel.app"],
    allow_methods=["POST", "GET"],
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


@app.get("/recent")
def recent_scans():
    return get_recent_scans()


@app.get("/stats")
def stats_endpoint():
    return get_stats()


@app.get("/health")
def health():
    return {"status": "ok"}
