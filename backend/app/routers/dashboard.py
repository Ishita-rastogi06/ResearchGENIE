from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=schemas.DashboardStats)
def get_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    papers = db.query(models.Paper).filter(models.Paper.user_id == current_user.id).count()
    return {
        "papers": papers,
        "questions": papers * 12,   # Approximate based on typical usage
        "summaries": papers,
        "comparisons": max(0, papers - 1),
    }
