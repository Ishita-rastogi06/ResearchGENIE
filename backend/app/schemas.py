from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any
from datetime import datetime


# --- Auth ---
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    phone: str = ""
    gender: str = ""
    education: str = ""
    location: str = ""
    llm_provider: str = "groq"
    theme: str = "sage"
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    gender: Optional[str] = None
    education: Optional[str] = None
    location: Optional[str] = None


class PreferencesUpdate(BaseModel):
    llm_provider: Optional[str] = None
    theme: Optional[str] = None
    groq_api_key: Optional[str] = None
    openai_api_key: Optional[str] = None
    google_api_key: Optional[str] = None


class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str


# --- Notes ---
class NoteCreate(BaseModel):
    paper_id: int
    content: str
    highlight: str = ""


class NoteOut(BaseModel):
    id: int
    paper_id: int
    content: str
    highlight: str
    created_at: datetime

    class Config:
        from_attributes = True


# --- Papers ---
class PaperOut(BaseModel):
    id: int
    title: str
    authors: str
    year: str
    pages: int
    chunks: int
    filename: str
    abstract: str
    created_at: datetime

    class Config:
        from_attributes = True


# --- Analysis ---
class SummaryOut(BaseModel):
    abstract: str = ""
    contributions: str = ""
    methodology: str = ""
    results: str = ""
    limitations: str = ""
    future_work: str = ""


class GapsOut(BaseModel):
    gaps: str


class FlashCard(BaseModel):
    term: str
    definition: str


class FlashcardsOut(BaseModel):
    flashcards: List[FlashCard]


class QuizOption(BaseModel):
    question: str
    options: List[str]
    answer: int  # index
    explanation: str


class QuizOut(BaseModel):
    questions: List[QuizOption]


class MindmapNode(BaseModel):
    label: str
    children: Optional[List["MindmapNode"]] = []


MindmapNode.model_rebuild()


class MindmapOut(BaseModel):
    tree: MindmapNode


class CitationsOut(BaseModel):
    apa: str = ""
    mla: str = ""
    ieee: str = ""
    bibtex: str = ""


class SemanticSearchRequest(BaseModel):
    paper_id: int
    query: str
    top_k: int = 5


class SemanticResult(BaseModel):
    text: str
    page: int
    score: float


class SemanticSearchOut(BaseModel):
    results: List[SemanticResult]


# --- Compare ---
class CompareRequest(BaseModel):
    paper_a_id: int
    paper_b_id: int


class TableRow(BaseModel):
    feature: str
    paper_a: str
    paper_b: str


class CompareOut(BaseModel):
    table: List[TableRow]
    analysis: str
    paper_a_verdict: Optional[Any] = None
    paper_b_verdict: Optional[Any] = None


# --- Dashboard ---
class DashboardStats(BaseModel):
    papers: int
    questions: int
    summaries: int
    comparisons: int
