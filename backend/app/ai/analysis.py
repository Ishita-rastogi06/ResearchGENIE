"""AI analysis functions — summary, gaps, flashcards, quiz, mindmap, citations, compare."""
import json
import re
from langchain.schema import HumanMessage, SystemMessage
from app.ai.llm import get_llm
from app.ai.embeddings import search_faiss


def _llm_json(prompt: str, system: str = "", provider: str | None = None) -> str:
    llm = get_llm(provider_override=provider)
    messages = []
    if system:
        messages.append(SystemMessage(content=system))
    messages.append(HumanMessage(content=prompt))
    resp = llm.invoke(messages)
    return resp.content if hasattr(resp, "content") else str(resp)


def _get_paper_context(paper_id: int, queries: list[str], top_k: int = 3) -> str:
    """Faster context — fewer queries, smaller top_k, capped at 12 chunks."""
    all_chunks = []
    seen = set()
    for q in queries:
        results = search_faiss(paper_id, q, top_k=top_k)
        for r in results:
            if r["text"] not in seen:
                seen.add(r["text"])
                # Truncate each chunk to 400 chars for speed
                all_chunks.append(f"[Page {r['page']}] {r['text'][:400]}")
    return "\n\n".join(all_chunks[:12])


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
    raw = re.sub(r"```json\s*", "", raw)
    raw = re.sub(r"```\s*", "", raw)
    raw = raw.strip()
    brace_idx = raw.find("{")
    if brace_idx > 0:
        raw = raw[brace_idx:]

    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        try:
            data = json.loads(raw.strip('"').replace('\\"', '"'))
        except Exception:
            data = {
                "abstract": raw[:600] if raw else "Summary not available.",
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

def generate_flashcards(paper_id: int, provider: str | None = None) -> list[dict]:
    context = _get_paper_context(
        paper_id,
        ["key terms definitions concepts methods"],
        top_k=6,
    )
    prompt = f"""Generate 10 flashcards from this research paper.

Content:
{context}

Return JSON array ONLY:
[{{"term": "term", "definition": "1 sentence definition"}}, ...]"""

    raw = _llm_json(prompt, system="Return only valid JSON array.", provider=provider)
    raw = re.sub(r"```json\s*", "", raw)
    raw = re.sub(r"```\s*", "", raw)
    raw = raw.strip()

    try:
        cards = json.loads(raw)
        if isinstance(cards, list):
            return [c for c in cards if "term" in c and "definition" in c]
    except Exception:
        pass
    return []


# ─── Quiz ────────────────────────────────────────────────────────────────────

def _parse_quiz_json(raw: str) -> list[dict]:
    """Best-effort parse of a JSON array of quiz questions out of raw LLM text."""
    raw = re.sub(r"```json\s*", "", raw)
    raw = re.sub(r"```\s*", "", raw)
    raw = raw.strip()
    try:
        questions = json.loads(raw)
        if isinstance(questions, list):
            # Keep only well-formed questions (defensive against partial output)
            return [
                q for q in questions
                if isinstance(q, dict) and q.get("question") and isinstance(q.get("options"), list)
            ]
    except Exception:
        pass
    return []


def _generate_quiz_batch(context: str, count: int, avoid_questions: list[str], provider: str | None) -> list[dict]:
    avoid_clause = ""
    if avoid_questions:
        sample = "\n".join(f"- {q}" for q in avoid_questions[:15])
        avoid_clause = f"\nDo NOT repeat or closely rephrase any of these already-used questions:\n{sample}\n"

    prompt = f"""Generate exactly {count} multiple choice questions about this paper.
{avoid_clause}
Content:
{context}

Return JSON array ONLY, with exactly {count} items:
[
  {{
    "question": "question text",
    "options": ["A", "B", "C", "D"],
    "answer": 0,
    "explanation": "brief explanation"
  }}
]
"answer" = 0-based index of correct option. Return ONLY the array with exactly {count} items."""

    raw = _llm_json(prompt, system="Quiz generator. Return only valid JSON array.", provider=provider)
    return _parse_quiz_json(raw)


def _generate_quiz_guaranteed(context: str, count: int, provider: str | None, max_attempts: int = 4) -> list[dict]:
    """Keep asking the LLM for more questions until we have `count` unique
    ones, or we run out of attempts. This is what makes '10 questions every
    time' actually reliable instead of depending on the model complying with
    the prompt on the first try.
    """
    collected: list[dict] = []
    seen_questions: set[str] = set()

    for _ in range(max_attempts):
        remaining = count - len(collected)
        if remaining <= 0:
            break
        batch = _generate_quiz_batch(
            context,
            remaining,
            avoid_questions=[q["question"] for q in collected],
            provider=provider,
        )
        for q in batch:
            key = q["question"].strip().lower()
            if key in seen_questions:
                continue
            seen_questions.add(key)
            collected.append(q)
            if len(collected) >= count:
                break

    return collected[:count]


def generate_quiz(paper_id: int, provider: str | None = None) -> list[dict]:
    context = _get_paper_context(
        paper_id,
        ["main contribution method results dataset"],
        top_k=6,
    )
    return _generate_quiz_guaranteed(context, count=10, provider=provider)


def generate_more_quiz(paper_id: int, existing_count: int = 10, count: int = 10, provider: str | None = None) -> list[dict]:
    """Generate additional quiz questions, guaranteed to return `count` items
    whenever the model is able to produce them."""
    context = _get_paper_context(
        paper_id,
        ["methodology findings conclusion background"],
        top_k=5,
    )
    return _generate_quiz_guaranteed(context, count=count, provider=provider)


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
    raw = re.sub(r"```json\s*", "", raw)
    raw = re.sub(r"```\s*", "", raw)
    raw = raw.strip()

    try:
        tree = json.loads(raw)
        return tree
    except Exception:
        return {"label": paper_title, "children": [{"label": "Unable to generate", "children": []}]}


# ─── Citations ───────────────────────────────────────────────────────────────

def generate_citations(title: str, authors: str, year: str, provider: str | None = None) -> dict:
    year_display = year if year else "n.d."
    prompt = f"""Format the following paper details into citation styles.

Title: {title}
Authors: {authors}
Year: {year_display}

Rules:
- Use ONLY the fields given above. Do NOT invent a journal name, conference,
  publisher, volume, issue, page range, or DOI — none of that was provided,
  and guessing one would make the citation wrong.
- If the year is "n.d.", use that placeholder consistently in the citation
  style's normal convention for an unknown date.
- If "Authors" contains more than one name, format them per each style's
  rules (e.g. "Last, F. M." for APA); if you can't confidently tell where
  one name ends and the next begins, use the string as given rather than
  splitting it incorrectly.

Return JSON ONLY:
{{
  "apa": "APA citation using only the given fields",
  "mla": "MLA citation using only the given fields",
  "ieee": "IEEE citation using only the given fields",
  "bibtex": "@misc{{key, title={{...}}, author={{...}}, year={{{year_display}}}}}"
}}"""

    raw = _llm_json(prompt, system="Citation formatter. Never invent bibliographic details that weren't provided. Return only valid JSON.", provider=provider)
    raw = re.sub(r"```json\s*", "", raw)
    raw = re.sub(r"```\s*", "", raw)
    raw = raw.strip()

    try:
        data = json.loads(raw)
        return data
    except Exception:
        return {"apa": "", "mla": "", "ieee": "", "bibtex": ""}


# ─── Compare Papers ─────────────────────────────────────────────────────────

def compare_papers(
    paper_a_id: int,
    paper_b_id: int,
    paper_a_title: str,
    paper_b_title: str,
    provider: str | None = None,
) -> dict:
    context_a = _get_paper_context(
        paper_a_id,
        ["dataset model accuracy method results"],
        top_k=4,
    )
    context_b = _get_paper_context(
        paper_b_id,
        ["dataset model accuracy method results"],
        top_k=4,
    )

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
    raw = re.sub(r"```json\s*", "", raw)
    raw = re.sub(r"```\s*", "", raw)
    raw = raw.strip()

    try:
        data = json.loads(raw)
        return data
    except Exception:
        return {
            "table": [],
            "analysis": "Comparison could not be generated.",
            "paper_a_verdict": None,
            "paper_b_verdict": None,
        }
