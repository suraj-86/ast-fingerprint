import { useState } from 'react';
import { DiffEditor } from '@monaco-editor/react';
import { API_BASE_URL } from './config';
import './App.css';

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'css', label: 'CSS' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'php', label: 'PHP' },
  { value: 'swift', label: 'Swift' },
  { value: 'bash', label: 'Bash' },
  { value: 'html', label: 'HTML' },
  { value: 'json', label: 'JSON' },
];

const RISK_CLASS = {
  Low: 'risk-low',
  Moderate: 'risk-moderate',
  High: 'risk-high',
  'Very High': 'risk-very-high',
};

function UploadIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="upload-icon">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="17 8 12 3 7 8"></polyline>
      <line x1="12" y1="3" x2="12" y2="15"></line>
    </svg>
  );
}

function App() {
  const [mode, setMode] = useState('pair'); 
  const [language, setLanguage] = useState('javascript');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [fileA, setFileA] = useState(null);
  const [fileB, setFileB] = useState(null);
  const [result, setResult] = useState(null);

  const [batchFiles, setBatchFiles] = useState([]);
  const [batchResult, setBatchResult] = useState(null);
  const [selectedPair, setSelectedPair] = useState(null);

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError('');
    setResult(null);
    setBatchResult(null);
    setSelectedPair(null);
  };

  const handleScan = async (e) => {
    e.preventDefault();
    if (!fileA || !fileB) {
      setError('Please select both files.');
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
      const response = await fetch(`${API_BASE_URL}/api/scan`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to scan files');
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addBatchFiles = (fileList) => {
    const incoming = Array.from(fileList);
    setBatchFiles((prev) => {
      const existingNames = new Set(prev.map((f) => f.name));
      const merged = [...prev, ...incoming.filter((f) => !existingNames.has(f.name))];
      return merged;
    });
  };

  const removeBatchFile = (name) => {
    setBatchFiles((prev) => prev.filter((f) => f.name !== name));
  };

  const handleBatchScan = async (e) => {
    e.preventDefault();
    if (batchFiles.length < 2) {
      setError('Upload at least two files to run a batch comparison.');
      return;
    }

    setLoading(true);
    setError('');
    setBatchResult(null);
    setSelectedPair(null);

    const formData = new FormData();
    formData.append('language', language);
    batchFiles.forEach((file) => formData.append('files', file));

    try {
      const response = await fetch(`${API_BASE_URL}/api/batch-scan`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to run batch scan');
      }

      setBatchResult(data);
      if (data.pairs && data.pairs.length > 0) {
        setSelectedPair(data.pairs[0]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-layout">
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

      <main className="main-workspace">
        <div className="workspace-header">
          <h2>Structural Source Code Plagiarism Detector</h2>
          <p>Mathematical clone detection using Abstract Syntax Trees and N-Gram Hashing.</p>
        </div>

        <div className="mode-toggle">
          <button
            className={`mode-btn ${mode === 'pair' ? 'active' : ''}`}
            onClick={() => switchMode('pair')}
            type="button"
          >
            Pairwise Scan
          </button>
          <button
            className={`mode-btn ${mode === 'batch' ? 'active' : ''}`}
            onClick={() => switchMode('batch')}
            type="button"
          >
            Batch Scan (Multiple Files)
          </button>
        </div>

        <div className="control-panel">
          <label htmlFor="lang-select">Target Language Engine:</label>
          <select
            id="lang-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>{lang.label}</option>
            ))}
          </select>
        </div>

        {mode === 'pair' && (
          <>
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
          </>
        )}

        {mode === 'batch' && (
          <>
            <div className="batch-upload-box">
              <UploadIcon />
              <h3>Upload Multiple Files</h3>
              <p className="file-desc">
                Upload every submission you want cross-checked (2-30 files). Every unique pair
                will be compared and ranked by structural similarity.
              </p>
              <input
                type="file"
                multiple
                onChange={(e) => addBatchFiles(e.target.files)}
              />
            </div>

            {batchFiles.length > 0 && (
              <div className="batch-file-list">
                {batchFiles.map((file) => (
                  <div className="batch-file-chip" key={file.name}>
                    <span>{file.name}</span>
                    <button type="button" onClick={() => removeBatchFile(file.name)} aria-label={`Remove ${file.name}`}>
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="action-section">
              <button onClick={handleBatchScan} disabled={loading || batchFiles.length < 2} className="scan-btn">
                {loading ? 'Executing Engine...' : `Run Batch Scan (${batchFiles.length} files)`}
              </button>
            </div>
          </>
        )}

        {error && <div className="error-msg">{error}</div>}

        {result && (
          <div className="result-card">
            <div className="result-header">
              <h3>Plagiarism Analysis Result</h3>
            </div>

            <div className="score-circle">
              <span className="score-text">{result.similarity}%</span>
            </div>

            {result.hasSyntaxWarnings && (
              <div className="syntax-warning">
                ⚠️ One of the files contains syntax errors for the selected language — the score above may be unreliable.
              </div>
            )}

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

            <div style={{ padding: '20px', textAlign: 'center' }}>
              <a
                href={result.pdfReport}
                download="AST-Fingerprint-Audit-Report.pdf"
                className="pdf-download-btn"
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
                    minimap: { enabled: false },
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {batchResult && (
          <div className="result-card batch-result-card">
            <div className="result-header">
              <h3>Batch Analysis Result</h3>
            </div>

            <div className="batch-summary-bar">
              <div>
                <span className="stat-label">Files Compared</span>
                <span className="stat-value">{batchResult.filesCount}</span>
              </div>
              <div>
                <span className="stat-label">Pairs Analyzed</span>
                <span className="stat-value">{batchResult.pairs.length}</span>
              </div>
              <div>
                <span className="stat-label">Highest Match</span>
                <span className="stat-value">{batchResult.pairs[0]?.similarity ?? 0}%</span>
              </div>
            </div>

            {batchResult.syntaxWarnings && batchResult.syntaxWarnings.length > 0 && (
              <div className="syntax-warning">
                ⚠️ Syntax errors detected in: {batchResult.syntaxWarnings.join(', ')} — related scores may be unreliable.
              </div>
            )}

            <div style={{ padding: '20px', textAlign: 'center' }}>
              <a
                href={batchResult.pdfReport}
                download="AST-Fingerprint-Batch-Audit-Report.pdf"
                className="pdf-download-btn"
              >
                📥 Download Batch Audit Report (PDF)
              </a>
            </div>

            <div className="batch-table-wrapper">
              <table className="batch-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>File A</th>
                    <th>File B</th>
                    <th>Similarity</th>
                    <th>Matched N-Grams</th>
                    <th>Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {batchResult.pairs.map((pair, idx) => (
                    <tr
                      key={`${pair.fileA}-${pair.fileB}`}
                      className={selectedPair === pair ? 'selected-row' : ''}
                      onClick={() => setSelectedPair(pair)}
                    >
                      <td>{idx + 1}</td>
                      <td>{pair.fileA}</td>
                      <td>{pair.fileB}</td>
                      <td>{pair.similarity}%</td>
                      <td>{pair.matchedNgrams} / {pair.totalNgrams}</td>
                      <td><span className={`risk-badge ${RISK_CLASS[pair.riskLevel]}`}>{pair.riskLevel}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedPair && (
              <div className="diff-viewer-wrapper" style={{ padding: '20px', textAlign: 'left' }}>
                <h4 style={{ color: 'var(--text-main)', marginBottom: '10px', fontSize: '1rem' }}>
                  Structural Comparison: {selectedPair.fileA} vs {selectedPair.fileB}
                </h4>
                <div style={{ height: '450px', border: '1px solid var(--panel-border)', borderRadius: '12px', overflow: 'hidden' }}>
                  <DiffEditor
                    height="100%"
                    language={language}
                    original={batchResult.sources[selectedPair.fileA]}
                    modified={batchResult.sources[selectedPair.fileB]}
                    theme="vs-dark"
                    options={{
                      readOnly: true,
                      automaticLayout: true,
                      renderSideBySide: true,
                      minimap: { enabled: false },
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </main>

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