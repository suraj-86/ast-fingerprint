# AST-Fingerprint v2.0
An Algorithmic Source Code Plagiarism Detection System using Abstract Syntax Trees, Depth-First Traversal, and N-Gram Hashing.

## 📖 Project Vision

With the increasing scale of computer science education, traditional text-based plagiarism detectors (Type-1 clones) are easily circumvented by basic variable renaming or formatting changes. **AST-Fingerprint** evaluates the foundational logical structure of source code rather than its cosmetic syntax. By analyzing the "skeletal" control flow using Abstract Syntax Trees (ASTs), this system provides a mathematically verifiable metric of structural similarity to detect Type-2 and Type-3 code clones.  

---
## 🚀 Version 3.0 Features

* **Batch / Class-Wide Scanning:** Upload 2-30 files at once and get every unique pair cross-checked and ranked by similarity — built for auditing an entire class's submissions in one pass, not just one file against another.
* **Risk-Level Classification:** Every comparison is labeled Low / Moderate / High / Very High based on its similarity score, so results are readable at a glance instead of a bare percentage.
* **Structural Analysis:** Ignores variable renaming, whitespace, formatting, and comments mathematically.  
* **Multi-Language Engine Support:** Analyzes code structures across JavaScript, TypeScript, Python, CSS, C, C++, Java, C#, Go, Rust, Ruby, PHP, Swift, Bash, HTML, and JSON.
* **Interactive Side-by-Side Code Diff Viewer:** Powered by Microsoft's Monaco Editor (`@monaco-editor/react`), allowing auditors to inspect structural line-by-line code matches visually — available for both single-pair and batch results.
* **Downloadable Official PDF Audit Reports:** Generates professional in-memory PDF summary reports containing similarity scores, N-gram metrics, and file metadata for academic records. Batch scans get a ranked summary report covering every pair.
* **Rate Limiting:** The scan endpoints are protected with per-IP request limits (via `express-rate-limit`) to prevent abuse of the parsing/PDF-generation pipeline.
* **Strict Input Validation:** Cross-references file extensions with selected parser engines to prevent runtime parsing faults.  
* **Tamper-Resistant N-Gram Hashing:** Utilizes sliding windows over DFS node traversals to detect gapped clones and code reordering.  
* **In-Memory Processing:** Leverages Express and Multer to process files entirely in RAM, eliminating disk I/O bottlenecks.  
* **Modern SaaS Dashboard:** High-end glassmorphism UI built with React.js and Vite.  

---

## 🛠️ Technology Stack
| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend UI** | React.js (v18), Vite, CSS3 | Single Page Application (SPA) architecture for asynchronous file handling and dynamic feedback. |
| **API Backend** | Node.js (v20 LTS), Express.js | Non-blocking backend using ES Modules to handle HTTP POST multipart requests. |
| **Parser Engine** | Tree-sitter | High-performance, incremental parsing framework for concrete and abstract syntax tree generation. |
| **Deployment** | Vercel & Render | Cloud infrastructure hosting the frontend client and backend microservice. |

## 📦 Project Structure
```text
ast-fingerprint/
│
├── index.js                  # Express app entry point & route handlers
├── lib/                       # Backend logic, split by concern
│   ├── languages.js          # Parser + file-extension mappings for every supported language
│   ├── astEngine.js          # DFS flattening, n-gram generation, Jaccard similarity, risk levels
│   └── reportGenerator.js    # PDF report builders (single-pair & batch)
├── package.json               # Backend dependencies & scripts
│
├── client/                   # React.js Frontend (Vite)
│   ├── public/               # Static assets
│   ├── src/                  # React components and styling
│   │   ├── App.jsx           # Main dashboard workspace logic (pairwise + batch modes)
│   │   ├── App.css           # Modern glassmorphism styling
│   │   ├── config.js         # API base URL (env-configurable)
│   │   └── main.jsx          # React DOM entry point
│   ├── index.html            # HTML document template
│   └── package.json          # Frontend dependencies
│
├── .gitignore                # Git exclusion rules
└── README.md                 # Project documentation

```

# AST Fingerprint & Code Plagiarism Detection System

> **Academic Minor Project — 2026**  
> **Developed by:** Suraj  
> **GitHub Repository:** [github.com/suraj-86/ast-fingerprint](https://github.com/suraj-86/ast-fingerprint)

---

## 🌐 Live Demo & Deployment

* **Frontend Client:** [https://ast-fingerprint.vercel.app](https://ast-fingerprint.vercel.app)
* **Backend API Service:** on RENDER

---

## 📡 API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/languages` | GET | Returns the list of supported languages for building UI dropdowns dynamically. |
| `/api/scan` | POST | Single-pair scan. Multipart body: `language`, `fileA`, `fileB`. Returns similarity, n-gram counts, both file contents, and a PDF report. |
| `/api/batch-scan` | POST | Batch scan across 2-30 files. Multipart body: `language`, `files` (repeated field). Returns every unique pairwise comparison ranked by similarity, all file contents (for the diff viewer), and a ranked PDF report. |

Both scan endpoints are rate-limited (20 requests per 15 minutes per IP by default) to protect
the parsing/PDF-generation pipeline from abuse. General API traffic is capped at 100 requests
per 15 minutes per IP.

---

## 🧠 Algorithmic Pipeline

1. **Lexical Parsing:** Ingested source code strings are parsed by Tree-sitter language bindings into hierarchical syntax trees.
2. **Depth-First Search (DFS) Traversal:** Recursive traversal extracts structural node types (`IfStatement`, `BinaryExpression`, etc.) while stripping away user-defined variable names and literals.
3. **N-Gram Sliding Window:** The linear sequence of node types is partitioned into overlapping $n$-grams to capture localized syntax patterns.
4. **Jaccard Similarity Calculation:** The intersection over union of the source and suspect N-gram sets is computed to generate a final deterministic similarity percentage score.

---

## 📄 License & Author

* **Author:** Suraj
* **Project Type:** Academic Minor Project — 2026