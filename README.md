# Startup Validator 

AI-powered startup idea validation with **Gemini**. Generates a clean, investor-ready Smart Validation Report and lets you **download it as a polished .docx** to send straight to your manager.

## What's new 

- **Downloadable .docx report** — one click on the Validation Report page (or Results page) gives you a professionally formatted Word document with all six sections + final decision + cover page, ready to email or print.
- **Cleaner sidebar layout** — each report area (Validation Report, Execution Blueprint, Competitor Gaps) lives on its own dedicated page. The Results page is now a focused overview that links into them.

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

## Downloading the report

1. Submit an idea on **Validate Idea**.
2. After analysis, open **Report → Validation Report** in the sidebar (or click "Download Report" on the Results page).
3. Click **Download Report (.docx)** — a styled Word document is generated entirely in the browser, no server round-trip.


## Tech stack

- **Frontend** — React 18, Recharts 
- **Backend** — Node + Express, Mongoose, JWT auth
- **AI** — Google Gemini (with multi-model fallback chain)
- **Optional** — YouTube Data API v3, SerpAPI

