import PDFDocument from 'pdfkit';

function renderToBuffer(renderFn) {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    renderFn(doc);
    doc.end();
  });
}

export function generatePairReport({ language, similarityPercentage, intersectionSize, unionSize, fileAName, fileBName }) {
  return renderToBuffer((doc) => {
    doc.fontSize(22).fillColor('#10b981').text('AST-Fingerprint Audit Report', { align: 'center' });
    doc.fontSize(10).fillColor('#666').text(`Generated on: ${new Date().toUTCString()}`, { align: 'center' });
    doc.moveDown(2);

    doc.fontSize(14).fillColor('#000').text('Plagiarism Analysis Summary');
    doc.fontSize(11).fillColor('#333');
    doc.text(`Target Language Engine: ${language.toUpperCase()}`);
    doc.text(`Similarity Score: ${similarityPercentage}%`);
    doc.text(`Matched AST N-Grams: ${intersectionSize} / ${unionSize}`);
    doc.moveDown(2);

    doc.fontSize(14).fillColor('#000').text('File Metadata');
    doc.fontSize(11).fillColor('#333');
    doc.text(`Source File: ${fileAName}`);
    doc.text(`Suspect File: ${fileBName}`);
  });
}

export function generateBatchReport({ language, filesCount, pairs }) {
  return renderToBuffer((doc) => {
    doc.fontSize(22).fillColor('#10b981').text('AST-Fingerprint Batch Audit Report', { align: 'center' });
    doc.fontSize(10).fillColor('#666').text(`Generated on: ${new Date().toUTCString()}`, { align: 'center' });
    doc.fontSize(10).fillColor('#666').text(
      `Language Engine: ${language.toUpperCase()}   |   Files Compared: ${filesCount}   |   Pairs Analyzed: ${pairs.length}`,
      { align: 'center' }
    );
    doc.moveDown(2);

    doc.fontSize(14).fillColor('#000').text('Ranked Similarity Matrix (highest risk first)');
    doc.moveDown(0.5);

    const sorted = [...pairs].sort((a, b) => b.similarity - a.similarity);

    sorted.forEach((pair, idx) => {
      if (doc.y > 720) doc.addPage();
      doc.fontSize(11).fillColor('#333').text(
        `${idx + 1}. ${pair.fileA}  vs  ${pair.fileB}   —   ${pair.similarity}%   (${pair.matchedNgrams}/${pair.totalNgrams} n-grams)   [${pair.riskLevel}]`
      );
    });
  });
}
