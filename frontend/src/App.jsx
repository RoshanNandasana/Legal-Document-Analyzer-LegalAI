import { useState } from "react";
import Uploader from "./components/Uploader";
import Dashboard from "./components/Dashboard";
import Sidebar from "./components/Sidebar";
import QAChat from "./components/QAChat";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [fileUrl, setFileUrl] = useState(null);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const handleUpload = async (file) => {
    setLoading(true);
    setError("");
    setResults(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setResults(data);
        setFileUrl(URL.createObjectURL(file));
        setActiveTab("analysis"); // Automatically switch to analysis tab
      }
    } catch (err) {
      setError(`Could not connect to backend. Make sure it is running on port 8000.\n${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResults(null);
    setError("");
    setFileUrl(null);
    setActiveTab("dashboard");
  };

  // Helper to format today's date like "WEDNESDAY, MAY 21"
  const getTodayDate = () => {
    const d = new Date();
    const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
  };

  return (
    <div className="flex h-screen bg-[#fafbfa] overflow-hidden">

      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">



        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto px-8 py-10 relative">
          <div className="max-w-[1000px] mx-auto pb-12">

            {activeTab === "dashboard" ? (
              <div className="fade-in">

                {/* Greeting Section */}
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <div className="text-[10px] font-bold text-gray-400 tracking-wider mb-1">
                      {getTodayDate()}
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">Good afternoon, Roshan</h1>
                    <p className="text-gray-500 text-sm">Review legal documents with clarity and confidence.</p>
                  </div>
                  <button
                    onClick={() => setShowHowItWorks(true)}
                    className="card-border px-4 py-2 text-sm font-medium text-gray-700 flex items-center gap-2 shadow-sm hover:bg-gray-50"
                  >
                    <span className="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center text-[10px]">i</span>
                    How it works
                  </button>
                </div>

                {error && (
                  <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                    {error}
                  </div>
                )}

                {/* Uploader Component */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1">
                  <Uploader onUpload={handleUpload} loading={loading} />
                </div>

              </div>
            ) : null}

            {activeTab === "analysis" && (
              results ? (
                <Dashboard data={results} onReset={handleReset} fileUrl={fileUrl} />
              ) : (
                <div className="text-center py-20 fade-in">
                  <div className="flex justify-center mb-4">
                    <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">No Analysis Available</h2>
                  <p className="text-gray-500 mb-6">Upload a document first to see the analysis.</p>
                  <button onClick={() => setActiveTab("dashboard")} className="btn-primary">
                    Go to Dashboard
                  </button>
                </div>
              )
            )}

            {activeTab === "ask_ai" && (
              <div className="fade-in pb-12">
                <div className="mb-8">
                  <div className="text-xs font-bold text-[#133c33] tracking-wider uppercase mb-2">
                    {results?.document_type || "DOCUMENT"}
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-1">Ask about your document</h1>
                  <p className="text-sm text-gray-500">Get clear answers with references to the original text.</p>
                </div>

                {results ? (
                  <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                    <QAChat documentContext={results.extracted_text} />
                  </div>
                ) : (
                  <div className="text-center py-20 bg-white card-border">
                    <div className="flex justify-center mb-4">
                      <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">No Document Available</h2>
                    <p className="text-gray-500 mb-6">Upload a document first to ask questions about it.</p>
                    <button onClick={() => setActiveTab("dashboard")} className="btn-primary">
                      Upload Document
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "settings" && (
              <div className="fade-in">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Settings</h1>
                <p className="text-gray-500">Settings panel coming soon.</p>
              </div>
            )}

          </div>

          {/* Help button bottom right */}
          <button className="fixed bottom-6 right-6 w-10 h-10 bg-white card-border rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 shadow-sm hover:shadow transition-all">
            ?
          </button>
        </main>

      </div>

      {/* How it works Modal */}
      {showHowItWorks && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">How it works</h2>
              <button onClick={() => setShowHowItWorks(false)} className="text-gray-400 hover:text-gray-900 text-2xl">&times;</button>
            </div>
            <div className="p-6 overflow-y-auto">
              <p className="text-sm text-gray-600 mb-6">
                This Legal Document Analyzer uses various Natural Language Processing (NLP) concepts to process and understand your document:
              </p>
              <div className="space-y-4">
                <div className="card-border p-4 shadow-sm">
                  <h4 className="font-bold text-[#133c33] text-sm mb-1">Text Extraction</h4>
                  <p className="text-xs text-gray-600">Uses <code className="bg-gray-100 px-1 rounded">pdfplumber</code> to extract raw text from PDF files.</p>
                </div>
                <div className="card-border p-4 shadow-sm">
                  <h4 className="font-bold text-[#133c33] text-sm mb-1">Text Processing</h4>
                  <p className="text-xs text-gray-600">Applies tokenization, lemmatization, and stemming using <code className="bg-gray-100 px-1 rounded">NLTK</code>.</p>
                </div>
                <div className="card-border p-4 shadow-sm">
                  <h4 className="font-bold text-[#133c33] text-sm mb-1">Parts of Speech Tagging</h4>
                  <p className="text-xs text-gray-600">Identifies grammatical structures (nouns, verbs, etc.) with <code className="bg-gray-100 px-1 rounded">NLTK</code>.</p>
                </div>
                <div className="card-border p-4 shadow-sm">
                  <h4 className="font-bold text-[#133c33] text-sm mb-1">Named Entity Recognition - NER</h4>
                  <p className="text-xs text-gray-600">Detects organizations, people, and dates using <code className="bg-gray-100 px-1 rounded">spaCy</code>.</p>
                </div>
                <div className="card-border p-4 shadow-sm">
                  <h4 className="font-bold text-[#133c33] text-sm mb-1">N-Gram & TF-IDF Analysis</h4>
                  <p className="text-xs text-gray-600">Finds common phrases and legal keywords using Unigrams, Bigrams, and Scikit-Learn.</p>
                </div>
                <div className="card-border p-4 shadow-sm">
                  <h4 className="font-bold text-[#133c33] text-sm mb-1">Text Summarization & QA</h4>
                  <p className="text-xs text-gray-600">Uses Gemini LLM to generate document summaries and answer questions.</p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button onClick={() => setShowHowItWorks(false)} className="btn-primary">Got it</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
