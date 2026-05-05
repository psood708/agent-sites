"""Tests for db.py — all Supabase calls are mocked."""
import os
import sys
import pytest
from unittest.mock import MagicMock, patch

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../backend"))


SAMPLE_RESULT = {
    "url": "https://stripe.com/",
    "origin": "https://stripe.com",
    "score": 65,
    "grade": "Good",
    "checks": {
        "llms_txt": {"pass": True, "weight": 25, "label": "/llms.txt", "detail": "Found", "data": None},
        "json_ld": {"pass": False, "weight": 15, "label": "JSON-LD", "detail": "Missing", "data": None},
    },
    "recommendations": [{"label": "JSON-LD", "weight": 15}],
    "llms_txt_draft": "# Stripe\n",
}


def _make_client(data=None, count=0):
    """Build a minimal mock Supabase client."""
    res = MagicMock()
    res.data = data or []
    res.count = count

    chain = MagicMock()
    chain.select.return_value = chain
    chain.eq.return_value = chain
    chain.gt.return_value = chain
    chain.order.return_value = chain
    chain.limit.return_value = chain
    chain.insert.return_value = chain
    chain.execute.return_value = res

    client = MagicMock()
    client.table.return_value = chain
    return client, chain


# ── get_cached_scan ──────────────────────────────────────────────────────────

def test_get_cached_scan_returns_none_when_no_supabase():
    import db
    with patch.object(db, "SUPABASE_URL", ""), patch.object(db, "SUPABASE_KEY", ""):
        db._client = None
        result = db.get_cached_scan("https://stripe.com/")
    assert result is None


def test_get_cached_scan_hit():
    import db
    row = {
        "url": "https://stripe.com/",
        "domain": "https://stripe.com",
        "score": 65,
        "grade": "Good",
        "checks": {},
        "recommendations": [],
        "llms_txt_draft": "",
    }
    client, _ = _make_client(data=[row])
    with patch.object(db, "_client", client), patch.object(db, "SUPABASE_URL", "https://x.supabase.co"), patch.object(db, "SUPABASE_KEY", "key"):
        result = db.get_cached_scan("https://stripe.com/")
    assert result is not None
    assert result["score"] == 65
    assert result["origin"] == "https://stripe.com"


def test_get_cached_scan_miss():
    import db
    client, _ = _make_client(data=[])
    with patch.object(db, "_client", client), patch.object(db, "SUPABASE_URL", "https://x.supabase.co"), patch.object(db, "SUPABASE_KEY", "key"):
        result = db.get_cached_scan("https://stripe.com/")
    assert result is None


# ── store_scan ───────────────────────────────────────────────────────────────

def test_store_scan_computes_passing():
    import db
    client, chain = _make_client()
    with patch.object(db, "_client", client), patch.object(db, "SUPABASE_URL", "https://x.supabase.co"), patch.object(db, "SUPABASE_KEY", "key"):
        db.store_scan(SAMPLE_RESULT, ip="1.2.3.4")

    inserted = chain.insert.call_args[0][0]
    assert inserted["passing"] == 1  # only llms_txt passes
    assert inserted["ip"] == "1.2.3.4"
    assert inserted["score"] == 65


def test_store_scan_noop_without_supabase():
    import db
    with patch.object(db, "SUPABASE_URL", ""), patch.object(db, "SUPABASE_KEY", ""):
        db._client = None
        db.store_scan(SAMPLE_RESULT)  # should not raise


# ── check_rate_limit ─────────────────────────────────────────────────────────

def test_rate_limit_allows_when_under_limit():
    import db
    client, _ = _make_client(count=10)
    with patch.object(db, "_client", client), patch.object(db, "SUPABASE_URL", "https://x.supabase.co"), patch.object(db, "SUPABASE_KEY", "key"):
        assert db.check_rate_limit("1.2.3.4", limit=15) is True


def test_rate_limit_blocks_at_limit():
    import db
    client, _ = _make_client(count=15)
    with patch.object(db, "_client", client), patch.object(db, "SUPABASE_URL", "https://x.supabase.co"), patch.object(db, "SUPABASE_KEY", "key"):
        assert db.check_rate_limit("1.2.3.4", limit=15) is False


def test_rate_limit_allows_when_no_supabase():
    import db
    with patch.object(db, "SUPABASE_URL", ""), patch.object(db, "SUPABASE_KEY", ""):
        db._client = None
        assert db.check_rate_limit("1.2.3.4") is True


# ── get_recent_scans ─────────────────────────────────────────────────────────

def test_get_recent_scans_returns_rows():
    import db
    rows = [
        {"domain": "stripe.com", "score": 88, "grade": "Excellent", "passing": 8, "scanned_at": "2026-05-05T10:00:00Z"},
        {"domain": "vercel.com", "score": 55, "grade": "Good", "passing": 5, "scanned_at": "2026-05-05T09:00:00Z"},
    ]
    client, _ = _make_client(data=rows)
    with patch.object(db, "_client", client), patch.object(db, "SUPABASE_URL", "https://x.supabase.co"), patch.object(db, "SUPABASE_KEY", "key"):
        result = db.get_recent_scans()
    assert len(result) == 2
    assert result[0]["domain"] == "stripe.com"


def test_get_recent_scans_empty_without_supabase():
    import db
    with patch.object(db, "SUPABASE_URL", ""), patch.object(db, "SUPABASE_KEY", ""):
        db._client = None
        result = db.get_recent_scans()
    assert result == []
