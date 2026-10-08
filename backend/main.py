"""
main.py — FastAPI Backend for Legal Document Analysis
=======================================================
Returns two layers of data:
  1. User-friendly: document type, summary, parties, key details, clauses
  2. Technical NLP: tokens, POS tags, NER, N-grams, TF-IDF (for syllabus demo)
"""

import io
import os
import json
import string
from collections import Counter

import nltk
import pdfplumber
import spacy
from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from nltk import bigrams, trigrams
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer, PorterStemmer
from nltk.tokenize import word_tokenize
from sklearn.feature_extraction.text import TfidfVectorizer

from google import genai

# ── Load .env ────────────────────────────────────────────────────────────────
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# ── NLTK downloads ───────────────────────────────────────────────────────────
for pkg in ["punkt", "stopwords", "wordnet", "averaged_perceptron_tagger", "punkt_tab"]:
    try:
        nltk.download(pkg, quiet=True)
    except Exception:
        pass

# ── spaCy model ───────────────────────────────────────────────────────────────
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    import subprocess
    subprocess.run(["python", "-m", "spacy", "download", "en_core_web_sm"])
    nlp = spacy.load("en_core_web_sm")

# ── Gemini LLM ───────────────────────────────────────────────────────────────
GEMINI_MODELS = ["gemini-3.8-flash", "gemini-flash-lite-latest", "gemini-3.5-flash"]
if GEMINI_API_KEY:
    gemini_client = genai.Client(api_key=GEMINI_API_KEY)
else:
    gemini_client = None


def call_gemini(prompt: str) -> str:
    """Call Gemini API with automatic model fallback on 503 errors."""
    if not gemini_client:
        raise RuntimeError("LLM not configured")
    last_error = None
    for model_name in GEMINI_MODELS:
        try:
            response = gemini_client.models.generate_content(
                model=model_name,
                contents=prompt,
            )
            return response.text
        except Exception as e:
            last_error = e
            error_str = str(e)
            # If 503 (overloaded) or 429 (rate limit), try next model
            if "503" in error_str or "UNAVAILABLE" in error_str or "429" in error_str:
                print(f"Model {model_name} unavailable, trying next...")
                continue
            # For other errors, raise immediately
            raise
    raise last_error

# ── FastAPI App ───────────────────────────────────────────────────────────────
app = FastAPI(title="Legal Document Analyzer")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ══════════════════════════════════════════════════════════════════════════════
# HELPER: Text Extraction
# ══════════════════════════════════════════════════════════════════════════════

def extract_text(file_bytes: bytes, filename: str) -> str:
    if filename.lower().endswith(".pdf"):
        text = ""
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for i, page in enumerate(pdf.pages):
                page_text = page.extract_text()
                if page_text:
                    text += f"\n--- PAGE {i + 1} ---\n" + page_text + "\n"
        return text
    return file_bytes.decode("utf-8", errors="ignore")


def get_page_count(file_bytes: bytes, filename: str) -> int:
    if filename.lower().endswith(".pdf"):
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            return len(pdf.pages)
    return 1


# ══════════════════════════════════════════════════════════════════════════════
# HELPER: Traditional NLP (Syllabus Unit 2, 3, 4)
# ══════════════════════════════════════════════════════════════════════════════

