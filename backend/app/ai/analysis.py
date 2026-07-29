"""AI analysis functions — summary, gaps, flashcards, quiz, mindmap, citations, compare."""
import json
import logging
import re
import time
from langchain.schema import HumanMessage, SystemMessage
from app.ai.llm import get_llm
from app.ai.embeddings import search_faiss

logger = logging.getLogger(__name__)


# Groq includes a reset hint such as "Please try again in 2.3s" in 429
# responses.  Keep this parser provider-agnostic so importing this module does
# not require the optional ``groq`` package directly.
_RATE_LIMIT_RETRY_ATTEMPTS = 4
_RATE_LIMIT_BUFFER_SECONDS = 0.5
_RATE_LIMIT_WAIT_RE = re.compile(
    r"please\s+try\s+again\s+in\s+([0-9]+(?:\.[0-9]+)?)\s*s(?:econds?)?",
    re.IGNORECASE,
)


def _is_rate_limit_error(exc: Exception) -> bool:
    """Return True only for an HTTP 429/rate-limit exception."""
    status_code = getattr(exc, "status_code", None)
    if status_code == 429 or str(status_code) == "429":
        return True

    # SDKs may wrap the HTTP response but retain the exception class or code.
    class_names = {cls.__name__.lower() for cls in type(exc).__mro__}
    if "ratelimiterror" in class_names:
        return True

    error = getattr(exc, "error", None)
    code = getattr(error, "code", None) if error is not None else None
    if code is None:
        code = getattr(exc, "code", None)
    return isinstance(code, str) and code.lower() in {
        "rate_limit_exceeded",
        "rate_limit_error",
        "ratelimiterror",
    }


def _rate_limit_delay_seconds(exc: Exception) -> float:
    """Use Groq's suggested wait when available, with a small safety margin."""
    match = _RATE_LIMIT_WAIT_RE.search(str(exc))
    if match:
        try:
            return max(0.0, float(match.group(1))) + _RATE_LIMIT_BUFFER_SECONDS
        except ValueError:
            # Defensive fallback if an SDK supplies an unusual numeric string.
            pass
    return 1.0 + _RATE_LIMIT_BUFFER_SECONDS


def _llm_json(prompt: str, system: str = "", provider: str | None = None) -> str:
    """Invoke the configured LLM, retrying only transient rate-limit responses.

    Non-429 provider failures deliberately propagate to callers.  This avoids
    treating outages, auth errors, and malformed provider responses as empty
    quiz/flashcard output.
    """
    llm = get_llm(provider_override=provider)
    messages = []
    if system:
        messages.append(SystemMessage(content=system))
    messages.append(HumanMessage(content=prompt))

    for attempt in range(1, _RATE_LIMIT_RETRY_ATTEMPTS + 1):
        try:
            resp = llm.invoke(messages)
            return resp.content if hasattr(resp, "content") else str(resp)
        except Exception as exc:
            if not _is_rate_limit_error(exc) or attempt == _RATE_LIMIT_RETRY_ATTEMPTS:
                raise
            delay = _rate_limit_delay_seconds(exc)
            logger.warning(
                "LLM rate limited; retrying in %.2fs (attempt %s/%s)",
                delay,
                attempt + 1,
                _RATE_LIMIT_RETRY_ATTEMPTS,
            )
            time.sleep(delay)

    # The loop either returns or raises; retained for type checkers.
    raise RuntimeError("LLM invocation retry loop exited unexpectedly")


def _get_paper_context(paper_id: int, queries: list[str], top_k: int = 3) -> str:
    """Fetch relevant paper chunks without duplicates."""
    all_chunks = []
    seen = set()
    for q in queries:
        results = search_faiss(paper_id, q, top_k=top_k)
        for r in results:
            if r["text"] not in seen:
                seen.add(r["text"])
                all_chunks.append(f"[Page {r['page']}] {r['text'][:400]}")
    return "\n\n".join(all_chunks[:12])


