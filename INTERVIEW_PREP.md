# ResearchGenie - Interview Preparation Guide

## PROJECT OVERVIEW

**ResearchGenie** is an AI-powered research paper analysis platform that automates document processing with intelligent summaries, research gap identification, flashcards, quizzes, mind maps, citations, and semantic search using RAG and LLMs.


ResearchGenie mein: Paper upload karte ho → system usey chunks mein divide karta hai → har chunk ke embedding (vector) banata hai → jab tum koi question likho, uska bhi embedding banata hai → FAISS use karke similar vectors dhundta hai → matching paragraphs de deta hai.




**GitHub:** https://github.com/Ishita-rastogi06/ResearchGENIE

---

## PART 1: CORE CONCEPTS EXPLAINED

### 1. RAG (Retrieval-Augmented Generation)

**What is it?**
RAG combines information retrieval with language generation. Instead of LLM relying only on training data, it fetches relevant information from documents first, then generates answers based on that retrieved information.

**3-Step Process:**
1. **Retrieve:** Find relevant chunks/paragraphs from the paper using semantic similarity
2. **Augment:** Pass the retrieved content as context to the LLM
3. **Generate:** LLM generates answer based on the provided context

**Why use it?**
- Answers are grounded in actual document content (no hallucinations)
- Works with new/unseen documents
- More accurate and factual responses
- Better for domain-specific information

### 2. Semantic Search

**What is it?**
Search based on **meaning**, not keyword matching. Uses embeddings (vector representations) to understand context.

**Keyword Search vs Semantic Search:**
- **Keyword:** "attention mechanism" → only exact matches
- **Semantic:** "How does model focus on data?" → understands attention mechanisms

**How it works:**
1. Text → Embedding model → Dense vector (384 dimensions)
2. Query → Same embedding model → Dense vector
3. Calculate similarity (cosine distance)
4. Return most similar chunks

### 3. Vector Embeddings

**What are they?**
Mathematical representations of text as arrays of numbers. Similar meanings = similar vectors.

**Example:**
```
Text: "The attention mechanism weights tokens"
→ 384-dimensional vector: [0.234, -0.891, 0.456, ...]
```

### 4. FAISS (Facebook AI Similarity Search)

**What is it?**
Optimized library for efficient similarity search in high-dimensional spaces.

**Why use it?**
- Linear search = too slow for large datasets
- FAISS uses indexing for O(log n) performance
- Can handle millions of vectors
- Memory efficient

---

## PART 2: TECH STACK DEEP DIVE

### Frontend: React 19 + Vite + TailwindCSS
- React: Component-based UI with hooks
- Vite: Fast build tool with HMR
- TailwindCSS: Utility-first styling

### Backend: FastAPI + Python
- Modern async web framework
- Auto-generated docs at /docs
- Type hints for validation
- 3x faster than Flask

### Database: PostgreSQL
- ACID compliance
- Handles relationships (users ↔ papers)
- Complex queries support
- More reliable than SQLite

### AI Stack: LangChain + Groq + Sentence-Transformers
- **LangChain:** Framework for LLM applications
- **Groq:** Fast inference platform for LLaMA 3.3
- **Sentence-Transformers:** Local embedding generation (384-dim)

### PDF Processing: PyMuPDF
- Extracts text from PDFs
- Preserves structure
- Handles various formats

### Containerization: Docker
- Packages entire application
- Works same everywhere
- Easy deployment

---

## PART 3: PREDICTED INTERVIEW QUESTIONS & ANSWERS

### Q1: Explain how RAG works in ResearchGenie

**Answer:**
RAG has 3 steps:

1. **Retrieve:** When user asks about a paper, system uses FAISS to search semantic embeddings and retrieves top-5 similar chunks

2. **Augment:** Those chunks are combined with user query and passed as context to Groq's LLaMA 3.3

3. **Generate:** LLM reads paper content and generates accurate answer based only on what's in the paper

**Benefits:**
- Factually grounded (can cite sources)
- Handles new documents
- No hallucinations

---

### Q2: How does semantic search differ from keyword search?

**Answer:**
- **Keyword:** "attention" matches only exact phrase
- **Semantic:** Understands "how transformers focus" = "attention"

**Process:**
1. Convert text to 384-dim embeddings
2. Calculate cosine similarity between vectors
3. Return most similar chunks

**Why I chose it:**
- Handles synonyms and related concepts
- Better user experience
- Flexible queries

---

### Q3: What is FAISS and why is it important?

**Answer:**
FAISS (Facebook AI Similarity Search) finds similar high-dimensional vectors efficiently.

**Problem without FAISS:**
- 500 chunks = linear search = O(n) = slow
- Checking all vectors takes too long

**FAISS solution:**
- Uses index structures for O(log n) performance
- Handles millions of vectors
- Returns top-K similar vectors in milliseconds

