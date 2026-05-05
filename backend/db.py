import os
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional
from urllib.parse import urlparse

logger = logging.getLogger(__name__)

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")

_client = None


def _get_client():
    global _client
    if not SUPABASE_URL or not SUPABASE_KEY:
        return None
    if _client is None:
        try:
            from supabase import create_client
            _client = create_client(SUPABASE_URL, SUPABASE_KEY)
        except Exception as e:
            logger.error("Supabase init failed: %s", e)
    return _client


def get_cached_scan(url: str) -> Optional[dict]:
    client = _get_client()
    if not client:
        return None
    try:
        cutoff = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()
        res = (
            client.table("public_scans")
            .select("url, domain, score, grade, checks, recommendations, llms_txt_draft")
            .eq("url", url)
            .gt("scanned_at", cutoff)
            .order("scanned_at", desc=True)
            .limit(1)
            .execute()
        )
        if res.data:
            row = res.data[0]
            return {
                "url": row["url"],
                "origin": row["domain"],
                "score": row["score"],
                "grade": row["grade"],
                "checks": row["checks"],
                "recommendations": row["recommendations"],
                "llms_txt_draft": row.get("llms_txt_draft", ""),
            }
    except Exception as e:
        logger.error("Cache lookup failed: %s", e)
    return None


def store_scan(result: dict, ip: str = "") -> None:
    client = _get_client()
    if not client:
        return
    try:
        passing = sum(1 for c in result["checks"].values() if c.get("pass"))
        hostname = urlparse(result["origin"]).hostname or result["origin"]
        client.table("public_scans").insert({
            "url": result["url"],
            "domain": hostname,
            "score": result["score"],
            "grade": result["grade"],
            "checks": result["checks"],
            "recommendations": result["recommendations"],
            "llms_txt_draft": result.get("llms_txt_draft", ""),
            "passing": passing,
            "ip": ip,
        }).execute()
    except Exception as e:
        logger.error("Store scan failed: %s", e)


def check_rate_limit(ip: str, limit: int = 15) -> bool:
    """Returns True if the request is allowed."""
    client = _get_client()
    if not client:
        return True
    try:
        cutoff = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()
        res = (
            client.table("public_scans")
            .select("id", count="exact")
            .eq("ip", ip)
            .gt("scanned_at", cutoff)
            .execute()
        )
        return (res.count or 0) < limit
    except Exception as e:
        logger.error("Rate limit check failed: %s", e)
        return True  # fail open so a Supabase outage doesn't lock everyone out


def get_recent_scans(hours: int = 24, limit: int = 100) -> list:
    client = _get_client()
    if not client:
        return []
    try:
        cutoff = (datetime.now(timezone.utc) - timedelta(hours=hours)).isoformat()
        res = (
            client.table("public_scans")
            .select("domain, score, grade, passing, scanned_at")
            .gt("scanned_at", cutoff)
            .order("scanned_at", desc=True)
            .limit(limit)
            .execute()
        )
        return res.data or []
    except Exception as e:
        logger.error("Recent scans failed: %s", e)
        return []
