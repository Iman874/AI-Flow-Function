/**
 * C# Code Generator - AST-based approach
 */

import { BaseCodeGenerator } from './BaseCodeGenerator.js';
import { FlowASTType } from '../FlowToAST.js';

class CSharpGenerator extends BaseCodeGenerator {
  constructor(ast) {
    super(ast, { indentSize: 4 });
  }

  generate() {
    this.output = [];

    // Add namespace and class wrapper
    this.emitRaw('using System;');
    this.emitRaw('');
    this.emitRaw('class Program {');
    this.scope.push();

    // Generate code
    this.visitProgram(this.ast);

    this.scope.pop();
    this.emitRaw('}');

    return this.output.join('\n');
  }

  visitFunction(node) {
    const funcName = node.data.name || 'Main';
    const params = node.data.parameters || [];
    const returnType = node.data.returnType || 'void';

    const paramList = params.map(p => {
      const type = this.mapType(p.type);
      if (p.type === 'array') {
        return `${type}[] ${p.name}`;
      }
      return `${type} ${p.name}`;
    }).join(', ');

    const finalParams = funcName === 'Main' ? 'string[] args' : paramList;
    this.emit(`static ${returnType} ${funcName}(${finalParams}) {`);
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
      this.emit(`int[] ${varName} = new int[${size}];`);
    } else {
      const csType = this.mapType(varType);
      const initVal = initialValue || this.getDefaultValue(varType);
      this.emit(`${csType} ${varName} = ${initVal};`);
    }
  }

  visitInput(node) {
    const varName = node.data.variable;
    this.emit(`${varName} = Console.ReadLine();`);
  }

  visitOutput(node) {
    const expr = node.data.expression;

    if (node.data.expressionAST) {
      const code = this.expressionToCode(node.data.expressionAST);
      this.emit(`Console.WriteLine(${code});`);
    } else if (expr) {
      this.emit(`Console.WriteLine(${expr});`);
    } else {
      this.emit('Console.WriteLine();');
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

export default function generateCSharp(ast) {
  const generator = new CSharpGenerator(ast);
  return generator.generate();
}