def _clean_json_text(raw: str) -> str:
    """Remove common LLM wrappers before JSON parsing."""
    raw = str(raw or "").strip()
    raw = re.sub(r"^```(?:json)?\s*", "", raw, flags=re.IGNORECASE)
    raw = re.sub(r"\s*```$", "", raw)
    return raw.strip()


def _extract_json_value(raw: str, expected_type: type) -> list | dict | None:
    """Extract JSON even when the model adds text before or after it."""
    cleaned = _clean_json_text(raw)
    decoder = json.JSONDecoder()

    for start_char in ("[", "{"):
        start = cleaned.find(start_char)
        while start != -1:
            try:
                value, _ = decoder.raw_decode(cleaned[start:])
                if isinstance(value, expected_type):
                    return value
            except json.JSONDecodeError:
                pass
            start = cleaned.find(start_char, start + 1)

    return None


# ─── Summary ────────────────────────────────────────────────────────────────

def generate_summary(paper_id: int, abstract: str, provider: str | None = None) -> dict:
    context = _get_paper_context(
        paper_id,
        ["introduction methodology results conclusion limitations"],
        top_k=6,
    )

    prompt = f"""Analyze this research paper. Return ONLY a raw JSON object with exactly 6 string keys.

Abstract: {abstract[:800]}

Key content:
{context}

Return this exact JSON (no markdown, no code blocks):
{{
  "abstract": "2-3 sentences on the paper's main idea.",
  "contributions": "- Contribution 1\\n- Contribution 2\\n- Contribution 3",
  "methodology": "2-3 sentences on methods used.",
  "results": "2-3 sentences on key results.",
  "limitations": "- Limitation 1\\n- Limitation 2",
  "future_work": "- Future direction 1\\n- Future direction 2"
}}"""

    raw = _llm_json(prompt, system="Return ONLY valid JSON with 6 string keys. No markdown fences.", provider=provider)
    data = _extract_json_value(raw, dict)
    if data is None:
        data = {
            "abstract": _clean_json_text(raw)[:600] or "Summary not available.",
            "contributions": "",
            "methodology": "",
            "results": "",
            "limitations": "",
            "future_work": "",
        }

    for k in ["abstract", "contributions", "methodology", "results", "limitations", "future_work"]:
        v = data.get(k, "")
        if isinstance(v, list):
            data[k] = "\n".join(f"- {item}" for item in v if item)
        elif isinstance(v, dict):
            data[k] = next((str(x) for x in v.values() if x), "")
        elif not isinstance(v, str):
            data[k] = str(v) if v else ""
    return data


# ─── Research Gaps ───────────────────────────────────────────────────────────

def generate_gaps(paper_id: int, provider: str | None = None) -> str:
    context = _get_paper_context(
        paper_id,
        ["limitations future work conclusion challenges"],
        top_k=5,
    )
    prompt = f"""Research gap analysis for this paper. Use ## headers and - bullets.

Paper content:
{context}

## Existing Work Coverage
(what the paper covers)

## Identified Limitations
- limitation 1
- limitation 2

## Missing Problems
- gap 1
- gap 2

## Potential Research Areas
- direction 1
- direction 2

## Recommended Next Steps
- step 1
- step 2"""

    return _llm_json(prompt, system="Research gap analyst. Use ## headers and - bullets only.", provider=provider)


# ─── Flashcards ─────────────────────────────────────────────────────────────

def _parse_flashcards_json(raw: str) -> list[dict]:
    cards = _extract_json_value(raw, list)
    if not isinstance(cards, list):
        return []

    valid_cards = []
    for card in cards:
        if not isinstance(card, dict):
            continue
        term = str(card.get("term", "")).strip()
        definition = str(card.get("definition", "")).strip()
        if term and definition:
            valid_cards.append({"term": term, "definition": definition})
    return valid_cards


