import { useState } from "react";
import QAChat from "./QAChat";

export default function Dashboard({ data, onReset, fileUrl }) {
  const {
    filename,
    document_type,
    parties,
    simple_summary,
    important_details,
    important_sections,
    word_count,
    page_count,
    extracted_text,
    nlp
  } = data;

  const [showChat, setShowChat] = useState(false);
  const [expandedClauses, setExpandedClauses] = useState({});
  const [expandedIssues, setExpandedIssues] = useState({});

  const toggleClause = (i) => setExpandedClauses(prev => ({...prev, [i]: !prev[i]}));
  const toggleIssue = (i) => setExpandedIssues(prev => ({...prev, [i]: !prev[i]}));

  // Helper for pseudo-random priorities if needed
  const getPriority = (title) => {
    const t = title.toLowerCase();
    if (t.includes("termination") || t.includes("liability")) return "high";
    if (t.includes("confidentiality") || t.includes("non-compete")) return "medium";
    return "low";
  };

  const getStatus = (title) => {
    const p = getPriority(title);
    return p === "high" ? "ATTENTION" : (p === "medium" ? "REVIEW" : "STANDARD");
  };

  return (
    <div className="fade-in pb-20">
      
      {/* Back button & Header */}
      <div className="mb-8">
        <button onClick={onReset} className="text-sm text-gray-500 hover:text-gray-900 mb-6 flex items-center gap-2 font-medium">
          &larr; Back to Dashboard
        </button>
        <div className="text-xs font-bold text-[#133c33] tracking-wider uppercase mb-2">Document Analysis</div>
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">{document_type || "Document"}</h1>
            <p className="text-sm text-gray-500">{filename || "Document.pdf"} &bull; Analysis completed just now</p>
          </div>
          <button 
            onClick={() => fileUrl && window.open(fileUrl, '_blank')}
            className="card-border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 shadow-sm"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            View original
          </button>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="card-border flex flex-wrap divide-x divide-gray-100 mb-8 overflow-hidden shadow-sm">
        <div className="p-5 flex-1 min-w-[200px]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded bg-[#f0fdf4] text-[#133c33] flex items-center justify-center text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Document Name</div>
          </div>
          <div className="font-semibold text-gray-900 truncate">{filename}</div>
        </div>
        <div className="p-5 flex-none w-32">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Pages</div>
          <div className="font-bold text-xl text-gray-900">{page_count || 1}</div>
          <div className="text-xs text-gray-400">Full document</div>
        </div>
        <div className="p-5 flex-none w-36">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Word Count</div>
          <div className="font-bold text-xl text-gray-900">{(word_count || 0).toLocaleString()}</div>
          <div className="text-xs text-gray-400">Approx. {Math.max(1, Math.round((word_count || 0) / 250))} min read</div>
        </div>
        <div className="p-5 flex-none w-48">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Document Type</div>
          <div className="font-semibold text-gray-900">{document_type || "Unknown"}</div>
          <div className="text-xs text-gray-400">Contract</div>
        </div>

      </div>

      {/* AI Summary & Key Info Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Left: AI Summary */}
        <div className="card-border p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded bg-[#133c33] text-white flex items-center justify-center text-xs">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xs font-bold text-[#133c33] uppercase tracking-wider">AI Summary</h3>
          </div>
          <div className="text-sm text-gray-700 leading-relaxed space-y-4 flex-grow">
            {simple_summary ? (
              <p>{simple_summary}</p>
            ) : (
              <p>No summary generated.</p>
            )}
          </div>
          <div className="mt-6 text-xs text-gray-400 border-t border-gray-100 pt-4">
            AI-generated summary. Verify important details in the source document.
          </div>
        </div>

        {/* Right: Key Information */}
        <div className="card-border p-6 shadow-sm bg-gray-50/50">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded border border-gray-200 text-gray-400 flex items-center justify-center text-xs font-serif italic">i</div>
            <h3 className="text-sm font-bold text-gray-900">Key information</h3>
          </div>
          <p className="text-xs text-gray-500 mb-6">Important details at a glance</p>

          <div className="grid grid-cols-2 gap-y-6 gap-x-4">
            <div className="col-span-2">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Parties</div>
              <div className="font-medium text-sm text-gray-900">{parties?.join(" & ") || "Not specified"}</div>
            </div>
            
            {important_details && Object.entries(important_details).map(([key, value]) => (
              <div key={key}>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{key.replace(/_/g, " ")}</div>
                <div className="font-medium text-sm text-gray-900">{value}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Important clauses */}
      {important_sections && important_sections.length > 0 && (
        <div className="mb-12">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Important clauses</h3>
              <p className="text-sm text-gray-500">Key terms found in this agreement</p>
            </div>
            <div className="text-xs font-bold text-[#133c33] bg-[#f0fdf4] px-3 py-1 rounded-full uppercase">
              {important_sections.length} Clauses Identified
            </div>
          </div>
          
          <div className="space-y-3">
            {important_sections.map((sec, i) => {
              const status = getStatus(sec.title);
              return (
                <div key={i} onClick={() => toggleClause(i)} className="card-border p-4 flex items-center justify-between hover:border-gray-300 transition-colors cursor-pointer group shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full bg-[#f0fdf4] text-[#166534] flex items-center justify-center text-xs">✓</div>
                    <div>
                      <div className="font-bold text-gray-900 text-sm">{sec.title}</div>
                      <div className="text-xs text-gray-500">
                        {expandedClauses[i] ? sec.simple_explanation : `${sec.simple_explanation.substring(0, 80)}${sec.simple_explanation.length > 80 ? '...' : ''}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {status === "ATTENTION" && <span className="badge-red">Attention</span>}
                    {status === "REVIEW" && <span className="badge-orange">Review</span>}
                    {status === "STANDARD" && <span className="badge-green">Standard</span>}
                    
                    <div className="card-border px-3 py-1.5 text-xs text-gray-500 flex items-center gap-2 group-hover:bg-gray-50">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                      {sec.page && sec.page !== "Unknown" ? `Page ${sec.page}` : `Section ${i + 1}`}
                    </div>
                    <div className="text-gray-300 group-hover:text-gray-600 transition-colors">&gt;</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Issues requiring attention */}
      {important_sections && important_sections.length > 0 && (
        <div className="mb-12">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Issues requiring attention</h3>
              <p className="text-sm text-gray-500">Review these clauses before making a decision</p>
            </div>
            <div className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full uppercase">
              Priority Issues
            </div>
          </div>
          
          <div className="space-y-4">
            {important_sections.slice(0, 3).map((sec, i) => {
              const p = getPriority(sec.title);
              let colorClass = "border-red-500 text-red-600 bg-red-50";
              if(p === "medium") colorClass = "border-orange-500 text-orange-600 bg-orange-50";
              if(p === "low") colorClass = "border-yellow-500 text-yellow-600 bg-yellow-50";

              return (
                <div key={i} className={`card-border shadow-sm flex flex-col relative overflow-hidden pl-1`}>
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${colorClass.split(" ")[0].replace("border-", "bg-")}`}></div>
                  <div className="p-5 pl-6 flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold ${colorClass.split(" ")[2]} ${colorClass.split(" ")[1]}`}>!</div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${colorClass.split(" ")[1]}`}>{p} priority</span>
                      </div>
                      <div className="card-border px-3 py-1.5 text-xs text-gray-500 flex items-center gap-2">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                        {sec.page && sec.page !== "Unknown" ? `Page ${sec.page}` : `Section ${i + 1}`}
                      </div>
                    </div>
                    <div className="font-bold text-gray-900 text-lg mt-1">{sec.title}</div>
                    <div className="font-semibold text-gray-800 text-sm">
                      {expandedIssues[i] ? sec.what_it_says : `${sec.what_it_says.substring(0, 60)}${sec.what_it_says.length > 60 ? '...' : ''}`}
                    </div>
                    <div className="text-sm text-gray-500">{sec.simple_explanation}</div>
                    <button 
                      onClick={() => toggleIssue(i)}
                      className="text-sm font-medium text-[#133c33] mt-2 self-start flex items-center gap-1 hover:underline"
                    >
                      {expandedIssues[i] ? "Hide clause \u2192" : "View clause \u2192"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Keywords & entities */}
      {nlp && nlp.entities && (
        <div className="mb-12">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Keywords & entities</h3>
              <p className="text-sm text-gray-500">People, organizations, dates, and legal terms found in the document</p>
            </div>
            <div className="text-[10px] font-bold text-[#133c33] bg-[#f0fdf4] px-3 py-1 rounded-full uppercase">
              {nlp.entities.length} Detected
            </div>
          </div>
          
          <div className="card-border p-6 shadow-sm bg-gray-50/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Organizations</div>
                <div className="flex flex-wrap gap-2">
                  {nlp.entities.filter(e => e.label === "ORG").slice(0, 3).map((e, i) => (
                    <span key={i} className="pill bg-white shadow-sm">{e.text}</span>
                  ))}
                  {nlp.entities.filter(e => e.label === "ORG").length === 0 && <span className="text-xs text-gray-400">None found</span>}
                </div>
              </div>
              
              <div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">People</div>
                <div className="flex flex-wrap gap-2">
                  {nlp.entities.filter(e => e.label === "PERSON").slice(0, 3).map((e, i) => (
                    <span key={i} className="pill bg-white shadow-sm">{e.text}</span>
                  ))}
                  {nlp.entities.filter(e => e.label === "PERSON").length === 0 && <span className="text-xs text-gray-400">None found</span>}
                </div>
              </div>
              
              <div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Locations & Dates</div>
                <div className="flex flex-wrap gap-2">
                  {nlp.entities.filter(e => e.label === "GPE" || e.label === "DATE").slice(0, 4).map((e, i) => (
                    <span key={i} className="pill bg-white shadow-sm">{e.text}</span>
                  ))}
                  {nlp.entities.filter(e => e.label === "GPE" || e.label === "DATE").length === 0 && <span className="text-xs text-gray-400">None found</span>}
                </div>
              </div>
              
              <div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Legal Terms</div>
                <div className="flex flex-wrap gap-2">
                  {nlp.keywords && nlp.keywords.slice(0, 4).map((k, i) => (
                    <span key={i} className="pill bg-white shadow-sm">{k.term}</span>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Ask about your document bottom bar */}
      {!showChat ? (
        <div className="bg-[#133c33] rounded-xl p-5 flex items-center justify-between shadow-lg cursor-pointer hover:bg-[#0f2e27] transition-colors" onClick={() => setShowChat(true)}>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-white">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            </div>
            <div>
              <h3 className="text-white font-bold text-sm mb-0.5">Have a question about this document?</h3>
              <p className="text-[#a7f3d0] text-xs">Ask in plain language and get an answer linked to the exact source.</p>
            </div>
          </div>
          <div className="text-white text-sm font-semibold flex items-center gap-2">
            Ask AI &rarr;
          </div>
        </div>
      ) : (
        <div className="card-border shadow-xl overflow-hidden mt-8">
          <div className="bg-white border-b border-gray-100 p-5 flex justify-between items-center">
            <div>
              <div className="text-[10px] font-bold text-[#133c33] uppercase tracking-wider mb-1">{document_type?.toUpperCase() || "DOCUMENT"}</div>
              <h2 className="text-xl font-bold text-gray-900">Ask about your document</h2>
              <p className="text-sm text-gray-500">Get clear answers with references to the original text.</p>
            </div>
            <button onClick={() => setShowChat(false)} className="text-gray-400 hover:text-gray-900 text-2xl">&times;</button>
          </div>
          <div className="bg-[#fafbfa] p-6">
            <QAChat documentContext={extracted_text} />
          </div>
        </div>
      )}

    </div>
  );
}
