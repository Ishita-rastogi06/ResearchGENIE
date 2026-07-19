from sqlalchemy import (
    Column, Integer, String, Text, DateTime, ForeignKey,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    # Extended profile fields
    phone = Column(String(50), default="")
    gender = Column(String(50), default="")
    education = Column(String(255), default="")
    location = Column(String(255), default="")
    # Preferences
    llm_provider = Column(String(50), default="groq")
    theme = Column(String(50), default="sage")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    papers = relationship("Paper", back_populates="owner", cascade="all, delete-orphan")
    notes = relationship("Note", back_populates="user", cascade="all, delete-orphan")


class Paper(Base):
    __tablename__ = "papers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(500), nullable=False)
    authors = Column(String(500), default="")
    year = Column(String(10), default="")
    pages = Column(Integer, default=0)
    filename = Column(String(255), nullable=False)
    filepath = Column(String(500), nullable=False)
    chunks = Column(Integer, default=0)
    faiss_index_path = Column(String(500), default="")
    abstract = Column(Text, default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="papers")
    notes = relationship("Note", back_populates="paper", cascade="all, delete-orphan")


class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    paper_id = Column(Integer, ForeignKey("papers.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    highlight = Column(Text, default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="notes")
    paper = relationship("Paper", back_populates="notes")
