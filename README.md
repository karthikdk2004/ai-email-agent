# AI Email Agent

A production-grade AI Email Agent built with **LangGraph**, **FastAPI**, **Groq (LLaMA 3.3-70B)**, and **React + Tailwind CSS**.

---

## Architecture

```
  React Frontend (Vite · Tailwind)
  ┌─────────────────────────────────────────────────┐
  │  Inbox  │ Sent Log │ Agent Logs │ Config │ ...  │
  └─────────────────────┬───────────────────────────┘
                        │  REST API (JSON)
                        ▼
  FastAPI Backend (Python · Uvicorn)
  ┌─────────────────────────────────────────────────┐
  │  GET  /emails          POST /process/:id        │
  │  POST /approve/:id     POST /reject/:id         │
  │  POST /edit/:id        GET  /logs               │
  │  GET  /sent            GET  /stats              │
  │  GET  /health          GET  /config             │
  │  POST /config                                   │
  └─────────────────────┬───────────────────────────┘
                        │
                        ▼
  LangGraph Workflow (StateGraph)
  ┌────────────┐   ┌────────────┐
  │ classifier │──►│  priority  │
  │    node    │   │    node    │
  └────────────┘   └─────┬──────┘
                         │
                   ┌─────▼──────┐   ┌────────────┐
                   │   draft    │──►│   memory   │──► END
                   │    node    │   │    node    │
                   └────────────┘   └────────────┘
                         │
                         ▼
                   Groq API (LLaMA 3.3-70B-Versatile)

  JSON data store (flat files · backend/app/data/)
  ┌──────────────────┐  ┌──────────────────┐
  │  memory.json     │  │  sent_log.json   │
  │  agent_logs.json │  │  emails_state.json│
  │  config.json     │  └──────────────────┘
  └──────────────────┘
```

---

## Quick Start (Windows)

### Step 1 — Get a Groq API Key (free)

1. Go to **https://console.groq.com**
2. Sign up / log in
3. Navigate to **API Keys → Create API Key**
4. Copy the key

### Step 2 — Configure the backend

```bat
cd backend
copy .env.example .env
```

Open `backend\.env` in any text editor and set:

```
GROQ_API_KEY=gsk_your_actual_key_here
```

### Step 3 — Start both servers

```bat
start.bat
```

This opens two terminal windows:
- **Backend** → http://localhost:8000 (FastAPI + Uvicorn)
- **Frontend** → http://localhost:5173 (Vite + React)

Wait ~15 seconds for both to be ready, then open http://localhost:5173.

---

## Manual Setup

### Backend

```bash
cd backend

# Create and activate a virtual environment (recommended)
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS / Linux

# Install dependencies
pip install -r requirements.txt

# Copy and edit env file
copy .env.example .env
# Add your GROQ_API_KEY to .env

# Run the API server
uvicorn app.api.main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy env file (edit if backend is not on localhost:8000)
copy .env.example .env

# Start dev server
npm run dev
```

---

## How to Use

1. **Inbox** — 15 pre-loaded realistic emails (state persists across restarts)
2. **Click an email** → Email Detail view
3. **"Process with AI"** — runs the 4-node LangGraph workflow via Groq
4. AI panel shows: **Category**, **Priority Score (1–10)**, **Draft Reply**
5. Choose **Approve & Send**, **Edit** (modify the draft), or **Reject**
6. **Sent Log** — table of all approved replies with real success-rate stats
7. **Agent Logs** — full JSON audit trail per node, filterable by node type
8. **Agent Config** — editable model parameters, saved to localStorage + backend
9. **Knowledge Base** — document list with upload and remove support
10. **Settings** — persistent toggles, real API key status check

---

## API Endpoints

