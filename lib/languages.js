import JavaScript from 'tree-sitter-javascript';
import TypeScript from 'tree-sitter-typescript';
import Python from 'tree-sitter-python';
import Css from 'tree-sitter-css';
import C from 'tree-sitter-c';
import Cpp from 'tree-sitter-cpp';
import Java from 'tree-sitter-java';
import Bash from 'tree-sitter-bash';
import CSharp from 'tree-sitter-c-sharp';
import Go from 'tree-sitter-go';
import Html from 'tree-sitter-html';
import Json from 'tree-sitter-json';
import Php from 'tree-sitter-php';
import Ruby from 'tree-sitter-ruby';
import Rust from 'tree-sitter-rust';
import Swift from 'tree-sitter-swift';

export const languageMap = {
  javascript: JavaScript,
  typescript: TypeScript.typescript,
  python: Python,
  css: Css,
  c: C,
  cpp: Cpp,
  java: Java,
  bash: Bash,
  csharp: CSharp,
  go: Go,
  html: Html,
  json: Json,
  php: Php.php,
  ruby: Ruby,
  rust: Rust,
  swift: Swift,
};

export const extensionMap = {
  javascript: ['.js', '.jsx', '.mjs'],
  typescript: ['.ts', '.tsx'],
  python: ['.py'],
  css: ['.css'],
  c: ['.c', '.h'],
  cpp: ['.cpp', '.cc', '.cxx', '.hpp'],
  java: ['.java'],
  bash: ['.sh', '.bash'],
  csharp: ['.cs'],
  go: ['.go'],
  html: ['.html', '.htm'],
  json: ['.json'],
  php: ['.php'],
  ruby: ['.rb'],
  rust: ['.rs'],
  swift: ['.swift'],
};

export const languageLabels = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  css: 'CSS',
  c: 'C',
  cpp: 'C++',
  java: 'Java',
  bash: 'Bash',
  csharp: 'C#',
  go: 'Go',
  html: 'HTML',
  json: 'JSON',
  php: 'PHP',
  ruby: 'Ruby',
  rust: 'Rust',
  swift: 'Swift',
};