def run_nlp_pipeline(text: str) -> dict:
    """Run all traditional NLP — tokens, NER, POS, N-grams, TF-IDF."""

    # ── Unit 3: Text Preprocessing ───────────────────────────────────────────
    text_lower = text.lower()
    text_clean = text_lower.translate(str.maketrans("", "", string.punctuation))
    tokens = word_tokenize(text_clean)
    stop_words = set(stopwords.words("english"))
    filtered = [t for t in tokens if t not in stop_words and t.isalpha()]

    stemmer = PorterStemmer()
    lemmatizer = WordNetLemmatizer()
    stemmed = [stemmer.stem(t) for t in filtered[:20]]
    lemmatized = [lemmatizer.lemmatize(t) for t in filtered[:20]]

    # ── Unit 2: N-Grams ──────────────────────────────────────────────────────
    unigram_freq = Counter(filtered).most_common(10)
    bigram_freq  = Counter(list(bigrams(filtered))).most_common(8)
    trigram_freq = Counter(list(trigrams(filtered))).most_common(6)

    # ── Unit 2/4: POS Tagging + NER (spaCy) ──────────────────────────────────
    doc = nlp(text[:3000])
    pos_tags = [
        {"word": t.text, "pos": t.pos_}
        for t in doc if not t.is_space and not t.is_punct
    ][:25]

    allowed = {"PERSON", "ORG", "DATE", "MONEY", "GPE", "LAW"}
    seen = set()
    entities = []
    for ent in doc.ents:
        if ent.label_ in allowed and ent.text.strip() not in seen:
            entities.append({"text": ent.text.strip(), "label": ent.label_})
            seen.add(ent.text.strip())

    # ── Unit 4: TF-IDF ───────────────────────────────────────────────────────
    sentences = [s.strip() for s in text.split(".") if len(s.strip()) > 20]
    keywords = []
    if len(sentences) >= 2:
        try:
            vec = TfidfVectorizer(stop_words="english", max_features=12, ngram_range=(1, 2))
            mat = vec.fit_transform(sentences)
            names = vec.get_feature_names_out()
            scores = mat.mean(axis=0).tolist()[0]
            keywords = sorted(zip(names, scores), key=lambda x: x[1], reverse=True)
            keywords = [{"term": t, "score": round(s, 4)} for t, s in keywords[:10]]
        except Exception:
            pass

    # ── Unit 4: Classification (keyword-based) ───────────────────────────────
    categories = {
        "Employment Agreement": ["employee", "employer", "salary", "designation", "duration", "notice period", "job title"],
        "Rental / Lease Agreement": ["tenant", "landlord", "rent", "deposit", "property", "lease period", "premises"],
        "Non-Disclosure Agreement (NDA)": ["confidential", "disclose", "proprietary", "trade secret", "obligations", "duration"],
        "Service Agreement": ["client", "service provider", "fees", "deliverables", "payment", "termination", "contractor"]
    }
    tl = text.lower()
    scores_map = {k: sum(1 for w in v if w in tl) for k, v in categories.items()}
    best = max(scores_map, key=scores_map.get)
    total = sum(scores_map.values()) or 1
    confidence = round((scores_map[best] / total) * 100, 1)

    return {
        "entity_count":   len(entities),
        "keyword_count":  len(keywords),
        "token_count":    len(filtered),
        "classification": {"type": best, "confidence": confidence},
        "entities":       entities[:20],
        "pos_tags":       pos_tags,
        "keywords":       keywords,
        "ngrams": {
            "unigrams": [{"term": t, "count": c} for t, c in unigram_freq],
            "bigrams":  [{"term": " ".join(b), "count": c} for b, c in bigram_freq],
            "trigrams": [{"term": " ".join(t), "count": c} for t, c in trigram_freq],
        },
        "preprocessing": {
            "stemmed":    stemmed,
            "lemmatized": lemmatized,
        },
    }


# ══════════════════════════════════════════════════════════════════════════════
# HELPER: LLM — User-Friendly Structured Analysis
# ══════════════════════════════════════════════════════════════════════════════


