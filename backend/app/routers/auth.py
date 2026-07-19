from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=schemas.TokenResponse, status_code=201)
def register(payload: schemas.UserRegister, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = models.User(
        name=payload.name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "user": user}


@router.post("/login", response_model=schemas.TokenResponse)
def login(payload: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "user": user}


@router.get("/me", response_model=schemas.UserOut)
def me(current_user: models.User = Depends(get_current_user)):
    return current_user


@router.put("/profile", response_model=schemas.UserOut)
def update_profile(
    payload: schemas.ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if payload.name is not None:
        current_user.name = payload.name
    if payload.email is not None:
        existing = db.query(models.User).filter(
            models.User.email == payload.email,
            models.User.id != current_user.id,
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")
        current_user.email = payload.email
    if payload.phone is not None:
        current_user.phone = payload.phone
    if payload.gender is not None:
        current_user.gender = payload.gender
    if payload.education is not None:
        current_user.education = payload.education
    if payload.location is not None:
        current_user.location = payload.location
    db.commit()
    db.refresh(current_user)
    return current_user


@router.put("/preferences", response_model=schemas.UserOut)
def update_preferences(
    payload: schemas.PreferencesUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    from app.config import update_runtime_settings

    if payload.llm_provider is not None:
        current_user.llm_provider = payload.llm_provider
    if payload.theme is not None:
        current_user.theme = payload.theme

    # Mutate the live, already-instantiated Settings singleton (not just
    # os.environ, which nothing re-reads after startup) so a provider/key
    # change here takes effect on the very next chat message — no
    # server restart needed.
    update_runtime_settings(
        LLM_PROVIDER=payload.llm_provider,
        GROQ_API_KEY=payload.groq_api_key,
        OPENAI_API_KEY=payload.openai_api_key,
        GOOGLE_API_KEY=payload.google_api_key,
    )

    db.commit()
    db.refresh(current_user)
    return current_user


@router.put("/password")
def update_password(
    payload: schemas.PasswordUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    current_user.hashed_password = hash_password(payload.new_password)
    db.commit()
    return {"message": "Password updated"}
