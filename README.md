<div align="center">

# 📚 ResearchGenie

### AI-Powered Research Paper Analysis Platform

Upload any research paper and instantly get an AI-generated summary, identified research gaps, flashcards, quizzes, mind maps, citations, semantic search, and side-by-side paper comparison — all grounded in the actual document through a FAISS vector index.


</div>

---

## ✨ Overview

**ResearchGenie** turns dense academic PDFs into something you can actually study from. Instead of skimming a 20-page paper cold, you get an AI layer on top of it — a summary broken into the sections that matter, the gaps the authors didn't address, auto-generated flashcards and quizzes to test your understanding, a visual mind map of the paper's structure, and semantic search so you can ask "what did they say about X" and get an answer grounded in the real text, not a hallucination.

Every feature is backed by a **FAISS vector index** built from the paper itself, so answers are retrieved from — and cited to — the actual document.

## 🚀 Features

| Feature | Description |
|---|---|
| 📝 **Summary** | Structured breakdown — abstract, contributions, methodology, results, limitations, future work |
| 🔍 **Research Gaps** | AI-identified limitations and open questions the paper leaves unresolved |
| 🎴 **Flashcards** | Auto-generated flip cards covering key terms and concepts |
| ❓ **Quiz** | Multiple-choice questions with explanations, expandable in batches of 10 |
| 🧠 **Mind Map** | Visual tree representation of the paper's structure |
| 📎 **Citations** | Instantly generate formatted citations |
| 🔎 **Semantic Search** | Vector-similarity search within a single paper |
| ⚖️ **Compare** | Side-by-side AI comparison of two papers |

## 🏗️ Tech Stack

**Frontend**
- React 19 + React Router
- Vite
- Tailwind CSS

**Backend**
- FastAPI
- SQLAlchemy
- PostgreSQL

**AI / Retrieval**
- LangChain + Groq (LLaMA 3.3)
- sentence-transformers embeddings
- FAISS vector store

## 📁 Project Structure

```
ResearchGenie/
├── backend/                 # FastAPI application
│   └── app/
│       ├── ai/               # Summary / quiz / flashcard generation, embeddings
│       ├── routers/          # API routes (auth, papers, analysis, dashboard, notes)
│       ├── models.py         # SQLAlchemy models
│       └── schemas.py        # Pydantic schemas
├── frontend/                # React (Vite) application
│   └── src/
│       ├── pages/             # Route-level pages
│       ├── components/        # Reusable UI components
│       ├── context/           # Auth / theme context providers
│       └── layouts/           # Dashboard shell / sidebar
└── docker-compose.yml
```

## 🔧 Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+ (or use the provided `docker-compose.yml`)
- A free [Groq API key](https://console.groq.com)

## ⚡ Getting Started

### First-Time Setup

```bash
docker compose up --build -d
docker stop researchgenie_frontend
```

Start the frontend:

```bash
cd frontend
npm install
npm run dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:8000 |

### Running It Again

```bash
docker compose up -d
docker stop researchgenie_frontend
```

```bash
cd frontend
npm run dev
```

## 🔐 Environment Variables

Full list in [`backend/.env.example`](backend/.env.example). At minimum:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SECRET_KEY` | Any random string, used to sign JWTs |
| `GROQ_API_KEY` | API key from [console.groq.com](https://console.groq.com) |
| `FRONTEND_URL` | Frontend origin, for CORS (default `http://localhost:5173`) |

## 🗺️ Roadmap

- [ ] Multi-user collaborative notes
- [ ] Export flashcards/quizzes to Anki
- [ ] Support for additional file formats (DOCX, HTML)

## 🤝 Contributing

Contributions, issues, and feature requests are welcome. Feel free to check the [issues page](../../issues).

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">
Built with ❤️ by Ishita
</div>