**In my project:**
```
Paper uploaded
→ Generate embeddings for each chunk
→ Store in FAISS index
→ User query converted to embedding
→ FAISS returns top-5 similar chunks
→ Pass to LLM for answer
```

---

### Q4: Walk me through PDF upload flow

**Answer:**
```
1. Frontend: User uploads PDF
2. PyMuPDF: Extract text from PDF
3. Chunking: Split into semantic segments (~500 chars)
4. Embeddings: Generate 384-dim vectors for each chunk
5. FAISS: Store vectors in searchable index
6. PostgreSQL: Store paper metadata
7. Frontend: Display success message
```

---

### Q5: How does quiz generation work?

**Answer:**
```
1. RETRIEVE: FAISS finds 10-15 diverse chunks
2. AUGMENT: Chunks + prompt sent to Groq:
   "Generate 5 MCQs based on this content"
3. GENERATE: LLM returns JSON with questions
4. Store in PostgreSQL
5. Return to frontend with hidden answers
6. User clicks option → shows correct answer in green
```

---

### Q6: Database schema explanation

**Answer:**
```sql
Users Table:
- id, email, password_hash
- llm_provider, embedding_model

Papers Table:
- id, user_id (FK), title, authors, year
- pages, abstract, file_path, faiss_index_path

Analysis Results Table:
- id, paper_id (FK), result_type
- result_content (JSON)

Relationships:
- 1 user → many papers
- 1 paper → many analysis results
```

---

### Q7: How did you handle the Groq rate limit?

**Answer:**
Groq free tier: 100K tokens/day limit

**Solutions:**
1. **Caching:** Store frequent analysis results
2. **Token budgeting:** Shorter prompts
3. **Deduplication:** Don't regenerate if exists
4. **Alternative providers:** Fallback to OpenAI
5. **Pagination:** Generate quiz in batches

---

### Q8: How does authentication work?

**Answer:**
```
JWT Flow:

REGISTRATION:
- Hash password with bcrypt
- Store user in DB
- Generate JWT token
- Return token to frontend

LOGIN:
- Verify password hash
- Generate JWT with 7-day expiration
- Return token

PROTECTED REQUESTS:
- Frontend includes: "Authorization: Bearer {token}"
- Backend verifies signature
- Decode user_id from token
- Process request
```

---

### Q9: How would you scale to 1 million papers?

**Answer:**
**Bottlenecks → Solutions:**

1. **Embeddings:** Use Celery for async processing
2. **FAISS:** GPU acceleration or Pinecone (serverless)
3. **Database:** Add indexes, partitioning by date
4. **Caching:** Redis for frequent summaries
5. **LLM:** Batch requests, use cheaper models
6. **Prompt caching:** Reuse similar requests

---

### Q10: Challenge you faced and solution

**Answer:**
**Challenge:** Quiz correct answer showed before clicking

**Problem:** 
```jsx
// Checked isCorrect immediately
backgroundColor: isCorrect ? G : ...
```

**Solution:**
```jsx
// Check both conditions
backgroundColor: sel !== null && isCorrect ? G : ...
// Only show green when clicked AND correct
```

**Lesson:** Debug state management carefully

---

### Q11: What would you improve?

**Answer:**
1. **Advanced RAG:** Reranking, multi-hop retrieval
2. **LLM Optimization:** Fine-tuning, chain-of-thought
3. **UX:** Real-time streaming, dark mode
4. **Performance:** Redis caching, GPU acceleration
5. **Features:** Recommendations, citation graphs, multi-language

---

## QUICK FIRE Q&A

**Q: Dense vs Sparse vectors?**
- Dense: 384 dims, all matter (embeddings)
- Sparse: Millions dims, mostly zeros (TF-IDF)

**Q: PostgreSQL vs MongoDB?**
- Need ACID compliance
- Structured data with relationships
- Complex queries needed

**Q: How async/await works in FastAPI?**
- Handles 1000s concurrent requests
- Perfect for I/O-bound operations

**Q: Embeddings vs one-hot encoding?**
- One-hot: discrete [0,0,1,0]
- Embeddings: continuous [0.234, -0.891, ...]

---

## INTERVIEW TIPS

✅ **DO:**
- Speak confidently about RAG and embeddings
- Relate everything to ResearchGenie
- Explain architectural decisions
- Show understanding of trade-offs

❌ **DON'T:**
- Pretend to know something you don't
- Go too deep into math
- Forget Docker/deployment
- Ignore production concerns

**Key talking points:**
1. RAG grounds LLM in actual documents
2. FAISS enables million-scale search
3. Semantic embeddings > keywords
4. Docker ensures reproducibility
5. PostgreSQL ensures data integrity
6. Groq provides cost-effective inference

Good luck! 🚀
