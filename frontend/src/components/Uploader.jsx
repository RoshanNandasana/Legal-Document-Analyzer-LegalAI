export default function Uploader({ onUpload, loading }) {
  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) onUpload(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) onUpload(file);
  };

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={`upload-zone flex items-center justify-between p-8 ${loading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-[#f0fdf4] text-[#133c33] rounded-lg flex items-center justify-center text-xl">
            ↑
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Upload a document
            </h3>
            <p className="text-sm text-gray-500 mb-2">
              Drag and drop your file here, or choose from your device
            </p>
            <p className="text-xs text-gray-400">
              PDF or DOCX • Maximum 25 MB
            </p>
          </div>
        </div>

        <div>
          {!loading ? (
            <label className="btn-primary cursor-pointer inline-flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Choose document
              <input
                type="file"
                accept=".pdf,.txt,.docx"
                className="hidden"
                onChange={handleChange}
              />
            </label>
          ) : (
            <div className="text-sm font-medium text-[#133c33]">Analyzing...</div>
          )}
        </div>
      </div>
      
      <div className="text-center mt-4 text-xs text-gray-400 flex items-center justify-center gap-1.5">
        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        Your document is encrypted and only available to you.
      </div>
    </div>
  );
}
