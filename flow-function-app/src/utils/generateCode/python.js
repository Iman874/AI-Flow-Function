/**
 * Python Code Generator - AST-based approach
 */

import { BaseCodeGenerator } from './BaseCodeGenerator.js';
import { FlowASTType } from '../FlowToAST.js';

class PythonGenerator extends BaseCodeGenerator {
  constructor(ast) {
    super(ast, { indentSize: 4 }); // Python uses 4 spaces
  }


  visitProgram(node) {
    // Generate all functions
    node.children.forEach(child => this.visit(child));

    // Find the main function or the first function to execute
    // Priority: 'main' -> first function found
    let funcToCall = null;
    let mainFound = false;

    // Check children for functions
    node.children.forEach(child => {
      if (child.type === FlowASTType.FUNCTION) {
        if (child.data.name === 'main' || child.data.name === 'Main') {
          funcToCall = child.data.name;
          mainFound = true;
        } else if (!funcToCall) {
          funcToCall = child.data.name;
        }
      }
    });

    if (funcToCall) {
      this.emitRaw('');
      this.emitRaw('if __name__ == "__main__":');
      this.scope.push();
      this.emit(`${funcToCall}()`);
      this.scope.pop();
    }
  }

  visitFunction(node) {
    const funcName = node.data.name || 'main';
    const params = node.data.parameters || [];

    // Generate parameter list
    const paramList = params.map(p => {
      if (p.type === 'array') {
        return p.name; // Python doesn't need type annotations for basic usage
      }
      return p.name;
    }).join(', ');

    this.emit(`def ${funcName}(${paramList}):`);
    this.scope.push();

    // Visit children (variables and body)
    node.children.forEach(child => this.visit(child));

    this.scope.pop();
    this.emitRaw(''); // Empty line after function
  }

  visitVariableDeclaration(node) {
    const varName = node.data.name;
    const varType = node.data.varType;
    const arraySize = node.data.arraySize;
    const initialValue = node.data.initialValue;

    if (varType === 'array') {
      // Python array initialization
      const size = arraySize || 10;
      this.emit(`${varName} = [0] * ${size}  # Array declaration`);
    } else {
      // Regular variable
      const initVal = initialValue || this.getDefaultValue(varType);
      this.emit(`${varName} = ${initVal}  # ${varType}`);
    }
  }

  visitInput(node) {
    const varName = node.data.variable;
    const prompt = node.data.prompt;

    if (prompt) {
      this.emit(`${varName} = input("${prompt}")`);
    } else {
      this.emit(`${varName} = input()`);
    }
  }

  visitOutput(node) {
    const expr = node.data.expression;

    if (node.data.expressionAST) {
      const code = this.expressionToCode(node.data.expressionAST);
      this.emit(`print(${code})`);
    } else if (expr) {
      this.emit(`print(${expr})`);
    } else {
      this.emit('print()');
    }
  }

  visitProcess(node) {
    const expr = node.data.expression;

    if (node.data.expressionAST) {
      const code = this.expressionToCode(node.data.expressionAST);
      this.emit(code);
    } else if (expr) {
      this.emit(`# Process: ${expr}`);
    }
  }

  visitIfStatement(node) {
    const condition = node.data.condition;

    // Generate condition code
    let condCode = condition;
    if (node.data.conditionAST) {
      condCode = this.expressionToCode(node.data.conditionAST);
    }

    this.emit(`if ${condCode}:`);
    this.scope.push();

    // Visit true branch (first child)
    if (node.children[0]) {
      this.visit(node.children[0]);
    } else {
      this.emit('pass');
    }

    this.scope.pop();

    // Visit false branch (second child) if exists
    if (node.children[1] && node.children[1].children.length > 0) {
      this.emit('else:');
      this.scope.push();
      this.visit(node.children[1]);
      this.scope.pop();
    }
  }

  visitLoop(node) {
    const loopType = node.data.loopType;
    const counterVar = node.data.counterVar || 'i';
    const startValue = node.data.startValue || 0;
    const endValue = node.data.endValue || 10;
    const step = node.data.step || 1;

    if (loopType === 'while' && node.data.condition) {
      // While loop
      let condCode = node.data.condition;
      if (node.data.conditionAST) {
        condCode = this.expressionToCode(node.data.conditionAST);
      }
      this.emit(`while ${condCode}:`);
    } else {
      // For loop
      if (step === 1) {
        this.emit(`for ${counterVar} in range(${startValue}, ${endValue}):`);
      } else {
        this.emit(`for ${counterVar} in range(${startValue}, ${endValue}, ${step}):`);
      }
    }

    this.scope.push();

    // Visit loop body
    if (node.children[0]) {
      this.visit(node.children[0]);
    } else {
      this.emit('pass');
    }

    this.scope.pop();
  }

  visitReturn(node) {
    const value = node.data.value;

    if (node.data.valueAST) {
      const code = this.expressionToCode(node.data.valueAST);
      this.emit(`return ${code}`);
    } else if (value) {
      this.emit(`return ${value}`);
    } else {
      this.emit('return');
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
        return 'False';
      default:
        return 'None';
    }
  }
}

export default function generatePython(ast) {
  const generator = new PythonGenerator(ast);
  return generator.generate();
}
