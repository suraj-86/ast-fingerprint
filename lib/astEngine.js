import Parser from 'tree-sitter';
import { languageMap } from './languages.js';

const parser = new Parser();

export function flattenAST(node, typeArray = []) {
  typeArray.push(node.type);
  for (let i = 0; i < node.childCount; i++) {
    flattenAST(node.child(i), typeArray);
  }
  return typeArray;
}

export function generateNGrams(nodeTypes, n = 3) {
  const nGrams = new Set();
  for (let i = 0; i <= nodeTypes.length - n; i++) {
    const chunk = nodeTypes.slice(i, i + n).join('->');
    nGrams.add(chunk);
  }
  return nGrams;
}

export function calculateJaccardMetrics(setA, setB) {
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
    unionSize: unionCount,
  };
}

export function fingerprintSource(code, lang, n = 3) {
  if (!languageMap[lang]) {
    throw new Error(`Unsupported language: ${lang}`);
  }
  parser.setLanguage(languageMap[lang]);
  const tree = parser.parse(code);
  const flat = flattenAST(tree.rootNode);
  return {
    nGrams: generateNGrams(flat, n),
    nodeCount: flat.length,
    hasErrors: flat.includes('ERROR'),
  };
}

export function getRiskLevel(similarityPercent) {
  if (similarityPercent >= 85) return 'Very High';
  if (similarityPercent >= 60) return 'High';
  if (similarityPercent >= 30) return 'Moderate';
  return 'Low';
}
