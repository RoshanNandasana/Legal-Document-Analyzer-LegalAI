import { useState } from "react";

export default function QAChat({ documentContext }) {
  const [query, setQuery] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isAsking, setIsAsking] = useState(false);

  const predefinedQuestions = [
    "What happens if I leave the company?",
    "Explain the liability clause",
    "Who owns my work?"
  ];

  const handleAsk = async (questionText) => {
    const q = questionText || query;
    if (!q.trim()) return;

    const newHistory = [...chatHistory, { role: "user", text: q }];
    setChatHistory(newHistory);
    setQuery("");
    setIsAsking(true);

    try {
      const formData = new FormData();
      formData.append("question", q);
      formData.append("context", documentContext || "");

      const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${apiUrl}/ask`, {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.detail ? JSON.stringify(data.detail) : "Server returned an error");
      }
      
      setChatHistory([...newHistory, { role: "assistant", text: data.answer || "No answer received." }]);
    } catch (err) {
      console.error(err);
      setChatHistory([...newHistory, { role: "system", text: "Error connecting to the AI. Ensure document context is loaded." }]);
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px]">
      
      {/* Header Info */}
      <div className="flex items-center gap-3 mb-6 bg-white p-4 card-border shadow-sm">
        <div className="w-8 h-8 rounded bg-[#133c33] text-white flex items-center justify-center text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        </div>
        <div>
          <h4 className="text-sm font-bold text-gray-900">LegalAI Assistant</h4>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Answers grounded in your document</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pb-6">
        {chatHistory.length === 0 && (
          <div className="flex gap-4 fade-in">
            <div className="w-8 h-8 rounded bg-[#133c33] text-white flex items-center justify-center flex-shrink-0 text-sm mt-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div>
              <div className="bg-white card-border shadow-sm rounded-2xl rounded-tl-sm p-4 text-sm text-gray-800">
                What would you like to understand about your document?
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {predefinedQuestions.map((q, i) => (
                  <button 
                    key={i}
                    onClick={() => handleAsk(q)}
                    disabled={isAsking}
                    className="card-border bg-white hover:bg-gray-50 text-[#133c33] text-xs px-3 py-1.5 transition-colors disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {chatHistory.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 fade-in ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded bg-[#133c33] text-white flex items-center justify-center flex-shrink-0 text-sm mt-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
            )}
            
            <div className={`p-4 text-sm shadow-sm ${
              msg.role === "user" 
                ? "bg-[#133c33] text-white rounded-2xl rounded-tr-sm max-w-[80%]" 
                : (msg.role === "system" ? "bg-red-50 text-red-600 rounded-lg text-xs" : "bg-white card-border rounded-2xl rounded-tl-sm max-w-[85%] text-gray-800")
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        
        {isAsking && (
          <div className="flex gap-4 fade-in">
            <div className="w-8 h-8 rounded bg-[#133c33] text-white flex items-center justify-center flex-shrink-0 text-sm mt-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div className="bg-white card-border shadow-sm rounded-2xl rounded-tl-sm p-4 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{animationDelay: "0.2s"}}></div>
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{animationDelay: "0.4s"}}></div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-auto">
        <div className="relative flex items-center">
          <input
            type="text"
            className="w-full card-border shadow-sm bg-white pl-4 pr-12 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#133c33]"
            placeholder="Ask a question about this document..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAsk()}
            disabled={isAsking}
          />
          <button
            onClick={() => handleAsk()}
            disabled={!query.trim() || isAsking}
            className="absolute right-2 w-8 h-8 rounded bg-[#133c33] text-white flex items-center justify-center disabled:opacity-50 hover:bg-[#0f2e27] transition-colors"
          >
            &rarr;
          </button>
        </div>
        <div className="text-[10px] text-gray-400 mt-2 ml-2">
          Press Enter to send &bull; Answers include source references
        </div>
      </div>
      
    </div>
  );
}
