/**
 * ExpressionParser - Parses expressions from process/condition nodes
 * Builds an AST for expressions to enable proper code generation
 */

// Token types
export const TokenType = {
    NUMBER: 'NUMBER',
    STRING: 'STRING',
    IDENTIFIER: 'IDENTIFIER',
    OPERATOR: 'OPERATOR',
    LPAREN: 'LPAREN',
    RPAREN: 'RPAREN',
    LBRACKET: 'LBRACKET',
    RBRACKET: 'RBRACKET',
    COMMA: 'COMMA',
    DOT: 'DOT',
    EOF: 'EOF'
};

// AST Node types
export const ASTNodeType = {
    LITERAL: 'LITERAL',
    IDENTIFIER: 'IDENTIFIER',
    BINARY_OP: 'BINARY_OP',
    UNARY_OP: 'UNARY_OP',
    ARRAY_ACCESS: 'ARRAY_ACCESS',
    FUNCTION_CALL: 'FUNCTION_CALL',
    ASSIGNMENT: 'ASSIGNMENT'
};

class Token {
    constructor(type, value, position = 0) {
        this.type = type;
        this.value = value;
        this.position = position;
    }
}

class ASTNode {
    constructor(type, value = null, children = []) {
        this.type = type;
        this.value = value;
        this.children = children;
    }
}

export class ExpressionParser {
    constructor(expression) {
        this.expression = expression || '';
        this.tokens = [];
        this.position = 0;
    }

    // Tokenize the expression
    tokenize() {
        const tokens = [];
        let i = 0;
        const expr = this.expression.trim();

        while (i < expr.length) {
            const char = expr[i];

            // Skip whitespace
            if (/\s/.test(char)) {
                i++;
                continue;
            }

            // Numbers
            if (/\d/.test(char)) {
                let num = '';
                while (i < expr.length && /[\d.]/.test(expr[i])) {
                    num += expr[i];
                    i++;
                }
                tokens.push(new Token(TokenType.NUMBER, parseFloat(num), i));
                continue;
            }

            // Strings
            if (char === '"' || char === "'") {
                const quote = char;
                let str = '';
                i++; // skip opening quote
                while (i < expr.length && expr[i] !== quote) {
                    str += expr[i];
                    i++;
                }
                i++; // skip closing quote
                tokens.push(new Token(TokenType.STRING, str, i));
                continue;
            }

            // Identifiers
            if (/[a-zA-Z_]/.test(char)) {
                let ident = '';
                while (i < expr.length && /[a-zA-Z0-9_]/.test(expr[i])) {
                    ident += expr[i];
                    i++;
                }
                tokens.push(new Token(TokenType.IDENTIFIER, ident, i));
                continue;
            }

            // Operators
            if ('+-*/%=<>!&|'.includes(char)) {
                let op = char;
                i++;
                // Check for two-character operators
                if (i < expr.length && '=&|'.includes(expr[i])) {
                    op += expr[i];
                    i++;
                }
                tokens.push(new Token(TokenType.OPERATOR, op, i));
                continue;
            }

            // Parentheses and brackets
            if (char === '(') {
                tokens.push(new Token(TokenType.LPAREN, char, i));
                i++;
                continue;
            }
            if (char === ')') {
                tokens.push(new Token(TokenType.RPAREN, char, i));
                i++;
                continue;
            }
            if (char === '[') {
                tokens.push(new Token(TokenType.LBRACKET, char, i));
                i++;
                continue;
            }
            if (char === ']') {
                tokens.push(new Token(TokenType.RBRACKET, char, i));
                i++;
                continue;
            }
            if (char === ',') {
                tokens.push(new Token(TokenType.COMMA, char, i));
                i++;
                continue;
            }
            if (char === '.') {
                tokens.push(new Token(TokenType.DOT, char, i));
                i++;
                continue;
            }

            // Unknown character, skip it
            i++;
        }

        tokens.push(new Token(TokenType.EOF, null, i));
        this.tokens = tokens;
        return tokens;
    }

    // Parse tokens into AST
    parse() {
        this.tokenize();
        this.position = 0;
        return this.parseExpression();
    }

    currentToken() {
        return this.tokens[this.position] || new Token(TokenType.EOF, null);
    }

    advance() {
        this.position++;
    }

    // Parse expression (handles assignment and binary operations)
    parseExpression() {
        return this.parseAssignment();
    }

    parseAssignment() {
        let left = this.parseLogicalOr();

        if (this.currentToken().type === TokenType.OPERATOR && this.currentToken().value === '=') {
            this.advance();
            const right = this.parseAssignment();
            return new ASTNode(ASTNodeType.ASSIGNMENT, '=', [left, right]);
        }

        return left;
    }

    parseLogicalOr() {
        let left = this.parseLogicalAnd();

        while (this.currentToken().type === TokenType.OPERATOR && this.currentToken().value === '||') {
            const op = this.currentToken().value;
            this.advance();
            const right = this.parseLogicalAnd();
            left = new ASTNode(ASTNodeType.BINARY_OP, op, [left, right]);
        }

        return left;
    }

