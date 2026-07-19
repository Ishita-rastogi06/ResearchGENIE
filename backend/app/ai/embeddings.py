"""Embedding utilities using SentenceTransformers + FAISS."""
import os
import pickle
import numpy as np
from functools import lru_cache
from sentence_transformers import SentenceTransformer
import faiss
from app.config import get_settings

settings = get_settings()


@lru_cache()
def get_embedding_model() -> SentenceTransformer:
    return SentenceTransformer(settings.EMBEDDING_MODEL)


def embed_texts(texts: list[str]) -> np.ndarray:
    model = get_embedding_model()
    return model.encode(texts, show_progress_bar=False, normalize_embeddings=True)


def embed_query(query: str) -> np.ndarray:
    model = get_embedding_model()
    return model.encode([query], normalize_embeddings=True)[0]


def build_faiss_index(chunks: list[dict], paper_id: int) -> str:
    """Build and persist a FAISS index for the given chunks.

    Each chunk dict: {"text": str, "page": int}
    Returns the path to the saved index directory.
    """
    os.makedirs(settings.FAISS_INDEX_DIR, exist_ok=True)
    index_dir = os.path.join(settings.FAISS_INDEX_DIR, str(paper_id))
    os.makedirs(index_dir, exist_ok=True)

    texts = [c["text"] for c in chunks]
    embeddings = embed_texts(texts)

    dim = embeddings.shape[1]
    index = faiss.IndexFlatIP(dim)  # Inner product for cosine similarity (normalized)
    index.add(embeddings.astype("float32"))

    faiss.write_index(index, os.path.join(index_dir, "index.faiss"))
    with open(os.path.join(index_dir, "chunks.pkl"), "wb") as f:
        pickle.dump(chunks, f)

    _invalidate_faiss_cache(paper_id)
    return index_dir


_faiss_cache: dict[int, tuple] = {}  # paper_id -> (index, chunks)


def _invalidate_faiss_cache(paper_id: int):
    _faiss_cache.pop(paper_id, None)


def _load_faiss(paper_id: int):
    """Load (and cache in memory) the FAISS index + chunks for a paper.

    Previously this re-read the index file and un-pickled the chunk list
    from disk on every single chat message — real, avoidable I/O latency
    on every question asked about the same paper.
    """
    if paper_id in _faiss_cache:
        return _faiss_cache[paper_id]

    index_dir = os.path.join(settings.FAISS_INDEX_DIR, str(paper_id))
    index_path = os.path.join(index_dir, "index.faiss")
    chunks_path = os.path.join(index_dir, "chunks.pkl")

    if not os.path.exists(index_path):
        return None

    index = faiss.read_index(index_path)
    with open(chunks_path, "rb") as f:
        chunks = pickle.load(f)

    _faiss_cache[paper_id] = (index, chunks)
    return _faiss_cache[paper_id]


def search_faiss(paper_id: int, query: str, top_k: int = 5) -> list[dict]:
    """Return top_k relevant chunks for query from paper's FAISS index."""
    loaded = _load_faiss(paper_id)
    if loaded is None:
        return []
    index, chunks = loaded

    query_vec = embed_query(query).astype("float32").reshape(1, -1)
    scores, indices = index.search(query_vec, min(top_k, len(chunks)))

    results = []
    for score, idx in zip(scores[0], indices[0]):
        if idx < 0:
            continue
        chunk = chunks[idx]
        results.append({
            "text": chunk["text"],
            "page": chunk.get("page", 0),
            "score": float(score),
        })
    return results
