import express from 'express';
import multer from 'multer';
import cors from 'cors';
import Parser from 'tree-sitter';
import JavaScript from 'tree-sitter-javascript';
import TypeScript from 'tree-sitter-typescript';
import Python from 'tree-sitter-python';
import Css from 'tree-sitter-css';
import C from 'tree-sitter-c';
import Cpp from 'tree-sitter-cpp';
import Java from 'tree-sitter-java';

const app = express();
app.use(cors());
app.use(express.json());

// --- MAP LANGUAGE PARSERS ---
const languageMap = {
    'javascript': JavaScript,
    'typescript': TypeScript.typescript,
    'python': Python,
    'css': Css,
    'c': C,
    'cpp': Cpp,
    'java': Java
};

// --- 3. CONFIGURE MULTER ---
const codeFileFilter = (req, file, cb) => {
    const allowedExtensions = ['.js', '.py', '.ts', '.css'];
    const isAllowed = allowedExtensions.some(ext => file.originalname.toLowerCase().endsWith(ext));
    
    if (isAllowed) {
        cb(null, true); 
    } else {
        cb(new Error('Invalid file type. Ensure the file matches the selected language.'), false); 
    }
};

const upload = multer({ 
    storage: multer.memoryStorage(),
    fileFilter: codeFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } 
});

// --- 4. AST ENGINE HELPERS ---
const parser = new Parser();

function flattenAST(node, typeArray = []) {
    typeArray.push(node.type);
    for (let i = 0; i < node.childCount; i++) {
        flattenAST(node.child(i), typeArray);
    }
    return typeArray;
}

function generateNGrams(nodeTypes, n = 3) {
    const nGrams = new Set();
    for (let i = 0; i <= nodeTypes.length - n; i++) {
        const chunk = nodeTypes.slice(i, i + n).join('->');
        nGrams.add(chunk);
    }
    return nGrams;
}

function calculateJaccardSimilarity(setA, setB) {
    let intersectionCount = 0;
    for (const item of setA) {
        if (setB.has(item)) {
            intersectionCount++;
        }
    }
    const unionCount = setA.size + setB.size - intersectionCount;
    if (unionCount === 0) return 1.0; 
    return intersectionCount / unionCount;
}

// --- 5. THE API ENDPOINT ---
app.post('/api/scan', upload.fields([{ name: 'fileA', maxCount: 1 }, { name: 'fileB', maxCount: 1 }]), (req, res) => {
    if (!req.files || !req.files.fileA || !req.files.fileB) {
        return res.status(400).json({ error: "Please upload both Source and Suspect files." });
    }

    try {
        const reqLang = req.body.language || 'javascript';
        
        // 1. Define allowed extensions for each language engine
        const extensionMap = {
            'javascript': ['.js', '.jsx'],
            'typescript': ['.ts', '.tsx'],
            'python': ['.py'],
            'css': ['.css'],
            'c': ['.c', '.h'],
            'cpp': ['.cpp', '.cc', '.cxx', '.hpp'],
            'java': ['.java']
        };

        const expectedExtensions = extensionMap[reqLang];
        
        // 2. Extract extensions from uploaded files
        const getExtension = (filename) => {
            const parts = filename.split('.');
            return '.' + parts[parts.length - 1].toLowerCase();
        };

        const extA = getExtension(req.files.fileA[0].originalname);
        const extB = getExtension(req.files.fileB[0].originalname);

        // 3. Reject if extensions don't match the selected dropdown language
        if (!expectedExtensions.includes(extA) || !expectedExtensions.includes(extB)) {
            return res.status(400).json({ 
                error: `Language mismatch! You selected ${reqLang.toUpperCase()}, but uploaded ${extA} and ${extB} files. Please upload ${expectedExtensions.join(' or ')} files.` 
            });
        }

        if (languageMap[reqLang]) {
            parser.setLanguage(languageMap[reqLang]);
        } else {
            return res.status(400).json({ error: "Unsupported language selected." });
        }

        const codeA = req.files.fileA[0].buffer.toString('utf-8');
        const codeB = req.files.fileB[0].buffer.toString('utf-8');

        const treeA = parser.parse(codeA);
        const treeB = parser.parse(codeB);

        const flatA = flattenAST(treeA.rootNode);
        const flatB = flattenAST(treeB.rootNode);

        const nGramsA = generateNGrams(flatA, 3);
        const nGramsB = generateNGrams(flatB, 3);

        const score = calculateJaccardSimilarity(nGramsA, nGramsB);
        const percentage = (score * 100).toFixed(2);

        res.json({
            success: true,
            similarityScore: parseFloat(percentage),
            nodesAnalyzedA: flatA.length,
            nodesAnalyzedB: flatB.length
        });

    } catch (error) {
        console.error("Scanning Error:", error);
        res.status(500).json({ error: "Failed to process the files. Ensure they match the selected language." });
    }
});

// --- 6. START SERVER ---
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`AST-Fingerprint Backend (Core Languages) running on http://localhost:${PORT}`);
});