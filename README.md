# AST-Fingerprint

**An Algorithmic Source Code Plagiarism Detection System using Abstract Syntax Trees, Depth-First Traversal, and N-Gram Hashing.**

## 📖 Project Vision
With the increasing scale of computer science education, traditional text-based plagiarism detectors (Type-1 clones) are easily circumvented by basic variable renaming or formatting changes. **AST-Fingerprint** evaluates the foundational logical structure of source code rather than its cosmetic syntax. By analyzing the "skeletal" control flow using Abstract Syntax Trees (ASTs), this system provides a mathematically verifiable metric of structural similarity to detect Type-2 and Type-3 code clones.

## 🚀 Features
*   **Structural Analysis:** Ignores variable renaming, whitespace, formatting, and comments mathematically.
*   **Multi-Language Engine Support:** Seamlessly analyzes code structures across JavaScript, TypeScript, Python, and CSS.
*   **Strict Input Validation:** Cross-references file extensions with selected parser engines to prevent runtime parsing faults.
*   **Tamper-Resistant N-Gram Hashing:** Utilizes sliding windows over DFS node traversals to detect gapped clones and code reordering.
*   **In-Memory Processing:** Leverages Express and Multer to process files entirely in RAM, eliminating disk I/O bottlenecks.
*   **Modern SaaS Dashboard:** High-end glassmorphism UI built with React.js and Vite for dynamic score visualization.

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
├── backend/                  # Express API server
│   ├── index.js              # Main application entry, parser mapping, and Jaccard logic
│   ├── package.json          # Backend dependencies & scripts
│   └── .npmrc                # Dependency resolution configurations
│
├── client/                   # React.js Frontend (Vite)
│   ├── public/               # Static assets
│   ├── src/                  # React components and styling
│   │   ├── App.jsx           # Main dashboard workspace logic
│   │   ├── App.css           # Modern glassmorphism styling
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

## ⚙️ How to Run Locally

### Prerequisites
* **Node.js:** v18 or v20 LTS recommended
* **npm:** Node Package Manager

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/suraj-86/ast-fingerprint.git
   cd ast-fingerprint
   ```

2. **Setup and Start the Backend:**
   ```bash
   cd backend
   npm install --legacy-peer-deps
   node index.js
   ```
   *The API server will start on `http://localhost:5000`*

3. **Setup and Start the Frontend:**
   *(Open a separate terminal window and run)*
   ```bash
   cd client
   npm install
   npm run dev
   ```
   *The Vite development server will start on `http://localhost:5173`*

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