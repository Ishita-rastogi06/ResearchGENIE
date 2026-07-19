# ResearchGenie

AI-powered research paper analysis platform. Upload a PDF and get an
AI-generated summary, research gaps, flashcards, quizzes, mind maps,
citations, semantic search, and side-by-side paper comparison — all
grounded in the actual document via a FAISS vector index.

## Features

- **Summary** — abstract, contributions, methodology, results, limitations, future work
- **Research Gaps** — AI-identified limitations and open questions
- **Flashcards** — auto-generated key term/concept flip cards
- **Quiz** — multiple-choice questions with explanations, expandable in batches of 10
- **Mind Map** — visual tree of the paper's structure
- **Citations** — formatted citation generation
- **Semantic Search** — vector-similarity search within a paper
- **Compare** — side-by-side AI comparison of two papers

## Tech Stack

- **Frontend**: React 19, React Router, Vite, Tailwind CSS
- **Backend**: FastAPI, SQLAlchemy, PostgreSQL
- **AI**: LangChain + Groq (LLaMA 3.3), sentence-transformers embeddings, FAISS

## Project Structure

```
ResearchGenie/
├── backend/          # FastAPI application
│   └── app/
│       ├── ai/           # summary/quiz/flashcards/etc. generation, embeddings
│       ├── routers/      # API routes (auth, papers, analysis, dashboard, notes)
│       ├── models.py     # SQLAlchemy models
│       └── schemas.py    # Pydantic schemas
├── frontend/         # React (Vite) application
│   └── src/
│       ├── pages/        # Route-level pages
│       ├── components/   # Reusable UI components
│       ├── context/      # Auth / theme context providers
│       └── layouts/      # Dashboard shell / sidebar
└── docker-compose.yml
```

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+ (or use the provided `docker-compose.yml`)
- A free [Groq API key](https://console.groq.com)

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env          # then fill in DATABASE_URL, SECRET_KEY, GROQ_API_KEY

uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000` (interactive docs at `/docs`).

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

### 3. (Optional) Everything with Docker

```bash
docker compose up --build
```

This starts PostgreSQL, the backend, and the frontend together. Make sure
`backend/.env` exists first (see step 1).

## Environment Variables

See [`backend/.env.example`](backend/.env.example) for the full list. At minimum you need:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SECRET_KEY` | Any random string, used to sign JWTs |
| `GROQ_API_KEY` | API key from console.groq.com |
| `FRONTEND_URL` | Frontend origin, for CORS (default `http://localhost:5173`) |

## License

Private project — all rights reserved.
