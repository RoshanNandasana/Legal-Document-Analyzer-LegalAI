# Legal Document Analyzer — NLP Mini Project
**CVM University | B.Tech CS&D | NLP Subject**

---

## Project Structure
```
legal_nlp/
├── backend/
│   ├── main.py          ← FastAPI server (all NLP logic lives here)
│   ├── .env             ← Put your Gemini API key here
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx              ← Main app with tabs
│   │   ├── components/
│   │   │   ├── Uploader.jsx     ← File upload area
│   │   │   ├── NLPResults.jsx   ← Shows NER, TF-IDF, N-grams, POS
│   │   │   ├── LLMResults.jsx   ← Shows Gemini AI summary
│   │   │   ├── QAChat.jsx       ← Q&A chat interface
│   │   │   └── Card.jsx         ← Reusable card UI
│   └── package.json
└── README.md
```

---

## Setup Instructions

### Step 1 — Get a FREE Gemini API Key
1. Go to: https://aistudio.google.com/app/apikey
2. Sign in with Google → Create API Key → Copy it
3. Open `backend/.env` and replace `your_gemini_api_key_here` with your key

### Step 2 — Backend Setup
```bash
cd backend
pip install -r requirements.txt
python -m spacy download en_core_web_sm
python main.py
```
Backend runs at: http://localhost:8000

### Step 3 — Frontend Setup (new terminal)
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at: http://localhost:5173

---

## NLP Concepts Used (Syllabus Mapping)

| Feature | NLP Concept | Syllabus Unit |
|---|---|---|
| Text Extraction | NLP Libraries (pdfplumber) | Unit 1 |
| Tokenization, Lemmatization, Stemming | Text Processing | Unit 3 |
| POS Tagging | Parts of Speech Tagging | Unit 2 |
| Named Entity Recognition | NER | Unit 2 & 4 |
| N-Gram Analysis | Unigram, Bigram, Trigram | Unit 2 |
| TF-IDF Keywords | Text Analysis | Unit 4 |
| Document Classification | Text Classification | Unit 4 |
| LLM Summary | Text Summarization | Unit 4 |
| Question Answering | QA | Unit 4 |

---

## Disclaimer
This system is for educational purposes only. It does not provide professional legal advice.
