export default function Sidebar({ activeTab, setActiveTab }) {
  const tabs = [
    { 
      id: "dashboard", 
      label: "Dashboard", 
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      )
    },
    { 
      id: "analysis", 
      label: "Analysis", 
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    { 
      id: "ask_ai", 
      label: "Ask AI", 
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      )
    }
  ];

  return (
    <div className="w-64 bg-[#0f2e27] text-white h-screen flex flex-col flex-shrink-0 sticky top-0">
      
      {/* Logo */}
      <div className="p-6 flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded bg-emerald-400 flex items-center justify-center text-[#0f2e27] font-bold text-xl">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
        </div>
        <h1 className="text-xl font-bold tracking-tight">LegalAI</h1>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4">
        <div className="text-[10px] font-bold text-emerald-500/50 uppercase tracking-wider mb-3 px-3">
          Workspace
        </div>
        
        <nav className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id 
                  ? "bg-[#18443a] text-white" 
                  : "text-emerald-100/60 hover:bg-[#18443a]/50 hover:text-white"
              }`}
            >
              <div className="flex items-center justify-center w-5">
                {tab.icon}
              </div>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="p-4 space-y-3">
        {/* Private Files Banner */}
        <div className="bg-[#18443a] rounded-xl p-3 flex items-center gap-3 border border-emerald-500/10">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <div className="text-xs font-bold text-white">Your files are private</div>
            <div className="text-[10px] text-emerald-100/60">Encrypted and secure</div>
          </div>
        </div>
      </div>

    </div>
  );
}
