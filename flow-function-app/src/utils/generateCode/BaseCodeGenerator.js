/**
 * Base Code Generator - Provides common utilities for all language generators
 */

import { FlowASTType } from '../FlowToAST.js';
import { ASTNodeType } from '../ExpressionParser.js';

export class ScopeStack {
    constructor() {
        this.stack = [0]; // Start with base indentation
    }

    push() {
        const current = this.stack[this.stack.length - 1];
        this.stack.push(current + 1);
    }

    pop() {
        if (this.stack.length > 1) {
            this.stack.pop();
        }
    }

    current() {
        return this.stack[this.stack.length - 1];
    }

    indent(spacesPerLevel = 2) {
        return ' '.repeat(this.current() * spacesPerLevel);
    }
}

export class BaseCodeGenerator {
    constructor(ast, config = {}) {
        this.ast = ast;
        this.config = {
            indentSize: 2,
            ...config
        };
        this.scope = new ScopeStack();
        this.output = [];
    }

    generate() {
        this.output = [];
        this.visitProgram(this.ast);
        return this.output.join('\n');
    }

    visitProgram(node) {
        node.children.forEach(child => this.visit(child));
    }

    visit(node) {
        if (!node) return;

        switch (node.type) {
            case FlowASTType.FUNCTION:
                this.visitFunction(node);
                break;
            case FlowASTType.VARIABLE_DECLARATION:
                this.visitVariableDeclaration(node);
                break;
            case FlowASTType.INPUT:
                this.visitInput(node);
                break;
            case FlowASTType.OUTPUT:
                this.visitOutput(node);
                break;
            case FlowASTType.PROCESS:
                this.visitProcess(node);
                break;
            case FlowASTType.IF_STATEMENT:
                this.visitIfStatement(node);
                break;
            case FlowASTType.LOOP:
                this.visitLoop(node);
                break;
            case FlowASTType.RETURN:
                this.visitReturn(node);
                break;
            case FlowASTType.BLOCK:
                this.visitBlock(node);
                break;
            default:
                console.warn('Unknown AST node type:', node.type);
        }
    }

    visitBlock(node) {
        node.children.forEach(child => this.visit(child));
    }

    // Expression AST to code conversion
    expressionToCode(exprAST) {
        if (!exprAST) return '';

        switch (exprAST.type) {
            case ASTNodeType.LITERAL:
                return String(exprAST.value);

            case ASTNodeType.IDENTIFIER:
                return exprAST.value;

            case ASTNodeType.BINARY_OP:
                const left = this.expressionToCode(exprAST.children[0]);
                const right = this.expressionToCode(exprAST.children[1]);
                return `${left} ${exprAST.value} ${right}`;

            case ASTNodeType.UNARY_OP:
                const operand = this.expressionToCode(exprAST.children[0]);
                return `${exprAST.value}${operand}`;

            case ASTNodeType.ARRAY_ACCESS:
                const array = this.expressionToCode(exprAST.children[0]);
                const index = this.expressionToCode(exprAST.children[1]);
                return `${array}[${index}]`;

            case ASTNodeType.FUNCTION_CALL:
                const func = this.expressionToCode(exprAST.children[0]);
                const args = exprAST.children.slice(1).map(arg => this.expressionToCode(arg)).join(', ');
                return `${func}(${args})`;

            case ASTNodeType.ASSIGNMENT:
                const target = this.expressionToCode(exprAST.children[0]);
                const value = this.expressionToCode(exprAST.children[1]);
                return `${target} = ${value}`;

            default:
                return '';
        }
    }

    emit(line) {
        this.output.push(this.scope.indent(this.config.indentSize) + line);
    }

    emitRaw(line) {
        this.output.push(line);
    }

    // These methods should be overridden by language-specific generators
    visitFunction(node) { throw new Error('visitFunction must be implemented'); }
    visitVariableDeclaration(node) { throw new Error('visitVariableDeclaration must be implemented'); }
    visitInput(node) { throw new Error('visitInput must be implemented'); }
    visitOutput(node) { throw new Error('visitOutput must be implemented'); }
    visitProcess(node) { throw new Error('visitProcess must be implemented'); }
    visitIfStatement(node) { throw new Error('visitIfStatement must be implemented'); }
    visitLoop(node) { throw new Error('visitLoop must be implemented'); }
    visitReturn(node) { throw new Error('visitReturn must be implemented'); }
}
