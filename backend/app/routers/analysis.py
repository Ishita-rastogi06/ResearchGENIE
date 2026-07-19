from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user
from app.ai import analysis as ai

router = APIRouter(prefix="/analysis", tags=["analysis"])


def _get_owned_paper(paper_id: int, current_user: models.User, db: Session) -> models.Paper:
    paper = (
        db.query(models.Paper)
        .filter(models.Paper.id == paper_id, models.Paper.user_id == current_user.id)
        .first()
    )
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    return paper


@router.get("/summary/{paper_id}", response_model=schemas.SummaryOut)
def get_summary(
    paper_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    paper = _get_owned_paper(paper_id, current_user, db)
    data = ai.generate_summary(paper_id, paper.abstract, provider=current_user.llm_provider)
    return data


@router.get("/gaps/{paper_id}", response_model=schemas.GapsOut)
def get_gaps(
    paper_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    _get_owned_paper(paper_id, current_user, db)
    gaps = ai.generate_gaps(paper_id, provider=current_user.llm_provider)
    return {"gaps": gaps}


@router.get("/flashcards/{paper_id}", response_model=schemas.FlashcardsOut)
def get_flashcards(
    paper_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    _get_owned_paper(paper_id, current_user, db)
    cards = ai.generate_flashcards(paper_id, provider=current_user.llm_provider)
    return {"flashcards": cards}


@router.get("/quiz/{paper_id}", response_model=schemas.QuizOut)
def get_quiz(
    paper_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    _get_owned_paper(paper_id, current_user, db)
    questions = ai.generate_quiz(paper_id, provider=current_user.llm_provider)
    return {"questions": questions}


@router.get("/quiz-more/{paper_id}", response_model=schemas.QuizOut)
def get_more_quiz(
    paper_id: int,
    existing_count: int = 8,
    count: int = 10,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    _get_owned_paper(paper_id, current_user, db)
    questions = ai.generate_more_quiz(paper_id, existing_count, count=count, provider=current_user.llm_provider)
    return {"questions": questions}


@router.get("/mindmap/{paper_id}", response_model=schemas.MindmapOut)
def get_mindmap(
    paper_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    paper = _get_owned_paper(paper_id, current_user, db)
    tree = ai.generate_mindmap(paper_id, paper.title, provider=current_user.llm_provider)
    return {"tree": tree}


@router.get("/citations/{paper_id}", response_model=schemas.CitationsOut)
def get_citations(
    paper_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    paper = _get_owned_paper(paper_id, current_user, db)
    data = ai.generate_citations(paper.title, paper.authors, paper.year, provider=current_user.llm_provider)
    return data


@router.post("/semantic-search", response_model=schemas.SemanticSearchOut)
def semantic_search(
    payload: schemas.SemanticSearchRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    _get_owned_paper(payload.paper_id, current_user, db)
    from app.ai.embeddings import search_faiss
    results = search_faiss(payload.paper_id, payload.query, top_k=payload.top_k)
    return {"results": results}


@router.post("/compare", response_model=schemas.CompareOut)
def compare(
    payload: schemas.CompareRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    paper_a = _get_owned_paper(payload.paper_a_id, current_user, db)
    paper_b = _get_owned_paper(payload.paper_b_id, current_user, db)

    if paper_a.id == paper_b.id:
        raise HTTPException(status_code=400, detail="Select two different papers")

    data = ai.compare_papers(paper_a.id, paper_b.id, paper_a.title, paper_b.title, provider=current_user.llm_provider)
    return data
