from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app import models
from app.ai import analysis as ai
from app.auth import get_current_user
from app.database import get_db

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatRequest(BaseModel):
    paper_id: int
    message: str = Field(..., min_length=1, max_length=4000)


class ChatResponse(BaseModel):
    answer: str
    paper_id: int
    paper_title: str


def _get_owned_paper(
    paper_id: int,
    current_user: models.User,
    db: Session,
) -> models.Paper:
    paper = (
        db.query(models.Paper)
        .filter(
            models.Paper.id == paper_id,
            models.Paper.user_id == current_user.id,
        )
        .first()
    )

    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")

    return paper


@router.post("", response_model=ChatResponse)
def chat_with_paper(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    paper = _get_owned_paper(payload.paper_id, current_user, db)

    if not paper.faiss_index_path or paper.chunks <= 0:
        raise HTTPException(
            status_code=400,
            detail=(
                "This paper has no searchable content yet. "
                "Please upload a readable PDF and try again."
            ),
        )

    question = payload.message.strip()

    # User ke question ke saath paper ke important sections ko bhi search karo.
    # Isse broad questions, jaise "summarize this paper", "key findings",
    # "methodology", etc. ke liye useful chunks milte hain.
    retrieval_queries = [
        question,
        "abstract executive summary overview main contribution key findings",
        "introduction research objective research question motivation",
        "methodology methods study design dataset data analysis",
        "results findings discussion conclusion limitations future work",
    ]

    context = ai._get_paper_context(
        paper.id,
        retrieval_queries,
        top_k=12,
    )

    if not context or not context.strip():
        raise HTTPException(
            status_code=404,
            detail=(
                "I could not find readable content in this selected document. "
                "Please upload a text-readable research paper and try again."
            ),
        )

    prompt = f"""You are answering a question about one uploaded research paper.

Use ONLY the supplied excerpts from that paper.
Do not use outside knowledge.
Do not invent facts, results, citations, or explanations.

Paper title: {paper.title}

Paper excerpts:
{context}

User question:
{question}

Instructions:
- Answer the user's question directly first.
- Then include useful supporting details from the excerpts when available.
- For broad questions such as summary, main contribution, methodology,
  findings, limitations, or conclusion, combine relevant excerpts into a
  clear answer.
- Ignore administrative material such as emails, forms, signatures,
  tables of contents, acknowledgements, and appendices unless the user
  explicitly asks about them.
- If the retrieved text contains only administrative material, say that
  the uploaded document does not contain enough research-paper text to
  answer the question.
- If the excerpts genuinely do not support an answer, say exactly:
  "I couldn't find enough support for that answer in the selected paper."
- Mention page numbers only when they are available in the supplied excerpts.
- Be helpful, concise, and use simple language.
"""

    try:
        answer = ai._llm_json(
            prompt,
            system=(
                "You are a research-paper assistant. "
                "Answer only using the supplied excerpts from the selected paper. "
                "Never use outside knowledge or make up information."
            ),
            provider=current_user.llm_provider,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail="The AI service is temporarily unavailable. Please try again shortly.",
        ) from exc

    answer_text = str(answer).strip()

    if not answer_text:
        answer_text = (
            "I couldn't generate an answer from the selected paper. "
            "Please try asking the question again."
        )

    return {
        "answer": answer_text,
        "paper_id": paper.id,
        "paper_title": paper.title,
    }