| Method | Path | Description | Rate Limit |
|--------|------|-------------|------------|
| GET | `/` | API root / ping | — |
| GET | `/health` | Health check + API key status | — |
| GET | `/stats` | Aggregate stats (sent, rejected, approval rate) | — |
| GET | `/emails` | List all emails | — |
| GET | `/emails/:id` | Get single email | — |
| POST | `/process/:id` | Run LangGraph pipeline on email | 10/min |
| POST | `/approve/:id` | Approve draft and add to sent log | 30/min |
| POST | `/reject/:id` | Reject email | 30/min |
| POST | `/edit/:id` | Edit draft reply | 30/min |
| GET | `/logs` | Agent decision audit logs | — |
| GET | `/sent` | Sent email log | — |
| GET | `/config` | Get model configuration | — |
| POST | `/config` | Save model configuration | — |

---

## Mock Emails (15 total)

| # | Category | Subject |
|---|----------|---------|
| 1–3 | `urgent` | Server down, contract deadline tomorrow, CPU 98% alert |
| 4–7 | `follow-up` | Job application, integration project, overdue invoice, interview feedback |
| 8–11 | `action-required` | Q4 strategy meeting, NDA signature, security questionnaire, budget approval |
| 12–15 | `newsletter` | TLDR Tech, AI Weekly, Product Hunt, HN Digest |

---

## LangGraph Workflow

```
EmailState
  email_id           : str
  email              : dict   (full email object)
  category           : str    (output of classifier_node)
  priority_score     : int    (output of priority_node, 1–10)
  priority_reasoning : str
  draft_reply        : str    (output of draft_node)
  processing_complete: bool
  logs               : list   (accumulated per-node logs)
```

Each node calls Groq, parses the response, writes to `agent_logs.json`, and returns updated state fields.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `GROQ_API_KEY` | *(required)* | Groq API key from console.groq.com |
| `ALLOWED_ORIGINS` | `http://localhost:5173,...` | Comma-separated CORS allowed origins |

### Frontend (`frontend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:8000` | Backend API base URL |

---

## Deployment

### Backend → Railway

1. Push this repo to GitHub
2. Create a new Railway project → **"Deploy from GitHub repo"**
3. Set the **Root Directory** to `backend/`
4. Add environment variables: `GROQ_API_KEY=your_key` and `ALLOWED_ORIGINS=https://your-frontend.vercel.app`
5. Railway will auto-detect the `Procfile` and deploy

### Frontend → Vercel

1. Import the GitHub repo in Vercel
2. Set **Root Directory** to `frontend/`
3. Add environment variable: `VITE_API_URL=https://your-app.up.railway.app`
4. Deploy

---

## Project Structure

```
email-agent/
├── backend/
│   ├── app/
│   │   ├── agent/
│   │   │   ├── graph.py          # LangGraph StateGraph definition
│   │   │   ├── nodes.py          # 4 LangGraph nodes (Groq calls, singleton LLM)
│   │   │   ├── memory.py         # JSON file helpers
│   │   │   └── mock_data.py      # 15 realistic seed emails
│   │   ├── api/
│   │   │   └── main.py           # FastAPI app + all endpoints + rate limiting
│   │   └── data/
│   │       ├── memory.json       # Sender pattern memory
│   │       ├── sent_log.json     # Approved reply log
│   │       ├── agent_logs.json   # Node decision audit trail
│   │       ├── emails_state.json # Persisted email store
│   │       └── config.json       # Agent model config
│   ├── requirements.txt
│   ├── .env.example
│   └── Procfile                  # Railway deploy command
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Inbox.jsx
│   │   │   ├── EmailDetail.jsx
│   │   │   ├── SentLog.jsx
│   │   │   ├── AgentLogs.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── AgentConfig.jsx
│   │   │   ├── KnowledgeBase.jsx
│   │   │   ├── Settings.jsx
│   │   │   └── ErrorBoundary.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── .env.example
├── start.bat                     # One-click local launcher (Windows)
└── README.md
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| AI Orchestration | LangGraph (StateGraph) |
| LLM | Groq — LLaMA 3.3-70B-Versatile |
| Backend | FastAPI + Uvicorn |
| Rate Limiting | slowapi |
| Frontend | React 18 + Vite 5 |
| Styling | Tailwind CSS 3 |
| Data | JSON flat-files (persisted across restarts) |
| Backend deploy | Railway (Procfile) |
| Frontend deploy | Vercel |
