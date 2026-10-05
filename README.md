# Legal Document Analyzer — LegalAI

A full-stack NLP-powered web application for analyzing legal documents (PDF/DOCX), extracting key information, detecting important clauses, and answering questions directly from the document context. Built for the CVM University NLP Mini Project.

Live Link: https://legal-document-analyzer-legal-ai.vercel.app/

---

## What this app does

The system provides an intuitive interface to upload and analyze legal documents using various Natural Language Processing (NLP) techniques:

- **Dashboard & Upload** — Drag and drop legal contracts for instant processing.
- **Document Analysis** — Extracts document type, parties involved, word count, and summarizes the content.
- **Key Clauses & Issues** — Identifies important clauses, categorizing them by priority (Attention, Review, Standard) and highlighting potential liabilities or termination conditions.
- **Keywords & Entities** — Extracts organizations, people, locations, dates, and legal terms using Named Entity Recognition (NER) and TF-IDF analysis.
- **AI Document Q&A** — A chat interface that allows users to ask any questions about the uploaded document, retrieving answers grounded in the text.
- **Original Document Viewer** — Opens the uploaded PDF for cross-referencing AI insights with the source material.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React, Vite, Tailwind CSS |
| **Backend** | Python, FastAPI, Uvicorn |
| **NLP Pipeline** | spaCy, NLTK (Tokenization, Lemmatization, POS, N-Grams), scikit-learn (TF-IDF) |
| **Text Extraction** | pdfplumber |
| **AI/LLM** | Google Gemini (gemini-3.8-flash) |

---

## Project Structure

```text
legal_nlp/
├── backend/          # FastAPI server + NLP Logic
│   ├── main.py       # API endpoints and NLP/LLM processing
│   ├── .env          # Gemini API Key configuration
│   └── requirements.txt
├── frontend/         # React (Vite) app
│   ├── src/
│   │   ├── App.jsx            # Main routing and layout
│   │   ├── index.css          # Tailwind & Custom CSS
│   │   └── components/
│   │       ├── Dashboard.jsx  # Analysis results UI
│   │       ├── QAChat.jsx     # AI Chat Interface
│   │       ├── Sidebar.jsx    # Navigation
│   │       └── Uploader.jsx   # Drag & Drop File Upload
│   └── package.json
└── README.md
```

---

## Run Locally

### Requirements
- **Node.js** (v18 or newer)
- **Python** (3.9 or newer)
- **Gemini API Key** (Get one free from [Google AI Studio](https://aistudio.google.com/app/apikey))

### 1. Clone the repo
```bash
git clone https://github.com/RoshanNandasana/Legal-Document-Analyzer-LegalAI.git
cd Legal-Document-Analyzer-LegalAI
```

### 2. Backend Setup
Open a terminal and navigate to the backend directory:
```bash
cd backend
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

Create a `.env` file in the `backend` folder and add your Gemini API key:
```env
GEMINI_API_KEY=your_actual_api_key_here
```

Start the API:
```bash
python main.py
```
*The backend runs at `http://localhost:8000`.*

### 3. Frontend Setup
Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
npm install
npm run dev
```
*The app opens at `http://localhost:5173`. By default, it will attempt to connect to the backend running on `localhost:8000`.*

---

## Production Deployment

| Service | Host | Purpose |
|---|---|---|
| **Frontend** | Vercel | React app deployment |
| **Backend** | Render | FastAPI server and NLP engine |

### Backend (Render)
1. Create a Web Service with Root Directory set to `backend`.
2. **Build command:** `pip install -r requirements.txt && python -m spacy download en_core_web_sm`
3. **Start command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add environment variable:
   - `GEMINI_API_KEY=your_api_key`
5. Deploy and copy your Web Service URL.

### Frontend (Vercel)
1. Import the repository and set Root Directory to `frontend`.
2. Add environment variable:
   - `VITE_API_URL` — your Render backend URL, e.g. `https://your-backend.onrender.com` (no trailing slash).
3. Deploy.

---

## Disclaimer
This system is for educational purposes only. It does not provide professional legal advice.