def generate_flashcards(paper_id: int, provider: str | None = None) -> list[dict]:
    context = _get_paper_context(
        paper_id,
        ["key terms definitions concepts methods"],
        top_k=6,
    )
    if not context.strip():
        logger.warning("No FAISS context found for flashcards: paper_id=%s", paper_id)
        return []

    prompt = f"""Generate exactly 10 flashcards from this research paper.

Content:
{context}

Return ONLY a valid JSON array. Do not use markdown or add any text before/after the array:
[
  {{"term": "term", "definition": "one sentence definition"}}
]"""

    collected = []
    seen_terms = set()
    for attempt in range(3):
        raw = _llm_json(prompt, system="Return only a valid JSON array. Never use markdown.", provider=provider)
        cards = _parse_flashcards_json(raw)
        logger.info("Flashcard attempt %s returned %s valid cards for paper_id=%s", attempt + 1, len(cards), paper_id)

        for card in cards:
            key = card["term"].lower()
            if key not in seen_terms:
                seen_terms.add(key)
                collected.append(card)
            if len(collected) >= 10:
                return collected[:10]

    logger.warning("Only %s flashcards generated for paper_id=%s", len(collected), paper_id)
    return collected


# ─── Quiz ────────────────────────────────────────────────────────────────────

def _parse_quiz_json(raw: str) -> list[dict]:
    """Parse a quiz JSON array even if the model adds text around the array."""
    questions = _extract_json_value(raw, list)
    if not isinstance(questions, list):
        return []

    valid_questions = []
    for q in questions:
        if not isinstance(q, dict):
            continue
        question = str(q.get("question", "")).strip()
        options = q.get("options")
        answer = q.get("answer")
        explanation = str(q.get("explanation", "")).strip()

        if (
            question
            and isinstance(options, list)
            and len(options) == 4
            and all(str(option).strip() for option in options)
            and isinstance(answer, int)
            and 0 <= answer < len(options)
        ):
            valid_questions.append({
                "question": question,
                "options": [str(option).strip() for option in options],
                "answer": answer,
                "explanation": explanation,
            })
    return valid_questions


def _generate_quiz_batch(context: str, count: int, avoid_questions: list[str], provider: str | None) -> list[dict]:
    avoid_clause = ""
    if avoid_questions:
        sample = "\n".join(f"- {q}" for q in avoid_questions[:15])
        avoid_clause = f"\nDo NOT repeat or closely rephrase these already-used questions:\n{sample}\n"

    prompt = f"""Generate exactly {count} multiple-choice questions about this research paper.
{avoid_clause}
Content:
{context}

Return ONLY one valid JSON array. No markdown, no explanation outside JSON.
Every item must have exactly four options and a 0-based answer index:
[
  {{
    "question": "question text",
    "options": ["A", "B", "C", "D"],
    "answer": 0,
    "explanation": "brief explanation"
  }}
]"""

    raw = _llm_json(prompt, system="Quiz generator. Return only valid JSON array; no markdown.", provider=provider)
    return _parse_quiz_json(raw)


def _generate_quiz_guaranteed(context: str, count: int, provider: str | None, max_attempts: int = 4) -> list[dict]:
    collected: list[dict] = []
    seen_questions: set[str] = set()

    for attempt in range(max_attempts):
        remaining = count - len(collected)
        if remaining <= 0:
            break

        batch = _generate_quiz_batch(
            context,
            remaining,
            avoid_questions=[q["question"] for q in collected],
            provider=provider,
        )
        logger.info("Quiz attempt %s returned %s valid questions", attempt + 1, len(batch))

        for q in batch:
            key = q["question"].strip().lower()
            if key in seen_questions:
                continue
            seen_questions.add(key)
            collected.append(q)
            if len(collected) >= count:
                break

    if len(collected) < count:
        logger.warning("Only %s of %s quiz questions generated", len(collected), count)
    return collected[:count]


def generate_quiz(paper_id: int, provider: str | None = None) -> list[dict]:
    context = _get_paper_context(
        paper_id,
        ["main contribution method results dataset"],
        top_k=6,
    )
    if not context.strip():
        logger.warning("No FAISS context found for quiz: paper_id=%s", paper_id)
        return []
    return _generate_quiz_guaranteed(context, count=10, provider=provider)


