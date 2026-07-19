import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user
from app.config import get_settings
from app.ai.pdf_processor import (
    extract_text_by_page, extract_metadata, chunk_text, get_abstract,
)
from app.ai.embeddings import build_faiss_index

router = APIRouter(prefix="/papers", tags=["papers"])
settings = get_settings()


@router.get("", response_model=list[schemas.PaperOut])
def list_papers(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    papers = (
        db.query(models.Paper)
        .filter(models.Paper.user_id == current_user.id)
        .order_by(models.Paper.created_at.desc())
        .limit(limit)
        .all()
    )
    return papers


@router.get("/{paper_id}", response_model=schemas.PaperOut)
def get_paper(
    paper_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    paper = (
        db.query(models.Paper)
        .filter(models.Paper.id == paper_id, models.Paper.user_id == current_user.id)
        .first()
    )
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    return paper


@router.post("/upload", response_model=schemas.PaperOut, status_code=201)
async def upload_paper(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    # If this user already uploaded a paper with this exact filename, don't
    # create a second entry — just return the existing one. This keeps the
    # "select paper" list (Analysis, Compare, Dashboard, etc.) free of
    # duplicates when someone uploads the same PDF twice.
    existing = (
        db.query(models.Paper)
        .filter(
            models.Paper.user_id == current_user.id,
            models.Paper.filename == file.filename,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=409,
            detail=f"You've already uploaded \"{file.filename}\". Delete the existing copy first if you want to re-upload it.",
        )

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    user_upload_dir = os.path.join(settings.UPLOAD_DIR, str(current_user.id))
    os.makedirs(user_upload_dir, exist_ok=True)

    filepath = os.path.join(user_upload_dir, file.filename)
    with open(filepath, "wb") as f:
        shutil.copyfileobj(file.file, f)

    # Extract metadata and text
    meta = extract_metadata(filepath)
    pages = extract_text_by_page(filepath)
    abstract = get_abstract(filepath)

    # Chunk and embed
    chunks = chunk_text(pages, chunk_size=400, overlap=50)
    index_path = ""
    if chunks:
        # We'll assign a placeholder paper_id; update after DB insert
        paper = models.Paper(
            user_id=current_user.id,
            title=meta["title"],
            authors=meta["authors"],
            year=meta["year"],
            pages=meta["pages"],
            filename=file.filename,
            filepath=filepath,
            chunks=len(chunks),
            abstract=abstract,
        )
        db.add(paper)
        db.commit()
        db.refresh(paper)

        # Build FAISS with actual paper ID
        index_path = build_faiss_index(chunks, paper.id)
        paper.faiss_index_path = index_path
        db.commit()
        db.refresh(paper)
    else:
        paper = models.Paper(
            user_id=current_user.id,
            title=meta["title"],
            authors=meta["authors"],
            year=meta["year"],
            pages=meta["pages"],
            filename=file.filename,
            filepath=filepath,
            chunks=0,
            abstract=abstract,
        )
        db.add(paper)
        db.commit()
        db.refresh(paper)

    return paper


@router.delete("/{paper_id}", status_code=204)
def delete_paper(
    paper_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    paper = (
        db.query(models.Paper)
        .filter(models.Paper.id == paper_id, models.Paper.user_id == current_user.id)
        .first()
    )
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")

    # Remove files
    if os.path.exists(paper.filepath):
        os.remove(paper.filepath)
    if paper.faiss_index_path and os.path.exists(paper.faiss_index_path):
        shutil.rmtree(paper.faiss_index_path, ignore_errors=True)

    db.delete(paper)
    db.commit()
