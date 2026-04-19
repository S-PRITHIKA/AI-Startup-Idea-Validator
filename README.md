# Startup Validator v3.1 — Investor Edition

AI-powered startup idea validation with **Gemini**. Generates a clean, investor-ready Smart Validation Report and lets you **download it as a polished .docx** to send straight to your manager.

## What's new in v3.1

- **Downloadable .docx report** — one click on the Validation Report page (or Results page) gives you a professionally formatted Word document with all six sections + final decision + cover page, ready to email or print.
- **Cleaner sidebar layout** — each report area (Validation Report, Execution Blueprint, Competitor Gaps) lives on its own dedicated page. The Results page is now a focused overview that links into them.
- **Consistent visual style** — random emoji icons removed across the app and replaced with a uniform geometric glyph set.

## Sidebar sections

| Section | What it shows |
|---|---|
| Main · Validate Idea | Submit a new idea for analysis |
| Main · My Ideas | History of all ideas you've validated |
| Main · Compare Ideas | Side-by-side AI-judged comparison |
| Main · Founder Profile | Your background (powers Founder-Fit scoring) |
| Report · Validation Report | The 6-section investor-ready report + .docx download |
| Report · Execution Blueprint | Tech stack, MVP features, timeline, tools, budget, team |
| Report · Competitor Gaps | What competitors miss — your opportunity |
| Tools · AI Co-Founder | Chat with an AI advisor about your idea |
| Tools · What-If Simulator | Stress-test scenarios |
| Tools · Learning Hub | Curated YouTube videos for your space |
| Tools · Idea Timeline | Original → improved evolution |

## Smart Validation Report sections

1. **Idea Summary** — Executive overview
2. **Market Opportunity** — TAM, demand signals, target persona
3. **Competitor Analysis** — With proof links
4. **Gap Opportunities** — What's missing in the market
5. **Risk Analysis** — Key risks + mitigations
6. **Revenue Model** — How this makes money
7. **Final Decision** — Build / Pivot / Drop + rationale

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env — at minimum set:
#   GEMINI_API_KEY=...     (required, free at https://aistudio.google.com/app/apikey)
#   MONGODB_URI=...        (required)
#   JWT_SECRET=...         (required)
#   YOUTUBE_API_KEY=...    (optional — enables Learning Hub videos)
#   SERPAPI_KEY=...        (optional — enables live competitor search)
npm start
```

Backend runs on **http://localhost:5000**.

If port 5000 is already in use on Windows, find & kill the process:
```
netstat -ano | findstr :5000
taskkill /PID <pid> /F
```

### 2. Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs on **http://localhost:3000** and proxies API calls to the backend.

## Downloading the report

1. Submit an idea on **Validate Idea**.
2. After analysis, open **Report → Validation Report** in the sidebar (or click "Download Report" on the Results page).
3. Click **Download Report (.docx)** — a styled Word document is generated entirely in the browser, no server round-trip.

The file includes: cover page, KPI table (score + decision), all six sections, final decision banner, and an optional pitch-deck appendix.

## Tech stack

- **Frontend** — React 18, Recharts, `docx` (client-side Word generation), `file-saver`
- **Backend** — Node + Express, Mongoose, JWT auth
- **AI** — Google Gemini (with multi-model fallback chain)
- **Optional** — YouTube Data API v3, SerpAPI

## Troubleshooting

- *"No Gemini model responded successfully"* — your API key is missing or invalid. Get a free key at <https://aistudio.google.com/app/apikey> and put it in `backend/.env`.
- *"Failed to parse Gemini JSON"* — the backend already auto-repairs truncated JSON and retries with two split calls. If you still see this, the key is rate-limited; wait 60 seconds and try again.
- *"No videos found"* — add `YOUTUBE_API_KEY` to `.env` to enable the Learning Hub.
