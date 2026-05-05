"""Agent readiness scoring engine — async version of poc/agent_readiness.py."""

import asyncio
import json
from urllib.parse import urlparse

import httpx
from bs4 import BeautifulSoup

HEADERS = {"User-Agent": "AgentReadinessBot/1.0 (checking agent-readiness)"}
TIMEOUT = 10

WEIGHTS = {
    "llms_txt": 25,
    "robots_txt": 10,
    "sitemap": 10,
    "json_ld": 15,
    "opengraph": 10,
    "meta": 10,
    "canonical": 5,
    "clean_content": 15,
}

LABELS = {
    "llms_txt": "/llms.txt file",
    "robots_txt": "robots.txt AI rules",
    "sitemap": "sitemap.xml",
    "json_ld": "JSON-LD structured data",
    "opengraph": "OpenGraph tags",
    "meta": "Title + meta description",
    "canonical": "Canonical URL",
    "clean_content": "Clean content (Jina Reader)",
}


def _result(key, passed, detail, data=None):
    return {"pass": passed, "detail": detail, "weight": WEIGHTS[key], "label": LABELS[key], "data": data}


async def _get(client, url):
    try:
        r = await client.get(url, headers=HEADERS, timeout=TIMEOUT, follow_redirects=True)
        return r
    except Exception:
        return None


async def check_llms_txt(client, origin):
    r = await _get(client, f"{origin}/llms.txt")
    if r and r.status_code == 200 and len(r.text.strip()) > 0:
        return _result("llms_txt", True, "Found", r.text.strip()[:300])
    return _result("llms_txt", False, "Missing")


async def check_robots_txt(client, origin):
    r = await _get(client, f"{origin}/robots.txt")
    if not r or r.status_code != 200:
        return _result("robots_txt", False, "robots.txt not found")
    text = r.text.lower()
    agents = ["gptbot", "claudebot", "anthropic-ai", "googleother", "bingbot"]
    found = [a for a in agents if a in text]
    if found:
        return _result("robots_txt", True, f"AI agents mentioned: {', '.join(found)}")
    return _result("robots_txt", False, "No AI agent rules (GPTBot, ClaudeBot, etc.)")


async def check_sitemap(client, origin):
    for path in ["/sitemap.xml", "/sitemap_index.xml"]:
        r = await _get(client, f"{origin}{path}")
        if r and r.status_code == 200:
            return _result("sitemap", True, f"Found at {path}")
    return _result("sitemap", False, "No sitemap.xml found")


async def check_clean_content(client, url):
    r = await _get(client, f"https://r.jina.ai/{url}")
    if r and r.status_code == 200 and len(r.text.strip()) > 100:
        word_count = len(r.text.split())
        return _result("clean_content", True, f"{word_count} words extracted cleanly", r.text[:500])
    return _result("clean_content", False, "Could not extract clean content via Jina Reader")


def check_json_ld(soup):
    scripts = soup.find_all("script", type="application/ld+json")
    if scripts:
        try:
            data = json.loads(scripts[0].string)
            kind = data.get("@type", "unknown") if isinstance(data, dict) else "array"
            return _result("json_ld", True, f"Found ({kind})", data)
        except Exception:
            return _result("json_ld", True, "Found (malformed JSON)")
    return _result("json_ld", False, "No JSON-LD structured data")


def check_opengraph(soup):
    og_tags = soup.find_all("meta", property=lambda v: v and v.startswith("og:"))
    if og_tags:
        found = [t.get("property") for t in og_tags[:5]]
        return _result("opengraph", True, f"Found: {', '.join(found)}")
    return _result("opengraph", False, "No OpenGraph tags")


def check_meta(soup):
    title = soup.find("title")
    desc = soup.find("meta", attrs={"name": "description"})
    has_title = bool(title and title.text.strip())
    has_desc = bool(desc and desc.get("content", "").strip())
    if has_title and has_desc:
        return _result("meta", True, f'Title: "{title.text.strip()[:60]}"')
    parts = []
    if not has_title:
        parts.append("missing title")
    if not has_desc:
        parts.append("missing meta description")
    return _result("meta", False, "Incomplete: " + ", ".join(parts))


def check_canonical(soup):
    link = soup.find("link", rel="canonical")
    if link and link.get("href"):
        return _result("canonical", True, f'href="{link["href"]}"')
    return _result("canonical", False, "No canonical URL")


def build_llms_txt(url, origin, soup, checks):
    title_tag = soup.find("title")
    title = title_tag.text.strip() if title_tag else ""

    desc_tag = soup.find("meta", attrs={"name": "description"})
    desc = desc_tag.get("content", "").strip() if desc_tag else ""
    if not desc:
        og_desc = soup.find("meta", property="og:description")
        if og_desc:
            desc = og_desc.get("content", "").strip()

    lines = [f"# {title or origin}", ""]
    if desc:
        lines += [f"> {desc}", ""]
    lines += ["## About", f"- URL: {url}", ""]

    json_ld_data = checks.get("json_ld", {}).get("data")
    if json_ld_data and isinstance(json_ld_data, dict) and json_ld_data.get("description"):
        lines += [json_ld_data["description"][:300], ""]

    if checks.get("sitemap", {}).get("pass"):
        lines += ["## Sitemap", f"- {origin}/sitemap.xml", ""]

    jina_text = checks.get("clean_content", {}).get("data")
    if jina_text:
        summary = " ".join(jina_text.split()[:80])
        lines += ["## Summary", summary, ""]

    lines += [
        "## Notes",
        "- This llms.txt was auto-generated by AgentReadiness",
        "- Edit to add canonical product descriptions, key pages, and agent instructions",
    ]
    return "\n".join(lines)


async def scan(url: str) -> dict:
    parsed = urlparse(url)
    origin = f"{parsed.scheme}://{parsed.netloc}"

    async with httpx.AsyncClient() as client:
        # Fetch main page first (needed for soup-based checks)
        main = await _get(client, url)
        if not main or main.status_code >= 400:
            return {"error": f"Could not fetch {url}", "url": url}

        soup = BeautifulSoup(main.text, "html.parser")

        # Run all HTTP checks in parallel
        llms, robots, sitemap, clean = await asyncio.gather(
            check_llms_txt(client, origin),
            check_robots_txt(client, origin),
            check_sitemap(client, origin),
            check_clean_content(client, url),
        )

    # Soup-based checks (sync, no I/O)
    checks = {
        "llms_txt": llms,
        "robots_txt": robots,
        "sitemap": sitemap,
        "json_ld": check_json_ld(soup),
        "opengraph": check_opengraph(soup),
        "meta": check_meta(soup),
        "canonical": check_canonical(soup),
        "clean_content": clean,
    }

    score = sum(v["weight"] for v in checks.values() if v["pass"])
    grade = "Excellent" if score >= 80 else "Good" if score >= 60 else "Needs work" if score >= 40 else "Poor"

    recommendations = sorted(
        [{"label": v["label"], "weight": v["weight"]} for v in checks.values() if not v["pass"]],
        key=lambda x: -x["weight"],
    )

    return {
        "url": url,
        "origin": origin,
        "score": score,
        "grade": grade,
        "checks": checks,
        "recommendations": recommendations,
        "llms_txt_draft": build_llms_txt(url, origin, soup, checks),
    }
