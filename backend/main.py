from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl

from scorer import scan

app = FastAPI(title="AgentReadiness API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


class ScanRequest(BaseModel):
    url: HttpUrl


@app.post("/scan")
async def scan_url(req: ScanRequest):
    result = await scan(str(req.url))
    if "error" in result:
        raise HTTPException(status_code=422, detail=result["error"])
    return result


@app.get("/health")
def health():
    return {"status": "ok"}