    parseLogicalAnd() {
        let left = this.parseEquality();

        while (this.currentToken().type === TokenType.OPERATOR && this.currentToken().value === '&&') {
            const op = this.currentToken().value;
            this.advance();
            const right = this.parseEquality();
            left = new ASTNode(ASTNodeType.BINARY_OP, op, [left, right]);
        }

        return left;
    }

    parseEquality() {
        let left = this.parseComparison();

        while (this.currentToken().type === TokenType.OPERATOR && ['==', '!='].includes(this.currentToken().value)) {
            const op = this.currentToken().value;
            this.advance();
            const right = this.parseComparison();
            left = new ASTNode(ASTNodeType.BINARY_OP, op, [left, right]);
        }

        return left;
    }

    parseComparison() {
        let left = this.parseAdditive();

        while (this.currentToken().type === TokenType.OPERATOR && ['<', '>', '<=', '>='].includes(this.currentToken().value)) {
            const op = this.currentToken().value;
            this.advance();
            const right = this.parseAdditive();
            left = new ASTNode(ASTNodeType.BINARY_OP, op, [left, right]);
        }

        return left;
    }

    parseAdditive() {
        let left = this.parseMultiplicative();

        while (this.currentToken().type === TokenType.OPERATOR && ['+', '-'].includes(this.currentToken().value)) {
            const op = this.currentToken().value;
            this.advance();
            const right = this.parseMultiplicative();
            left = new ASTNode(ASTNodeType.BINARY_OP, op, [left, right]);
        }

        return left;
    }

    parseMultiplicative() {
        let left = this.parseUnary();

        while (this.currentToken().type === TokenType.OPERATOR && ['*', '/', '%'].includes(this.currentToken().value)) {
            const op = this.currentToken().value;
            this.advance();
            const right = this.parseUnary();
            left = new ASTNode(ASTNodeType.BINARY_OP, op, [left, right]);
        }

        return left;
    }

    parseUnary() {
        if (this.currentToken().type === TokenType.OPERATOR && ['+', '-', '!'].includes(this.currentToken().value)) {
            const op = this.currentToken().value;
            this.advance();
            const operand = this.parseUnary();
            return new ASTNode(ASTNodeType.UNARY_OP, op, [operand]);
        }

        return this.parsePostfix();
    }

    parsePostfix() {
        let left = this.parsePrimary();

        while (true) {
            // Array access: arr[index]
            if (this.currentToken().type === TokenType.LBRACKET) {
                this.advance();
                const index = this.parseExpression();
                if (this.currentToken().type !== TokenType.RBRACKET) {
                    throw new Error('Expected ]');
                }
                this.advance();
                left = new ASTNode(ASTNodeType.ARRAY_ACCESS, null, [left, index]);
            }
            // Function call: func(args)
            else if (this.currentToken().type === TokenType.LPAREN) {
                this.advance();
                const args = [];
                while (this.currentToken().type !== TokenType.RPAREN && this.currentToken().type !== TokenType.EOF) {
                    args.push(this.parseExpression());
                    if (this.currentToken().type === TokenType.COMMA) {
                        this.advance();
                    }
                }
                if (this.currentToken().type !== TokenType.RPAREN) {
                    throw new Error('Expected )');
                }
                this.advance();
                left = new ASTNode(ASTNodeType.FUNCTION_CALL, null, [left, ...args]);
            } else {
                break;
            }
        }

        return left;
    }

    parsePrimary() {
        const token = this.currentToken();

        // Number literal
        if (token.type === TokenType.NUMBER) {
            this.advance();
            return new ASTNode(ASTNodeType.LITERAL, token.value);
        }

        // String literal
        if (token.type === TokenType.STRING) {
            this.advance();
            return new ASTNode(ASTNodeType.LITERAL, `"${token.value}"`);
        }

        // Identifier
        if (token.type === TokenType.IDENTIFIER) {
            this.advance();
            return new ASTNode(ASTNodeType.IDENTIFIER, token.value);
        }

        // Parenthesized expression
        if (token.type === TokenType.LPAREN) {
            this.advance();
            const expr = this.parseExpression();
            if (this.currentToken().type !== TokenType.RPAREN) {
                throw new Error('Expected )');
            }
            this.advance();
            return expr;
        }

        // Empty expression
        if (token.type === TokenType.EOF) {
            return new ASTNode(ASTNodeType.LITERAL, null);
        }

        throw new Error(`Unexpected token: ${token.type} at position ${token.position}`);
    }
}

// Helper function to parse expression
export function parseExpression(expression) {
    try {
        const parser = new ExpressionParser(expression);
        return parser.parse();
    } catch (error) {
        console.error('Expression parsing error:', error);
        // Return a simple identifier node as fallback
        return new ASTNode(ASTNodeType.IDENTIFIER, expression || 'unknown');
    }
}
