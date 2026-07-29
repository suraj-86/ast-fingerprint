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
import PDFDocument from 'pdfkit';

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
    const allowedExtensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.css', '.c', '.h', '.cpp', '.cc', '.cxx', '.hpp', '.java'];
    const isAllowed = allowedExtensions.some(ext => file.originalname.toLowerCase().endsWith(ext));
    
    if (isAllowed) {
        cb(null, true); 
    } else {
        cb(new Error('Invalid file type. Ensure the file matches a supported language format.'), false); 
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

function calculateJaccardMetrics(setA, setB) {
    let intersectionCount = 0;
    for (const item of setA) {
        if (setB.has(item)) {
            intersectionCount++;
        }
    }
    const unionCount = setA.size + setB.size - intersectionCount;
    const similarity = unionCount === 0 ? 1.0 : intersectionCount / unionCount;
    
    return {
        similarityPercentage: (similarity * 100).toFixed(2),
        intersectionSize: intersectionCount,
        unionSize: unionCount
    };
}

// --- 5. THE API ENDPOINT ---
app.post('/api/scan', upload.fields([{ name: 'fileA', maxCount: 1 }, { name: 'fileB', maxCount: 1 }]), (req, res) => {
    if (!req.files || !req.files.fileA || !req.files.fileB) {
        return res.status(400).json({ error: "Please upload both Source and Suspect files." });
    }

    try {
        const reqLang = req.body.language || 'javascript';
        
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
        
        const getExtension = (filename) => {
            const parts = filename.split('.');
            return '.' + parts[parts.length - 1].toLowerCase();
        };

        const extA = getExtension(req.files.fileA[0].originalname);
        const extB = getExtension(req.files.fileB[0].originalname);

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

        const sourceCode = req.files.fileA[0].buffer.toString('utf-8');
        const suspectCode = req.files.fileB[0].buffer.toString('utf-8');

        const treeA = parser.parse(sourceCode);
        const treeB = parser.parse(suspectCode);

        const flatA = flattenAST(treeA.rootNode);
        const flatB = flattenAST(treeB.rootNode);

        const nGramsA = generateNGrams(flatA, 3);
        const nGramsB = generateNGrams(flatB, 3);

        const { similarityPercentage, intersectionSize, unionSize } = calculateJaccardMetrics(nGramsA, nGramsB);

        // --- Generate PDF Audit Report in Memory ---
        const doc = new PDFDocument({ margin: 50 });
        let buffers = [];
        
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            let pdfData = Buffer.concat(buffers);
            let base64Pdf = pdfData.toString('base64');

            res.json({
                success: true,
                similarity: similarityPercentage,
                matchedNgrams: intersectionSize,
                totalNgrams: unionSize,
                sourceCode: sourceCode,
                suspectCode: suspectCode,
                pdfReport: `data:application/pdf;base64,${base64Pdf}`
            });
        });

        doc.fontSize(22).fillColor('#10b981').text('AST-Fingerprint Audit Report', { align: 'center' });
        doc.fontSize(10).fillColor('#666').text(`Generated on: ${new Date().toUTCString()}`, { align: 'center' });
        doc.moveDown(2);

        doc.fontSize(14).fillColor('#000').text('Plagiarism Analysis Summary');
        doc.fontSize(11).fillColor('#333');
        doc.text(`Target Language Engine: ${reqLang.toUpperCase()}`);
        doc.text(`Similarity Score: ${similarityPercentage}%`);
        doc.text(`Matched AST N-Grams: ${intersectionSize} / ${unionSize}`);
        doc.moveDown(2);

        doc.fontSize(14).fillColor('#000').text('File Metadata');
        doc.fontSize(11).fillColor('#333');
        doc.text(`Source File: ${req.files.fileA[0].originalname}`);
        doc.text(`Suspect File: ${req.files.fileB[0].originalname}`);
        
        doc.end();

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