def call_llm_structured(text: str) -> dict:
    """
    Single LLM call that returns a clean JSON with user-friendly info.
    Strictly document-grounded — LLM is told not to invent anything.
    """
    if not gemini_client:
        return _default_llm_response("LLM not configured. Please add your GEMINI_API_KEY in the .env file.")

    prompt = f"""
You are analyzing a legal document for a student project.
Respond ONLY with valid JSON. Do NOT add markdown, code blocks, or explanation.
Use ONLY information found in the document. 
If something is not mentioned, use "Not mentioned".

Identify if the document is one of these types and extract the corresponding fields for "important_details":
1. Employment Agreement: employee, employer, salary, designation, duration, notice period
2. Rental / Lease Agreement: tenant, landlord, rent, deposit, property, lease period
3. Non-Disclosure Agreement (NDA): parties, confidential information, obligations, duration
4. Service Agreement: client, service provider, fees, deliverables, payment, termination

JSON format (fill in from the document):
{{
  "document_type": "e.g. Employment Agreement",
  "parties": ["Name or Organization 1", "Name or Organization 2"],
  "simple_summary": "2-3 sentence plain English summary a non-lawyer can understand.",
  "important_details": {{
    "field_1": "value",
    "field_2": "value",
    "field_3": "value",
    "field_4": "value",
    "field_5": "value",
    "field_6": "value"
  }},
  "important_sections": [
    {{
      "title": "Section name (e.g. Salary & Payment)",
      "what_it_says": "One sentence from the document.",
      "simple_explanation": "What this means in plain words for a normal person.",
      "page": "Page number where this is found based on the --- PAGE X --- markers (e.g., 5). Use 'Unknown' if you cannot determine the page."
    }}
  ]
}}

Replace "field_1", "field_2", etc. with the actual lowercase names of the important fields for the detected document type (e.g., "salary", "notice_period", "tenant", "rent", etc.).


Include up to 5 important sections relevant to this document type.

Document Text:
{text[:3500]}
"""
    try:
        raw = call_gemini(prompt).strip()
        # Strip markdown code fences if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        return json.loads(raw.strip())
    except Exception as e:
        print(f"LLM/JSON error: {e}")
        return _default_llm_response(f"API Error: {str(e)}")


def _default_llm_response(message: str):
    return {
        "document_type": "Unknown",
        "parties": [],
        "simple_summary": message,
        "important_details": {
            "salary": "Not mentioned",
            "duration": "Not mentioned",
            "notice_period": "Not mentioned",
            "location": "Not mentioned",
            "governing_law": "Not mentioned",
        },
        "important_sections": [],
    }


# ══════════════════════════════════════════════════════════════════════════════
# API ENDPOINTS
# ══════════════════════════════════════════════════════════════════════════════

@app.get("/")
def root():
    return {"message": "Legal Document Analyzer API is running."}


@app.post("/analyze")
async def analyze_document(file: UploadFile = File(...)):
    """Main endpoint — returns both user-friendly data and technical NLP data."""
    file_bytes = await file.read()
    filename   = file.filename

    # Extract text
    raw_text   = extract_text(file_bytes, filename)
    page_count = get_page_count(file_bytes, filename)

    if not raw_text.strip():
        return {"error": "Could not extract text from the document."}

    # 1. Traditional NLP pipeline (syllabus concepts)
    nlp_data = run_nlp_pipeline(raw_text)

    # 2. LLM structured analysis (user-friendly)
    llm_data = call_llm_structured(raw_text)

    return {
        # File info
        "filename":   filename,
        "page_count": page_count,
        "word_count": len(raw_text.split()),
        "extracted_text": raw_text,

        # User-friendly data (main dashboard)
        "document_type":      llm_data.get("document_type", nlp_data["classification"]["type"]),
        "parties":            llm_data.get("parties", []),
        "simple_summary":     llm_data.get("simple_summary", ""),
        "important_details":  llm_data.get("important_details", {}),
        "important_sections": llm_data.get("important_sections", []),

        # Technical NLP data (hidden panel)
        "nlp": nlp_data,
    }


@app.post("/ask")
async def ask_question(question: str = Form(...), context: str = Form(...)):
    """
    Unit 4 — Question Answering.
    Answers ONLY from the document. Returns plain text answer.
    """
    if not gemini_client:
        return {"answer": "LLM not configured. Please add your GEMINI_API_KEY in the .env file."}

    prompt = f"""
You are a helpful assistant analyzing a legal document for a student.
Answer the question below using the information in the document if applicable.
If the question is not about the document, answer it as a helpful general AI assistant.
Give a clear, simple answer in plain English.

Document:
{context[:3000]}

Question: {question}

Answer:"""
    try:
        answer = call_gemini(prompt)
        return {"answer": answer.strip()}
    except Exception as e:
        return {"answer": f"Error getting answer: {str(e)}"}



import uvicorn
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
