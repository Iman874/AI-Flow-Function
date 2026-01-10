/**
 * JavaScript Code Generator - AST-based approach
 */

import { BaseCodeGenerator } from './BaseCodeGenerator.js';
import { FlowASTType } from '../FlowToAST.js';

class JavaScriptGenerator extends BaseCodeGenerator {
  constructor(ast) {
    super(ast, { indentSize: 2 });
  }

  visitFunction(node) {
    const funcName = node.data.name || 'main';
    const params = node.data.parameters || [];

    const paramList = params.map(p => p.name).join(', ');

    this.emit(`function ${funcName}(${paramList}) {`);
    this.scope.push();

    node.children.forEach(child => this.visit(child));

    this.scope.pop();
    this.emit('}');
    this.emitRaw('');
  }

  visitVariableDeclaration(node) {
    const varName = node.data.name;
    const varType = node.data.varType;
    const arraySize = node.data.arraySize;
    const initialValue = node.data.initialValue;

    if (varType === 'array') {
      const size = arraySize || 10;
      this.emit(`let ${varName} = new Array(${size}).fill(0);`);
    } else {
      const initVal = initialValue || this.getDefaultValue(varType);
      this.emit(`let ${varName} = ${initVal};`);
    }
  }

  visitInput(node) {
    const varName = node.data.variable;
    const prompt = node.data.prompt;

    if (prompt) {
      this.emit(`let ${varName} = prompt("${prompt}");`);
    } else {
      this.emit(`let ${varName} = prompt();`);
    }
  }

  visitOutput(node) {
    const expr = node.data.expression;

    if (node.data.expressionAST) {
      const code = this.expressionToCode(node.data.expressionAST);
      this.emit(`console.log(${code});`);
    } else if (expr) {
      this.emit(`console.log(${expr});`);
    } else {
      this.emit('console.log();');
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
      this.emit(`for (let ${counterVar} = ${startValue}; ${counterVar} < ${endValue}; ${stepOp}) {`);
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
        return 'null';
    }
  }
}

export default function generateJavaScript(ast) {
  const generator = new JavaScriptGenerator(ast);
  return generator.generate();
}
