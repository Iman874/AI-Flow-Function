import { generatePseudo } from '../generatePseudo.js';
import python from './python.js';
import cpp from './cpp.js';
import c from './c.js';
import csharp from './csharp.js';
import java from './java.js';
import javascript from './javascript.js';

export function generateCode(lang, nodes, edges) {
  const pseudoArr = generatePseudo(nodes, edges);
  const pseudo = Array.isArray(pseudoArr) ? pseudoArr.join('\n') : String(pseudoArr);
  switch (lang) {
    case 'pseudo':
      return pseudo;
    case 'python':
      return python(pseudo);
    case 'cpp':
      return cpp(pseudo);
    case 'c':
      return c(pseudo);
    case 'csharp':
      return csharp(pseudo);
    case 'java':
      return java(pseudo);
    case 'javascript':
      return javascript(pseudo);
    case 'read':
    case 'print':
      return pseudo; // Ensure READ and PRINT are routed correctly
    default:
      return pseudo;
  }
}
