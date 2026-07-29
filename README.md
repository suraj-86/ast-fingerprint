# AST-Fingerprint

**An Algorithmic Source Code Plagiarism Detection System using Abstract Syntax Trees, Depth-First Traversal, and N-Gram Hashing.**

## 📖 Project Vision
With the increasing scale of computer science education, traditional text-based plagiarism detectors (Type-1 clones) are easily circumvented by basic obfuscation. **AST-Fingerprint** evaluates the foundational logical structure of source code rather than its cosmetic syntax. By analyzing the "skeletal" control flow using Abstract Syntax Trees (ASTs), this system provides a mathematically verifiable metric of structural similarity to detect Type-2 and Type-3 code clones.

## 🚀 Features
*   **Structural Analysis:** Ignores variable renaming, whitespace, and comments mathematically.
*   **Tamper-Resistant:** Utilizes N-gram sliding windows to detect inserted/deleted gapped clones (Type-3).
*   **Lightning Fast:** Express + Multer processes files entirely in RAM (no disk I/O bottlenecks).
*   **Visual Dashboard:** Clean, asynchronous React.js SPA for dynamic score visualization.

## 🛠️ Technology Stack
| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend UI** | React.js (v18), Vite | SPA architecture for asynchronous file handling. |
| **API Backend** | Node.js, Express.js | Non-blocking backend to handle HTTP POST requests. |
| **Parser Engine** | Tree-sitter | High-performance, incremental parsing system for AST generation. |

## ⚙️ How to Run Locally

### Prerequisites
*   Node.js (v18.0 LTS or higher)
*   npm (Node Package Manager)

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/your-username/ast-fingerprint.git](https://github.com/your-username/ast-fingerprint.git)