def generate_more_quiz(paper_id: int, existing_count: int = 10, count: int = 10, provider: str | None = None) -> list[dict]:
    context = _get_paper_context(
        paper_id,
        ["methodology findings conclusion background"],
        top_k=5,
    )
    if not context.strip():
        logger.warning("No FAISS context found for additional quiz: paper_id=%s", paper_id)
        return []
    return _generate_quiz_guaranteed(context, count=count, provider=provider)


# ─── Mindmap ─────────────────────────────────────────────────────────────────

def generate_mindmap(paper_id: int, paper_title: str, provider: str | None = None) -> dict:
    context = _get_paper_context(
        paper_id,
        ["problem method results future work"],
        top_k=4,
    )
    prompt = f"""Mind map for "{paper_title}".

Content:
{context}

Return JSON tree ONLY:
{{
  "label": "{paper_title}",
  "children": [
    {{"label": "Problem", "children": [{{"label": "specific problem", "children": []}}]}},
    {{"label": "Method", "children": [{{"label": "technique used", "children": []}}]}},
    {{"label": "Results", "children": [{{"label": "key finding", "children": []}}]}},
    {{"label": "Future Work", "children": [{{"label": "next direction", "children": []}}]}}
  ]
}}"""

    raw = _llm_json(prompt, system="Return only valid JSON tree.", provider=provider)
    return _extract_json_value(raw, dict) or {
        "label": paper_title,
        "children": [{"label": "Unable to generate", "children": []}],
    }


# ─── Citations ───────────────────────────────────────────────────────────────

def generate_citations(title: str, authors: str, year: str, provider: str | None = None) -> dict:
    year_display = year if year else "n.d."
    prompt = f"""Format the following paper details into citation styles.

Title: {title}
Authors: {authors}
Year: {year_display}

Rules:
- Use ONLY the fields given above. Do NOT invent a journal name, conference,
  publisher, volume, issue, page range, or DOI.
- If the year is "n.d.", use that placeholder consistently.

Return JSON ONLY:
{{
  "apa": "APA citation using only the given fields",
  "mla": "MLA citation using only the given fields",
  "ieee": "IEEE citation using only the given fields",
  "bibtex": "@misc{{key, title={{...}}, author={{...}}, year={{{year_display}}}}}"
}}"""

    raw = _llm_json(prompt, system="Citation formatter. Return only valid JSON.", provider=provider)
    return _extract_json_value(raw, dict) or {"apa": "", "mla": "", "ieee": "", "bibtex": ""}


# ─── Compare Papers ─────────────────────────────────────────────────────────

def compare_papers(
    paper_a_id: int,
    paper_b_id: int,
    paper_a_title: str,
    paper_b_title: str,
    provider: str | None = None,
) -> dict:
    context_a = _get_paper_context(paper_a_id, ["dataset model accuracy method results"], top_k=4)
    context_b = _get_paper_context(paper_b_id, ["dataset model accuracy method results"], top_k=4)

    prompt = f"""Compare these two papers.

Paper A: {paper_a_title}
{context_a}

Paper B: {paper_b_title}
{context_b}

Return JSON ONLY:
{{
  "table": [
    {{"feature": "Dataset", "paper_a": "...", "paper_b": "..."}},
    {{"feature": "Model", "paper_a": "...", "paper_b": "..."}},
    {{"feature": "Performance", "paper_a": "...", "paper_b": "..."}},
    {{"feature": "Method", "paper_a": "...", "paper_b": "..."}},
    {{"feature": "Strengths", "paper_a": "...", "paper_b": "..."}},
    {{"feature": "Weaknesses", "paper_a": "...", "paper_b": "..."}}
  ],
  "analysis": "2-3 paragraph comparison",
  "paper_a_verdict": {{"winner": false, "summary": "one sentence"}},
  "paper_b_verdict": {{"winner": true, "summary": "one sentence"}}
}}"""

    raw = _llm_json(prompt, system="Comparative analyst. Return only valid JSON.", provider=provider)
    return _extract_json_value(raw, dict) or {
        "table": [],
        "analysis": "Comparison could not be generated.",
        "paper_a_verdict": None,
        "paper_b_verdict": None,
    }
