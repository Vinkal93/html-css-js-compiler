// File templates for different file types

export const fileTemplates: Record<string, string> = {
  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
    <h1>Hello World! 🚀</h1>
    <p>Start coding here...</p>
  </div>
  <script src="script.js"></script>
</body>
</html>`,

  css: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  line-height: 1.6;
  color: #333;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}`,

  javascript: `// JavaScript code
console.log('Hello from JavaScript! 🎨');

// Your code here
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded successfully!');
});`,

  typescript: `// TypeScript code
interface Config {
  name: string;
  version: string;
}

const config: Config = {
  name: 'My App',
  version: '1.0.0'
};

console.log('Hello from TypeScript! 🚀', config);`,

  json: `{
  "name": "my-project",
  "version": "1.0.0",
  "description": "A new project",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "keywords": [],
  "author": "",
  "license": "MIT"
}`,

  markdown: `# Project Title

## Description
A brief description of your project.

## Features
- Feature 1
- Feature 2
- Feature 3

## Installation
\`\`\`bash
npm install
\`\`\`

## Usage
\`\`\`bash
npm start
\`\`\`

## License
MIT`,

  jsx: `import React from 'react';

const Component = () => {
  return (
    <div className="container">
      <h1>Hello React! ⚛️</h1>
      <p>Start building your component here...</p>
    </div>
  );
};

export default Component;`,

  tsx: `import React from 'react';

interface Props {
  title?: string;
}

const Component: React.FC<Props> = ({ title = 'Hello' }) => {
  return (
    <div className="container">
      <h1>{title} React + TypeScript! ⚛️</h1>
      <p>Start building your component here...</p>
    </div>
  );
};

export default Component;`,

  txt: ``,

  plaintext: ``,
};

export function getTemplate(fileType: string): string {
  const normalizedType = fileType.toLowerCase();
  return fileTemplates[normalizedType] || fileTemplates.plaintext;
}

export function getLanguageFromExtension(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  
  const languageMap: Record<string, string> = {
    'html': 'html',
    'htm': 'html',
    'css': 'css',
    'scss': 'scss',
    'sass': 'sass',
    'less': 'less',
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'json': 'json',
    'md': 'markdown',
    'markdown': 'markdown',
    'txt': 'plaintext',
    'xml': 'xml',
    'svg': 'xml',
    'py': 'python',
    'java': 'java',
    'c': 'c',
    'cpp': 'cpp',
    'cs': 'csharp',
    'php': 'php',
    'rb': 'ruby',
    'go': 'go',
    'rs': 'rust',
    'swift': 'swift',
    'kt': 'kotlin',
  };

  return languageMap[ext] || 'plaintext';
}

export function getFileIcon(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  
  const iconMap: Record<string, string> = {
    'html': '📄',
    'css': '🎨',
    'js': '📜',
    'jsx': '⚛️',
    'ts': '📘',
    'tsx': '⚛️',
    'json': '📋',
    'md': '📝',
    'txt': '📃',
    'png': '🖼️',
    'jpg': '🖼️',
    'jpeg': '🖼️',
    'gif': '🖼️',
    'svg': '🎨',
    'pdf': '📕',
    'zip': '📦',
  };

  return iconMap[ext] || '📄';
}
