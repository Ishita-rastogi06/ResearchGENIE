from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user

router = APIRouter(prefix="/notes", tags=["notes"])


def _get_owned_paper(db: Session, paper_id: int, user_id: int) -> models.Paper:
    paper = (
        db.query(models.Paper)
        .filter(models.Paper.id == paper_id, models.Paper.user_id == user_id)
        .first()
    )
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    return paper


@router.get("/paper/{paper_id}", response_model=list[schemas.NoteOut])
def list_notes_for_paper(
    paper_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    _get_owned_paper(db, paper_id, current_user.id)
    return (
        db.query(models.Note)
        .filter(models.Note.paper_id == paper_id, models.Note.user_id == current_user.id)
        .order_by(models.Note.created_at.desc())
        .all()
    )


@router.post("", response_model=schemas.NoteOut, status_code=201)
def create_note(
    payload: schemas.NoteCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    _get_owned_paper(db, payload.paper_id, current_user.id)
    note = models.Note(
        user_id=current_user.id,
        paper_id=payload.paper_id,
        content=payload.content,
        highlight=payload.highlight,
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.put("/{note_id}", response_model=schemas.NoteOut)
def update_note(
    note_id: int,
    payload: schemas.NoteCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    note = (
        db.query(models.Note)
        .filter(models.Note.id == note_id, models.Note.user_id == current_user.id)
        .first()
    )
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    note.content = payload.content
    note.highlight = payload.highlight
    db.commit()
    db.refresh(note)
    return note


@router.delete("/{note_id}", status_code=204)
def delete_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    note = (
        db.query(models.Note)
        .filter(models.Note.id == note_id, models.Note.user_id == current_user.id)
        .first()
    )
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    db.delete(note)
    db.commit()
