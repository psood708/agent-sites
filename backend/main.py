from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl

from scorer import scan
from db import get_cached_scan, store_scan, check_rate_limit, get_recent_scans

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
async def scan_url(req: ScanRequest, request: Request, bg: BackgroundTasks):
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

    bg.add_task(store_scan, result, ip)
    return result


@app.get("/recent")
def recent_scans():
    return get_recent_scans()


@app.get("/health")
def health():
    return {"status": "ok"}
