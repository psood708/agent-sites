# AgentReadiness

Score any website for AI agent readiness in seconds. Check `/llms.txt`, `robots.txt`, structured data, and more — get a free `/llms.txt` draft.

**Live:** [agent-sites-five.vercel.app](https://agent-sites-five.vercel.app)

---

## What it does

AI agents (ChatGPT, Claude, Perplexity, etc.) crawl and read websites differently from humans. AgentReadiness runs 8 automated checks against any URL and returns a score from 0–100 with a grade, specific recommendations, and an auto-generated `/llms.txt` draft.

### The 8 checks

| Check | Weight | What it looks for |
|---|---|---|
| `/llms.txt` | 25 pts | File exists at the root with agent-readable content |
| `robots.txt` AI rules | 10 pts | Explicit allow/deny rules for GPTBot, ClaudeBot, etc. |
| `sitemap.xml` | 10 pts | Machine-readable sitemap present |
| JSON-LD structured data | 15 pts | Schema.org markup in page HTML |
| OpenGraph tags | 10 pts | `og:title`, `og:description`, `og:url` |
| Title + meta description | 10 pts | Both present and non-empty |
| Canonical URL | 5 pts | `<link rel="canonical">` tag |
| Clean content | 15 pts | Readable text extractable via Jina Reader |

### Grades

| Score | Grade |
|---|---|
| 70–100 | Excellent |
| 40–69 | Good |
| 20–39 | Needs work |
| 0–19 | Poor |

---

## Features

- **Instant scan** — results in ~2s, parallelised async checks
- **Score share** — shareable URL with OG image for every result (`/score?url=...`)
- **Public scan log** — all scans from the last 24 hours at `/reports`
- **24h cache** — same URL won't be re-fetched within 24 hours
- **Rate limiting** — 15 scans per IP per 24 hours
- **llms.txt draft** — auto-generated starter file you can copy and deploy
- **Magic link auth** — passwordless sign-in via Supabase (`/signin`)
- **Pricing page** — three-tier model (Free / Base $19 / Pro $79) with annual billing toggle
- **Market survey + wishlist** — 5-question survey and email capture on the pricing page
- **Dark / light theme** — persisted to `localStorage`
- **Fully mobile-responsive**

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React, TypeScript, Tailwind CSS |
| Backend | FastAPI, Python 3.12, httpx, BeautifulSoup4 |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (magic link / passwordless) |
| Payments | Dodo Payments (hosted checkout links) |
| Frontend deploy | Vercel |
| Backend deploy | Render |
| CI | GitHub Actions |
| Fonts | JetBrains Mono (UI), Times New Roman (display headings) |

---

## Project structure

```
agent_sites/
├── frontend/                  # Next.js app
│   ├── app/
│   │   ├── page.tsx           # Home — scanner
│   │   ├── reports/           # Public scan log
│   │   ├── score/             # Shareable result page
│   │   ├── pricing/           # Pricing + survey + wishlist
│   │   ├── signin/            # Magic link sign-in
│   │   ├── auth/callback/     # Supabase auth callback
│   │   ├── api-docs/          # REST API docs (coming soon)
│   │   └── api/
│   │       ├── wishlist/      # POST — save survey + email
│   │       ├── checkout/      # POST — Dodo payment redirect
│   │       └── og/            # GET — dynamic OG image
│   ├── components/
│   │   ├── NavBar.tsx         # Auth-aware navigation
│   │   ├── Scanner.tsx        # Main scan form + results
│   │   ├── ScoreGauge.tsx     # Score display with histogram
│   │   ├── ScoreTable.tsx     # Per-check results table
│   │   ├── RecommendationsPanel.tsx
│   │   ├── LlmsTxtPanel.tsx   # llms.txt draft viewer
│   │   ├── ShareCard.tsx      # Social share buttons
│   │   └── ThemeToggle.tsx
│   ├── lib/supabase/
│   │   ├── server.ts          # Server-side Supabase client (SSR)
│   │   └── client.ts          # Browser Supabase client
│   └── middleware.ts          # Session refresh on every request
├── backend/
│   ├── main.py                # FastAPI app — /scan, /recent, /health
│   ├── scorer.py              # Async 8-check scoring engine
│   └── db.py                  # Supabase queries (cache, store, rate-limit)
├── supabase_wishlist.sql      # DB schema for wishlist table
├── tests/
│   ├── backend/               # pytest — scorer + db tests
│   └── frontend/              # Jest — component tests
└── .github/workflows/ci.yml   # CI: lint + test + build (frontend + backend)
```

---

## Local development

### Prerequisites

- Node.js 20+
- Python 3.12+
- A Supabase project

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local  # fill in your keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # fill in your keys
uvicorn main:app --reload
```

API runs at [http://localhost:8000](http://localhost:8000).

---

## Environment variables

### Frontend (`frontend/.env.local`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend URL (`http://localhost:8000` locally) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (safe to expose client-side) |
| `SUPABASE_URL` | Supabase project URL (server-only) |
| `SUPABASE_KEY` | Supabase **service role** key (server-only, never expose) |
| `DODO_BASE_PAYMENT_LINK` | Dodo hosted checkout URL for Base plan |
| `DODO_PRO_PAYMENT_LINK` | Dodo hosted checkout URL for Pro plan |

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_KEY` | Supabase service role key |

---

## Database schema

Two tables in Supabase:

**`public_scans`** — every scan result
```sql
id, url, domain, score, grade, checks (jsonb),
recommendations (jsonb), llms_txt_draft, passing, ip, scanned_at
```

**`wishlist`** — pricing page sign-ups
```sql
id, email (unique), answers (jsonb), created_at
```

Row-level security is enabled on `wishlist` with a public insert policy. The full schema is in [`supabase_wishlist.sql`](supabase_wishlist.sql).

---

## Deployment

### Frontend → Vercel

Push to `master`. Vercel auto-deploys. Set all `NEXT_PUBLIC_*` and server-side env vars in the Vercel dashboard under Settings → Environment Variables.

Add these URLs to Supabase → Authentication → URL Configuration:
- Site URL: `https://agent-sites-five.vercel.app`
- Redirect URLs: `https://agent-sites-five.vercel.app/auth/callback`, `http://localhost:3000/auth/callback`

### Backend → Render

Defined in [`backend/render.yaml`](backend/render.yaml). Set `SUPABASE_URL` and `SUPABASE_KEY` in the Render dashboard.

### CI/CD

GitHub Actions runs on every push to `master` / `claude/**` branches:
- **Frontend**: `npm ci` → ESLint → Jest → `next build`
- **Backend**: `pip install` → `pytest tests/backend/`

---

## Roadmap

- [x] 8-check scoring engine
- [x] Public scan log (last 24 hours, no cap)
- [x] Shareable score cards with OG images
- [x] llms.txt auto-draft generator
- [x] Rate limiting + 24h cache
- [x] Pricing page with tier comparison
- [x] Market survey + wishlist email capture
- [x] Magic link authentication (Supabase)
- [ ] Payment fulfillment (Dodo webhooks → paid tier unlock)
- [ ] Scan history for authenticated users
- [ ] Score drop alerts
- [ ] REST API with API keys
- [ ] GitHub Action for CI score monitoring
