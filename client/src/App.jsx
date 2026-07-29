import { useState } from 'react';
import { DiffEditor } from '@monaco-editor/react';
import './App.css';

function App() {
  const [fileA, setFileA] = useState(null);
  const [fileB, setFileB] = useState(null);
  const [language, setLanguage] = useState('javascript');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleScan = async (e) => {
    e.preventDefault();
    if (!fileA || !fileB) {
      setError("Please select both files.");
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('language', language); 
    formData.append('fileA', fileA);
    formData.append('fileB', fileB);

    try {
      const response = await fetch('https://ast-fingerprint-api.onrender.com/api/scan', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to scan files");
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const UploadIcon = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="upload-icon">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="17 8 12 3 7 8"></polyline>
      <line x1="12" y1="3" x2="12" y2="15"></line>
    </svg>
  );

  return (
    <div className="app-layout">
      {/* Top Navigation Bar */}
      <nav className="top-navbar">
        <div className="nav-brand">
          <div className="brand-logo">AST</div>
          <span className="brand-text">Fingerprint Engine</span>
        </div>
        <div className="nav-status">
          <span className="status-dot"></span>
          System Online
        </div>
      </nav>

      {/* Main Workspace */}
      <main className="main-workspace">
        <div className="workspace-header">
          <h2>Structural Source Code Plagiarism Detector</h2>
          <p>Mathematical clone detection using Abstract Syntax Trees and N-Gram Hashing.</p>
        </div>

        <div className="control-panel">
          <label htmlFor="lang-select">Target Language Engine:</label>
          <select 
            id="lang-select"
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="css">CSS</option>
            <option value="c">C</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
          </select>
        </div>

        <div className="upload-section">
          <div className="file-box">
            <UploadIcon />
            <h3>Source File (Original)</h3>
            <p className="file-desc">Upload the base reference code.</p>
            <input type="file" onChange={(e) => setFileA(e.target.files[0])} />
            {fileA && <div className="file-badge">{fileA.name}</div>}
          </div>

          <div className="file-box">
            <UploadIcon />
            <h3>Suspect File (To Check)</h3>
            <p className="file-desc">Upload the code to evaluate against the source.</p>
            <input type="file" onChange={(e) => setFileB(e.target.files[0])} />
            {fileB && <div className="file-badge">{fileB.name}</div>}
          </div>
        </div>

        <div className="action-section">
          <button onClick={handleScan} disabled={loading} className="scan-btn">
            {loading ? 'Executing Engine...' : 'Run Plagiarism Scan'}
          </button>
        </div>

        {error && <div className="error-msg">{error}</div>}

        {result && (
          <div className="result-card">
            <div className="result-header">
              <h3>Plagiarism Analysis Result</h3>
            </div>
            
            <div className="score-circle">
              <span className="score-text">{result.similarity}%</span>
            </div>
            
            <div className="stats-grid">
              <div className="stat-box">
                <span className="stat-label">Matched N-Grams</span>
                <span className="stat-value">{result.matchedNgrams}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Total N-Grams Universe</span>
                <span className="stat-value">{result.totalNgrams}</span>
              </div>
            </div>

            {/* Download PDF Report Button */}
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <a 
                href={result.pdfReport} 
                download="AST-Fingerprint-Audit-Report.pdf"
                style={{
                  background: '#10b981',
                  color: '#fff',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  display: 'inline-block',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}
              >
                📥 Download Official Audit Report (PDF)
              </a>
            </div>

            <div className="diff-viewer-wrapper" style={{ padding: '20px', textAlign: 'left' }}>
              <h4 style={{ color: 'var(--text-main)', marginBottom: '10px', fontSize: '1rem' }}>Structural Code Comparison (Original vs Suspect)</h4>
              <div style={{ height: '450px', border: '1px solid var(--panel-border)', borderRadius: '12px', overflow: 'hidden' }}>
                <DiffEditor 
                  height="100%"
                  language={language}
                  original={result.sourceCode}
                  modified={result.suspectCode}
                  theme="vs-dark"
                  options={{
                    readOnly: true,
                    automaticLayout: true,
                    renderSideBySide: true,
                    minimap: { enabled: false }
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Professional Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <p className="footer-copyright">&copy; {new Date().getFullYear()} Suraj.</p>
          <div className="footer-socials">
            <a href="https://github.com/suraj-86" target="_blank" rel="noopener noreferrer" title="GitHub">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
            </a>
            <a href="https://www.linkedin.com/in/suraj-k-6a2b60227" target="_blank" rel="noopener noreferrer" title="LinkedIn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" width="2" height="2"></circle></svg>
            </a>
          </div>
          <p className="footer-tagline">AST ENGINE • BUILT WITH LOVE.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;