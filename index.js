import express from 'express';
import multer from 'multer';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import { extensionMap, languageLabels } from './lib/languages.js';
import { fingerprintSource, calculateJaccardMetrics, getRiskLevel } from './lib/astEngine.js';
import { generatePairReport, generateBatchReport } from './lib/reportGenerator.js';

const app = express();

// Render (and most PaaS hosts) sit behind a reverse proxy, so Express needs
// to trust the X-Forwarded-For header to see the real client IP. Without
// this, express-rate-limit ends up rate-limiting the proxy, not the caller.
app.set('trust proxy', 1);

app.use(cors());
app.use(express.json());

// --- RATE LIMITING ---
// A relaxed limiter across the whole API to stop basic hammering...
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP. Please try again later.' },
});

// ...and a much stricter limiter specifically on the expensive parsing +
// PDF-generation endpoints, since those are the ones worth protecting.
const scanLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Scan limit reached for this IP. Please wait a few minutes before running more scans.' },
});

app.use('/api', generalLimiter);

// --- MULTER CONFIG ---
const codeFileFilter = (req, file, cb) => {
  const allAllowedExtensions = Object.values(extensionMap).flat();
  const isAllowed = allAllowedExtensions.some(ext => file.originalname.toLowerCase().endsWith(ext));

  if (isAllowed) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Ensure the file matches a supported language format.'), false);
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: codeFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 30,                 // hard ceiling for batch uploads
  },
});

// --- SHARED HELPERS ---
function getExtension(filename) {
  const parts = filename.split('.');
  return '.' + parts[parts.length - 1].toLowerCase();
}

function validateLanguageFiles(files, reqLang) {
  const expectedExtensions = extensionMap[reqLang];
  if (!expectedExtensions) {
    return 'Unsupported language selected.';
  }
  for (const file of files) {
    const ext = getExtension(file.originalname);
    if (!expectedExtensions.includes(ext)) {
      return `Language mismatch! You selected ${reqLang.toUpperCase()}, but "${file.originalname}" doesn't match. Expected: ${expectedExtensions.join(', ')}.`;
    }
  }
  return null;
}

function multerErrorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'One or more files exceed the 5MB size limit.' });
    }
    if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: 'Too many files in one batch. The limit is 30 files per scan.' });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(400).json({ error: err.message || 'Upload failed.' });
  }
  next();
}

// --- ROUTE: list supported languages (lets the frontend build its dropdown dynamically) ---
app.get('/api/languages', (req, res) => {
  res.json({
    languages: Object.keys(extensionMap).map((value) => ({ value, label: languageLabels[value] })),
  });
});

// --- ROUTE: single pair scan (original behaviour, unchanged from the user's point of view) ---
app.post(
  '/api/scan',
  scanLimiter,
  (req, res, next) => upload.fields([{ name: 'fileA', maxCount: 1 }, { name: 'fileB', maxCount: 1 }])(req, res, (err) => multerErrorHandler(err, req, res, next)),
  async (req, res) => {
    if (!req.files || !req.files.fileA || !req.files.fileB) {
      return res.status(400).json({ error: 'Please upload both Source and Suspect files.' });
    }

    try {
      const reqLang = req.body.language || 'javascript';
      const fileA = req.files.fileA[0];
      const fileB = req.files.fileB[0];

      const validationError = validateLanguageFiles([fileA, fileB], reqLang);
      if (validationError) {
        return res.status(400).json({ error: validationError });
      }

      const sourceCode = fileA.buffer.toString('utf-8');
      const suspectCode = fileB.buffer.toString('utf-8');

      const fpA = fingerprintSource(sourceCode, reqLang);
      const fpB = fingerprintSource(suspectCode, reqLang);

      const { similarityPercentage, intersectionSize, unionSize } = calculateJaccardMetrics(fpA.nGrams, fpB.nGrams);

      const pdfBuffer = await generatePairReport({
        language: reqLang,
        similarityPercentage,
        intersectionSize,
        unionSize,
        fileAName: fileA.originalname,
        fileBName: fileB.originalname,
      });

      res.json({
        success: true,
        similarity: similarityPercentage,
        matchedNgrams: intersectionSize,
        totalNgrams: unionSize,
        sourceCode,
        suspectCode,
        hasSyntaxWarnings: fpA.hasErrors || fpB.hasErrors,
        pdfReport: `data:application/pdf;base64,${pdfBuffer.toString('base64')}`,
      });
    } catch (error) {
      console.error('Scanning Error:', error);
      res.status(500).json({ error: 'Failed to process the files. Ensure they match the selected language.' });
    }
  }
);

// --- ROUTE: batch scan — all-pairs comparison across N files ---
app.post(
  '/api/batch-scan',
  scanLimiter,
  (req, res, next) => upload.array('files', 30)(req, res, (err) => multerErrorHandler(err, req, res, next)),
  async (req, res) => {
    const files = req.files;
    if (!files || files.length < 2) {
      return res.status(400).json({ error: 'Upload at least two files to run a batch comparison.' });
    }

    try {
      const reqLang = req.body.language || 'javascript';
      const validationError = validateLanguageFiles(files, reqLang);
      if (validationError) {
        return res.status(400).json({ error: validationError });
      }

      // Fingerprint every file exactly once...
      const entries = files.map((file) => {
        const code = file.buffer.toString('utf-8');
        const fp = fingerprintSource(code, reqLang);
        return { name: file.originalname, code, nGrams: fp.nGrams, hasErrors: fp.hasErrors };
      });

      // ...then compare every unique pair (i < j). N files costs
      // N*(N-1)/2 comparisons rather than parsing anything twice.
      const pairs = [];
      for (let i = 0; i < entries.length; i++) {
        for (let j = i + 1; j < entries.length; j++) {
          const { similarityPercentage, intersectionSize, unionSize } = calculateJaccardMetrics(
            entries[i].nGrams,
            entries[j].nGrams
          );
          const similarity = parseFloat(similarityPercentage);
          pairs.push({
            fileA: entries[i].name,
            fileB: entries[j].name,
            similarity,
            matchedNgrams: intersectionSize,
            totalNgrams: unionSize,
            riskLevel: getRiskLevel(similarity),
          });
        }
      }

      pairs.sort((a, b) => b.similarity - a.similarity);

      const pdfBuffer = await generateBatchReport({
        language: reqLang,
        filesCount: entries.length,
        pairs,
      });

      res.json({
        success: true,
        filesCount: entries.length,
        pairs,
        sources: Object.fromEntries(entries.map((e) => [e.name, e.code])),
        syntaxWarnings: entries.filter((e) => e.hasErrors).map((e) => e.name),
        pdfReport: `data:application/pdf;base64,${pdfBuffer.toString('base64')}`,
      });
    } catch (error) {
      console.error('Batch Scanning Error:', error);
      res.status(500).json({ error: 'Failed to process the batch. Ensure all files match the selected language.' });
    }
  }
);

// --- START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`AST-Fingerprint Backend running on http://localhost:${PORT}`);
});
