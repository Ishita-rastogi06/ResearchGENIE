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


### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+ (or use the provided `docker-compose.yml`)
- A free [Groq API key](https://console.groq.com)

## 🚀 First Time Setup

```bash
docker compose up --build -d
docker stop researchgenie_frontend
```

### Start Frontend

```bash
cd frontend
npm install
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:8000

---

## 🚀 Running the Project Again

```bash
docker compose up -d
docker stop researchgenie_frontend
```

### Start Frontend

```bash
cd frontend
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:8000

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
