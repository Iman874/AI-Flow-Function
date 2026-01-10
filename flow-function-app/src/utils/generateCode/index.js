import { flowToAST } from '../FlowToAST.js';
import { validateFlow } from '../FlowValidator.js';
import python from './python.js';
import cpp from './cpp.js';
import c from './c.js';
import csharp from './csharp.js';
import java from './java.js';
import javascript from './javascript.js';

/**
 * Generate pseudocode from AST for display
 */
function astToPseudo(ast) {
  const lines = [];

  function visit(node, indent = 0) {
    if (!node) return;

    const ind = '  '.repeat(indent);

    switch (node.type) {
      case 'PROGRAM':
        node.children.forEach(child => visit(child, indent));
        break;

      case 'FUNCTION':
        const params = node.data.parameters.map(p => p.name).join(', ');
        lines.push(`${ind}FUNCTION ${node.data.name}(${params})`);
        node.children.forEach(child => visit(child, indent + 1));
        break;

      case 'VARIABLE_DECLARATION':
        const varType = node.data.varType === 'array'
          ? `${node.data.varType}[${node.data.arraySize}]`
          : node.data.varType;
        lines.push(`${ind}DECLARE ${node.data.name}: ${varType}`);
        break;

      case 'INPUT':
        lines.push(`${ind}READ ${node.data.variable}`);
        break;

      case 'OUTPUT':
        lines.push(`${ind}PRINT ${node.data.expression}`);
        break;

      case 'PROCESS':
        lines.push(`${ind}PROCESS ${node.data.expression}`);
        break;

      case 'IF_STATEMENT':
        lines.push(`${ind}IF ${node.data.condition} THEN`);
        if (node.children[0]) {
          visit(node.children[0], indent + 1);
        }
        if (node.children[1] && node.children[1].children.length > 0) {
          lines.push(`${ind}ELSE`);
          visit(node.children[1], indent + 1);
        }
        lines.push(`${ind}END IF`);
        break;

      case 'LOOP':
        const counter = node.data.counterVar;
        const start = node.data.startValue;
        const end = node.data.endValue;
        lines.push(`${ind}FOR ${counter} = ${start} TO ${end}`);
        if (node.children[0]) {
          visit(node.children[0], indent + 1);
        }
        lines.push(`${ind}END FOR`);
        break;

      case 'RETURN':
        const val = node.data.value || '';
        lines.push(`${ind}RETURN ${val}`);
        break;

      case 'BLOCK':
        node.children.forEach(child => visit(child, indent));
        break;
    }
  }

  visit(ast, 0);
  return lines.join('\n');
}

export function generateCode(lang, nodes, edges) {
  // Validate flow first
  const validation = validateFlow(nodes, edges);

  if (!validation.isValid) {
    const errorMessages = validation.errors.map(e => e.message).join('\n');
    return `// Validation Errors:\n// ${errorMessages}\n\n// Please fix the errors before generating code.`;
  }

  // Show warnings as comments
  let warningComments = '';
  if (validation.warnings.length > 0) {
    warningComments = validation.warnings
      .map(w => `// Warning: ${w.message}`)
      .join('\n') + '\n\n';
  }

  try {
    // Convert flow to AST
    const ast = flowToAST(nodes, edges);

    // Generate code based on language
    let code = '';
    switch (lang) {
      case 'pseudo':
        code = astToPseudo(ast);
        break;
      case 'python':
        code = python(ast);
        break;
      case 'cpp':
        code = cpp(ast);
        break;
      case 'c':
        code = c(ast);
        break;
      case 'csharp':
        code = csharp(ast);
        break;
      case 'java':
        code = java(ast);
        break;
      case 'javascript':
        code = javascript(ast);
        break;
      default:
        code = astToPseudo(ast);
    }

    return warningComments + code;
  } catch (error) {
    console.error('Code generation error:', error);
    return `// Error generating code:\n// ${error.message}\n\n// Please check your flow diagram.`;
  }
}
