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
            parsed = urlparse(row["url"])
            return {
                "url": row["url"],
                "origin": f"{parsed.scheme}://{parsed.netloc}",
                "score": row["score"],
                "grade": row["grade"],
                "checks": row["checks"],
                "recommendations": row["recommendations"],
                "llms_txt_draft": row.get("llms_txt_draft", ""),
            }
    except Exception as e:
        logger.error("Cache lookup failed: %s", e)
    return None


def store_scan(result: dict, ip: str = "", user_id: Optional[str] = None) -> None:
    client = _get_client()
    if not client:
        return
    try:
        passing = sum(1 for c in result["checks"].values() if c.get("pass"))
        hostname = urlparse(result["origin"]).hostname or result["origin"]
        row: dict = {
            "url": result["url"],
            "domain": hostname,
            "score": result["score"],
            "grade": result["grade"],
            "checks": result["checks"],
            "recommendations": result["recommendations"],
            "llms_txt_draft": result.get("llms_txt_draft", ""),
            "passing": passing,
            "ip": ip,
        }
        if user_id:
            row["user_id"] = user_id
        client.table("public_scans").insert(row).execute()
    except Exception as e:
        logger.error("Store scan failed: %s", e)


def get_user_info_from_jwt(jwt: str) -> Optional[dict]:
    """Returns {'id': ..., 'email': ...} or None."""
    if not SUPABASE_URL or not SUPABASE_KEY:
        return None
    try:
        import httpx
        res = httpx.get(
            f"{SUPABASE_URL}/auth/v1/user",
            headers={"Authorization": f"Bearer {jwt}", "apikey": SUPABASE_KEY},
            timeout=5.0,
        )
        if res.status_code == 200:
            data = res.json()
            return {"id": data.get("id"), "email": data.get("email")}
    except Exception as e:
        logger.error("get_user_info_from_jwt failed: %s", e)
    return None


def get_user_from_jwt(jwt: str) -> Optional[str]:
    if not SUPABASE_URL or not SUPABASE_KEY:
        return None
    try:
        import httpx
        res = httpx.get(
            f"{SUPABASE_URL}/auth/v1/user",
            headers={"Authorization": f"Bearer {jwt}", "apikey": SUPABASE_KEY},
            timeout=5.0,
        )
        if res.status_code == 200:
            return res.json().get("id")
    except Exception as e:
        logger.error("get_user_from_jwt failed: %s", e)
    return None


def get_user_scans(user_id: str) -> list:
    client = _get_client()
    if not client:
        return []
    try:
        res = (
            client.table("public_scans")
            .select("url, domain, score, grade, scanned_at")
            .eq("user_id", user_id)
            .order("scanned_at", desc=True)
            .limit(50)
            .execute()
        )
        return res.data or []
    except Exception as e:
        logger.error("get_user_scans failed: %s", e)
        return []


def add_watched_url(user_id: str, user_email: str, url: str, current_score: int) -> None:
    client = _get_client()
    if not client:
        return
    try:
        client.table("watched_urls").upsert({
            "user_id": user_id,
            "user_email": user_email,
            "url": url,
            "last_score": current_score,
            "last_scanned_at": datetime.now(timezone.utc).isoformat(),
        }, on_conflict="user_id,url").execute()
    except Exception as e:
        logger.error("add_watched_url failed: %s", e)


def remove_watched_url(user_id: str, url: str) -> None:
    client = _get_client()
    if not client:
        return
    try:
        client.table("watched_urls").delete().eq("user_id", user_id).eq("url", url).execute()
    except Exception as e:
        logger.error("remove_watched_url failed: %s", e)


def get_watched_urls(user_id: str) -> list:
    client = _get_client()
    if not client:
        return []
    try:
        res = (
            client.table("watched_urls")
            .select("id, url, last_score, last_scanned_at, created_at")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )
        return res.data or []
    except Exception as e:
        logger.error("get_watched_urls failed: %s", e)
        return []


def get_all_watched_for_alerts() -> list:
    client = _get_client()
    if not client:
        return []
    try:
        res = (
            client.table("watched_urls")
            .select("id, user_email, url, last_score")
            .execute()
        )
        return res.data or []
    except Exception as e:
        logger.error("get_all_watched_for_alerts failed: %s", e)
        return []


def update_watched_score(watch_id: str, new_score: int) -> None:
    client = _get_client()
    if not client:
        return
    try:
        client.table("watched_urls").update({
            "last_score": new_score,
            "last_scanned_at": datetime.now(timezone.utc).isoformat(),
        }).eq("id", watch_id).execute()
    except Exception as e:
        logger.error("update_watched_score failed: %s", e)


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


def get_stats() -> dict:
    check_keys = ["llms_txt", "robots_txt", "sitemap", "json_ld",
                  "opengraph", "meta", "canonical", "clean_content"]
    empty: dict = {
        "total_scans": 0,
        "avg_score": 0.0,
        "grade_distribution": {"Excellent": 0, "Good": 0, "Needs work": 0, "Poor": 0},
        "check_pass_rates": {k: 0.0 for k in check_keys},
    }
    client = _get_client()
    if not client:
        return empty
    try:
        res = client.table("public_scans").select("score, grade, checks").execute()
        rows = res.data or []
        if not rows:
            return empty
        total = len(rows)
        avg_score = round(sum(r["score"] for r in rows) / total, 1)
        grade_dist: dict = {"Excellent": 0, "Good": 0, "Needs work": 0, "Poor": 0}
        for r in rows:
            g = r.get("grade", "")
            if g in grade_dist:
                grade_dist[g] += 1
        pass_counts = {k: 0 for k in check_keys}
        for r in rows:
            checks = r.get("checks") or {}
            for k in check_keys:
                if isinstance(checks.get(k), dict) and checks[k].get("pass"):
                    pass_counts[k] += 1
        check_pass_rates = {k: round(pass_counts[k] / total * 100, 1) for k in check_keys}
        return {
            "total_scans": total,
            "avg_score": avg_score,
            "grade_distribution": grade_dist,
            "check_pass_rates": check_pass_rates,
        }
    except Exception as e:
        logger.error("get_stats failed: %s", e)
        return empty


def get_recent_scans(hours: int = 24) -> list:
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
            .execute()
        )
        return res.data or []
    except Exception as e:
        logger.error("Recent scans failed: %s", e)
        return []
