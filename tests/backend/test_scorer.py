"""Tests for backend/scorer.py — run from repo root with:
  cd backend && ../.venv/bin/pytest ../tests/backend/
"""

import asyncio
import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from bs4 import BeautifulSoup

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../backend"))

from scorer import (
    WEIGHTS,
    build_llms_txt,
    check_canonical,
    check_json_ld,
    check_meta,
    check_opengraph,
    scan,
)


# --- Helpers ---

def soup(html):
    return BeautifulSoup(html, "html.parser")


def make_response(status=200, text=""):
    r = MagicMock()
    r.status_code = status
    r.text = text
    return r


# --- Sync soup-based checks ---

class TestCheckJsonLd:
    def test_valid_json_ld(self):
        html = '<script type="application/ld+json">{"@type": "WebSite", "name": "Test"}</script>'
        result = check_json_ld(soup(html))
        assert result["pass"] is True
        assert "WebSite" in result["detail"]
        assert result["data"]["name"] == "Test"

    def test_missing(self):
        result = check_json_ld(soup("<html></html>"))
        assert result["pass"] is False
        assert result["weight"] == WEIGHTS["json_ld"]

    def test_malformed_json(self):
        html = '<script type="application/ld+json">{bad json}</script>'
        result = check_json_ld(soup(html))
        assert result["pass"] is True  # still present, just malformed
        assert "malformed" in result["detail"]


class TestCheckOpengraph:
    def test_has_og_tags(self):
        html = '<meta property="og:title" content="Test"><meta property="og:description" content="Desc">'
        result = check_opengraph(soup(html))
        assert result["pass"] is True
        assert "og:title" in result["detail"]

    def test_missing(self):
        result = check_opengraph(soup("<html></html>"))
        assert result["pass"] is False
        assert result["weight"] == WEIGHTS["opengraph"]


class TestCheckMeta:
    def test_title_and_description(self):
        html = '<title>My Site</title><meta name="description" content="A great site">'
        result = check_meta(soup(html))
        assert result["pass"] is True
        assert "My Site" in result["detail"]

    def test_missing_description(self):
        html = "<title>My Site</title>"
        result = check_meta(soup(html))
        assert result["pass"] is False
        assert "missing meta description" in result["detail"]

    def test_missing_title(self):
        html = '<meta name="description" content="A great site">'
        result = check_meta(soup(html))
        assert result["pass"] is False
        assert "missing title" in result["detail"]

    def test_both_missing(self):
        result = check_meta(soup("<html></html>"))
        assert result["pass"] is False


class TestCheckCanonical:
    def test_has_canonical(self):
        html = '<link rel="canonical" href="https://example.com/">'
        result = check_canonical(soup(html))
        assert result["pass"] is True
        assert "https://example.com/" in result["detail"]

    def test_missing(self):
        result = check_canonical(soup("<html></html>"))
        assert result["pass"] is False
        assert result["weight"] == WEIGHTS["canonical"]


# --- build_llms_txt ---

class TestBuildLlmsTxt:
    def test_basic_output(self):
        html = '<title>My Site</title><meta name="description" content="A cool site">'
        s = soup(html)
        checks = {
            "sitemap": {"pass": True},
            "json_ld": {"pass": False, "data": None},
            "clean_content": {"pass": False, "data": None},
        }
        result = build_llms_txt("https://mysite.com", "https://mysite.com", s, checks)
        assert "# My Site" in result
        assert "> A cool site" in result
        assert "https://mysite.com/sitemap.xml" in result

    def test_no_sitemap(self):
        s = soup("<html></html>")
        checks = {
            "sitemap": {"pass": False},
            "json_ld": {"pass": False, "data": None},
            "clean_content": {"pass": False, "data": None},
        }
        result = build_llms_txt("https://mysite.com", "https://mysite.com", s, checks)
        assert "sitemap.xml" not in result

    def test_json_ld_description_included(self):
        s = soup("<html></html>")
        checks = {
            "sitemap": {"pass": False},
            "json_ld": {"pass": True, "data": {"@type": "WebSite", "description": "From structured data"}},
            "clean_content": {"pass": False, "data": None},
        }
        result = build_llms_txt("https://mysite.com", "https://mysite.com", s, checks)
        assert "From structured data" in result

    def test_jina_summary_included(self):
        s = soup("<html></html>")
        checks = {
            "sitemap": {"pass": False},
            "json_ld": {"pass": False, "data": None},
            "clean_content": {"pass": True, "data": "word " * 100},
        }
        result = build_llms_txt("https://mysite.com", "https://mysite.com", s, checks)
        assert "## Summary" in result


# --- scan() integration test (mocked HTTP) ---

class TestScan:
    @pytest.mark.asyncio
    async def test_scan_returns_expected_shape(self):
        main_html = """
        <html>
          <head>
            <title>Test Site</title>
            <meta name="description" content="A test site">
            <meta property="og:title" content="Test Site">
            <link rel="canonical" href="https://test.com/">
            <script type="application/ld+json">{"@type": "WebSite"}</script>
          </head>
        </html>
        """

        async def fake_get(client, url):
            r = MagicMock()
            if url == "https://test.com/llms.txt":
                r.status_code = 200
                r.text = "# Test Site\n"
            elif url == "https://test.com/robots.txt":
                r.status_code = 200
                r.text = "User-agent: GPTBot\nAllow: /"
            elif url in ("https://test.com/sitemap.xml", "https://test.com/sitemap_index.xml"):
                r.status_code = 404
                r.text = ""
            elif url.startswith("https://r.jina.ai/"):
                r.status_code = 200
                r.text = "clean content " * 20
            else:
                r.status_code = 200
                r.text = main_html
            return r

        with patch("scorer._get", side_effect=fake_get):
            result = await scan("https://test.com")

        assert "score" in result
        assert "checks" in result
        assert "recommendations" in result
        assert "llms_txt_draft" in result
        assert result["checks"]["llms_txt"]["pass"] is True
        assert result["checks"]["robots_txt"]["pass"] is True
        assert result["checks"]["sitemap"]["pass"] is False
        assert result["checks"]["json_ld"]["pass"] is True
        assert result["checks"]["opengraph"]["pass"] is True
        assert result["checks"]["meta"]["pass"] is True
        assert result["checks"]["canonical"]["pass"] is True
        assert result["score"] == 25 + 10 + 15 + 10 + 10 + 5 + 15  # everything except sitemap

    @pytest.mark.asyncio
    async def test_scan_returns_error_on_bad_url(self):
        async def fake_get(client, url):
            if not url.startswith("https://r.jina.ai/") and "llms" not in url and "robots" not in url and "sitemap" not in url:
                r = MagicMock()
                r.status_code = 404
                r.text = ""
                return r
            return None

        with patch("scorer._get", side_effect=fake_get):
            result = await scan("https://doesnotexist.example.com")

        assert "error" in result
