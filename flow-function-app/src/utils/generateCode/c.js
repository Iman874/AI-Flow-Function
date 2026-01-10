/**
 * C Code Generator - AST-based approach
 */

import { BaseCodeGenerator } from './BaseCodeGenerator.js';
import { FlowASTType } from '../FlowToAST.js';

class CGenerator extends BaseCodeGenerator {
  constructor(ast) {
    super(ast, { indentSize: 2 });
    this.needsIncludes = new Set();
  }

  generate() {
    this.output = [];
    this.needsIncludes = new Set();

    // Analyze for includes
    this.analyzeIncludes(this.ast);

    // Add includes
    if (this.needsIncludes.has('stdio')) {
      this.emitRaw('#include <stdio.h>');
    }
    if (this.needsIncludes.has('stdlib')) {
      this.emitRaw('#include <stdlib.h>');
    }
    if (this.needsIncludes.has('string')) {
      this.emitRaw('#include <string.h>');
    }
    if (this.needsIncludes.size > 0) {
      this.emitRaw('');
    }

    // Generate code
    this.visitProgram(this.ast);

    return this.output.join('\n');
  }

  analyzeIncludes(node) {
    if (!node) return;

    if (node.type === FlowASTType.INPUT || node.type === FlowASTType.OUTPUT) {
      this.needsIncludes.add('stdio');
    }

    if (node.type === FlowASTType.VARIABLE_DECLARATION && node.data.varType === 'array') {
      this.needsIncludes.add('stdlib');
    }

    if (node.children) {
      node.children.forEach(child => this.analyzeIncludes(child));
    }
  }

  visitFunction(node) {
    const funcName = node.data.name || 'main';
    const params = node.data.parameters || [];
    const returnType = node.data.returnType === 'void' ? 'void' : 'int';

    const paramList = params.map(p => {
      const type = this.mapType(p.type);
      if (p.type === 'array') {
        return `${type} ${p.name}[]`;
      }
      return `${type} ${p.name}`;
    }).join(', ');

    const finalParams = paramList || 'void';
    this.emit(`${returnType} ${funcName}(${finalParams}) {`);
    this.scope.push();

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
      this.emit(`int ${varName}[${size}] = {0};`);
    } else {
      const cType = this.mapType(varType);
      const initVal = initialValue || this.getDefaultValue(varType);
      this.emit(`${cType} ${varName} = ${initVal};`);
    }
  }

  visitInput(node) {
    const varName = node.data.variable;
    // Assuming int input for simplicity
    this.emit(`scanf("%d", &${varName});`);
  }

  visitOutput(node) {
    const expr = node.data.expression;

    if (node.data.expressionAST) {
      const code = this.expressionToCode(node.data.expressionAST);
      this.emit(`printf("%d\\n", ${code});`);
    } else if (expr) {
      this.emit(`printf("%d\\n", ${expr});`);
    } else {
      this.emit('printf("\\n");');
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
      this.emit('return 0;');
    }
  }

  mapType(varType) {
    switch (varType) {
      case 'int':
        return 'int';
      case 'float':
        return 'float';
      case 'string':
        return 'char*';
      case 'bool':
        return 'int';
      default:
        return 'int';
    }
  }

  getDefaultValue(varType) {
    switch (varType) {
      case 'int':
      case 'float':
      case 'bool':
        return '0';
      case 'string':
        return 'NULL';
      default:
        return '0';
    }
  }
}

export default function generateC(ast) {
  const generator = new CGenerator(ast);
  return generator.generate();
}
