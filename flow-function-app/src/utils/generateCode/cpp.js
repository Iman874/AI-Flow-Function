/**
 * C++ Code Generator - AST-based approach
 */

import { BaseCodeGenerator } from './BaseCodeGenerator.js';
import { FlowASTType } from '../FlowToAST.js';

class CppGenerator extends BaseCodeGenerator {
  constructor(ast) {
    super(ast, { indentSize: 2 });
    this.needsIncludes = new Set();
  }

  generate() {
    this.output = [];
    this.needsIncludes = new Set();

    // First pass to determine needed includes
    this.analyzeIncludes(this.ast);

    // Add includes
    if (this.needsIncludes.has('iostream')) {
      this.emitRaw('#include <iostream>');
    }
    if (this.needsIncludes.has('vector')) {
      this.emitRaw('#include <vector>');
    }
    if (this.needsIncludes.size > 0) {
      this.emitRaw('using namespace std;');
      this.emitRaw('');
    }

    // Generate code
    this.visitProgram(this.ast);

    return this.output.join('\n');
  }

  analyzeIncludes(node) {
    if (!node) return;

    // Check if we need iostream (for cin/cout)
    if (node.type === FlowASTType.INPUT || node.type === FlowASTType.OUTPUT) {
      this.needsIncludes.add('iostream');
    }

    // Check if we need vector (for arrays)
    if (node.type === FlowASTType.VARIABLE_DECLARATION && node.data.varType === 'array') {
      this.needsIncludes.add('vector');
    }

    // Recurse
    if (node.children) {
      node.children.forEach(child => this.analyzeIncludes(child));
    }
  }

  visitFunction(node) {
    const funcName = node.data.name || 'main';
    const params = node.data.parameters || [];
    const returnType = node.data.returnType || 'void';

    // Generate parameter list
    const paramList = params.map(p => {
      const type = this.mapType(p.type);
      if (p.type === 'array') {
        return `vector<int>& ${p.name}`;
      }
      return `${type} ${p.name}`;
    }).join(', ');

    this.emit(`${returnType} ${funcName}(${paramList}) {`);
    this.scope.push();

    // Visit children
    node.children.forEach(child => this.visit(child));

    this.scope.pop();
    this.emit('}');
  }

  visitVariableDeclaration(node) {
    const varName = node.data.name;
    const varType = node.data.varType;
    const arraySize = node.data.arraySize;
    const initialValue = node.data.initialValue;

    if (varType === 'array') {
      const size = arraySize || 10;
      this.emit(`vector<int> ${varName}(${size}, 0);`);
    } else {
      const cppType = this.mapType(varType);
      const initVal = initialValue || this.getDefaultValue(varType);
      this.emit(`${cppType} ${varName} = ${initVal};`);
    }
  }

  visitInput(node) {
    const varName = node.data.variable;
    this.emit(`cin >> ${varName};`);
  }

  visitOutput(node) {
    const expr = node.data.expression;

    if (node.data.expressionAST) {
      const code = this.expressionToCode(node.data.expressionAST);
      this.emit(`cout << ${code} << endl;`);
    } else if (expr) {
      this.emit(`cout << ${expr} << endl;`);
    } else {
      this.emit('cout << endl;');
    }
  }

  visitProcess(node) {
    const expr = node.data.expression;

    if (node.data.expressionAST) {
      const code = this.expressionToCode(node.data.expressionAST);
      this.emit(`${code};`);
    } else if (expr) {
      this.emit(`// Process: ${expr}`);
    }
  }

  visitIfStatement(node) {
    const condition = node.data.condition;

    let condCode = condition;
    if (node.data.conditionAST) {
      condCode = this.expressionToCode(node.data.conditionAST);
    }

    this.emit(`if (${condCode}) {`);
    this.scope.push();

    if (node.children[0]) {
      this.visit(node.children[0]);
    }

    this.scope.pop();
    this.emit('}');

    // Else branch
    if (node.children[1] && node.children[1].children.length > 0) {
      this.emit('else {');
      this.scope.push();
      this.visit(node.children[1]);
      this.scope.pop();
      this.emit('}');
    }
  }

  visitLoop(node) {
    const loopType = node.data.loopType;
    const counterVar = node.data.counterVar || 'i';
    const startValue = node.data.startValue || 0;
    const endValue = node.data.endValue || 10;
    const step = node.data.step || 1;

    if (loopType === 'while' && node.data.condition) {
      let condCode = node.data.condition;
      if (node.data.conditionAST) {
        condCode = this.expressionToCode(node.data.conditionAST);
      }
      this.emit(`while (${condCode}) {`);
    } else {
      // For loop
      const stepOp = step === 1 ? `${counterVar}++` : `${counterVar} += ${step}`;
      this.emit(`for (int ${counterVar} = ${startValue}; ${counterVar} < ${endValue}; ${stepOp}) {`);
    }

    this.scope.push();

    if (node.children[0]) {
      this.visit(node.children[0]);
    }

    this.scope.pop();
    this.emit('}');
  }

  visitReturn(node) {
    const value = node.data.value;

    if (node.data.valueAST) {
      const code = this.expressionToCode(node.data.valueAST);
      this.emit(`return ${code};`);
    } else if (value) {
      this.emit(`return ${value};`);
    } else {
      this.emit('return;');
    }
  }

  mapType(varType) {
    switch (varType) {
      case 'int':
        return 'int';
      case 'float':
        return 'float';
      case 'string':
        return 'string';
      case 'bool':
        return 'bool';
      default:
        return 'int';
    }
  }

  getDefaultValue(varType) {
    switch (varType) {
      case 'int':
      case 'float':
        return '0';
      case 'string':
        return '""';
      case 'bool':
        return 'false';
      default:
        return '0';
    }
  }
}

export default function generateCpp(ast) {
  const generator = new CppGenerator(ast);
  return generator.generate();
}
