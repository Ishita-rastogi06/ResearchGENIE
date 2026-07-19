"""PDF text extraction and chunking using PyMuPDF."""
import re
import fitz  # PyMuPDF


def extract_text_by_page(filepath: str) -> list[dict]:
    """Extract text per page. Returns list of {page, text}."""
    doc = fitz.open(filepath)
    pages = []
    for i, page in enumerate(doc):
        text = page.get_text("text")
        if text.strip():
            pages.append({"page": i + 1, "text": text.strip()})
    doc.close()
    return pages


def extract_metadata(filepath: str) -> dict:
    """Extract title, author, year, page count from PDF."""
    doc = fitz.open(filepath)
    meta = doc.metadata or {}
    page_count = doc.page_count

    # Attempt to extract title and author from PDF metadata
    title = meta.get("title", "").strip()
    author = meta.get("author", "").strip()

    # Fallback: use first page text heuristics
    if not title or not author:
        first_page = doc[0].get_text("text") if doc.page_count > 0 else ""
        lines = [l.strip() for l in first_page.split("\n") if l.strip()]
        if not title and lines:
            title = lines[0][:200]
        if not author and len(lines) > 1:
            author = lines[1][:200]

    # Year extraction from text
    year = ""
    full_text = " ".join(
        doc[i].get_text("text") for i in range(min(3, doc.page_count))
    )
    year_match = re.search(r"\b(19|20)\d{2}\b", full_text)
    if year_match:
        year = year_match.group(0)

    doc.close()
    return {
        "title": title or "Untitled Paper",
        "authors": author or "Unknown Author",
        "year": year,
        "pages": page_count,
    }


def chunk_text(pages: list[dict], chunk_size: int = 500, overlap: int = 50) -> list[dict]:
    """Split page text into overlapping word-based chunks.

    Returns list of {text, page}.
    """
    chunks = []
    for page_data in pages:
        words = page_data["text"].split()
        page_num = page_data["page"]
        start = 0
        while start < len(words):
            end = min(start + chunk_size, len(words))
            chunk_text = " ".join(words[start:end])
            if chunk_text.strip():
                chunks.append({"text": chunk_text, "page": page_num})
            start += chunk_size - overlap
    return chunks


def get_abstract(filepath: str) -> str:
    """Extract abstract section from PDF."""
    doc = fitz.open(filepath)
    text = ""
    for i in range(min(3, doc.page_count)):
        text += doc[i].get_text("text") + "\n"
    doc.close()

    # Try to find abstract section
    lower = text.lower()
    abstract_start = lower.find("abstract")
    if abstract_start == -1:
        return text[:1000]

    intro_start = lower.find("introduction", abstract_start)
    if intro_start == -1:
        return text[abstract_start: abstract_start + 1500].strip()

    return text[abstract_start:intro_start].strip()[:1500]
