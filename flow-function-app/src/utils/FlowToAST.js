/**
 * FlowToAST - Converts ReactFlow graph to intermediate AST representation
 * This AST is used by all language generators for consistent code generation
 */

import { parseExpression, ASTNodeType } from './ExpressionParser.js';

// Flow AST Node Types
export const FlowASTType = {
    PROGRAM: 'PROGRAM',
    FUNCTION: 'FUNCTION',
    VARIABLE_DECLARATION: 'VARIABLE_DECLARATION',
    INPUT: 'INPUT',
    OUTPUT: 'OUTPUT',
    PROCESS: 'PROCESS',
    IF_STATEMENT: 'IF_STATEMENT',
    ELSE_STATEMENT: 'ELSE_STATEMENT',
    LOOP: 'LOOP',
    RETURN: 'RETURN',
    BLOCK: 'BLOCK'
};

export class FlowASTNode {
    constructor(type, data = {}) {
        this.type = type;
        this.data = data;
        this.children = [];
    }

    addChild(child) {
        this.children.push(child);
        return this;
    }
}

export class FlowToAST {
    constructor(nodes, edges) {
        this.nodes = nodes;
        this.edges = edges;
        this.visited = new Set();
        this.variableMap = new Map(); // Track variable types and metadata
    }

    convert() {
        // Find the function node (entry point)
        const functionNode = this.nodes.find(n => n.type === 'namefunction');
        if (!functionNode) {
            throw new Error('No function node found');
        }

        // Create program root
        const program = new FlowASTNode(FlowASTType.PROGRAM);

        // Convert function
        const funcAST = this.convertFunction(functionNode);
        program.addChild(funcAST);

        return program;
    }

    convertFunction(node) {
        const funcName = node.data?.name || 'main';
        const parameters = node.data?.connectedVariableDetails || [];

        console.log('[FlowToAST] Converting function:', funcName);
        console.log('[FlowToAST] Function node:', node);

        const funcAST = new FlowASTNode(FlowASTType.FUNCTION, {
            name: funcName,
            parameters: parameters.map(p => ({
                name: p.name,
                type: p.type,
                arraySize: p.arraySize,
                arrayDims: p.arrayDims
            })),
            returnType: node.data?.returnType || 'void'
        });

        // Mark as visited
        this.visited.add(node.id);

        // Find all variable nodes connected to this function
        const varEdges = this.edges.filter(e =>
            e.source === node.id ||
            (e.target === node.id && e.targetHandle === 'varInput')
        );

        console.log('[FlowToAST] Variable edges from function:', varEdges);

        // Process variables first
        varEdges.forEach(edge => {
            const varNode = this.nodes.find(n => n.id === edge.source || n.id === edge.target);
            if (varNode && varNode.type === 'variable' && !this.visited.has(varNode.id)) {
                console.log('[FlowToAST] Converting variable:', varNode.data?.name || varNode.data?.varName);
                const varAST = this.convertVariable(varNode);
                funcAST.addChild(varAST);
                this.visited.add(varNode.id);
            }
        });

        // Find the main flow starting point (skip variable nodes)
        // Variables are already processed above, we need to find first non-variable node
        let nextNode = this.getNextNode(node.id);

        // Skip variable nodes - they're already added as declarations
        while (nextNode && nextNode.type === 'variable') {
            console.log('[FlowToAST] Skipping variable node:', nextNode.data?.name || nextNode.data?.varName);
            this.visited.add(nextNode.id); // Mark as visited to avoid re-processing
            nextNode = this.getNextNode(nextNode.id);
        }

        console.log('[FlowToAST] First non-variable node after function:', nextNode);

        if (nextNode) {
            const bodyAST = this.convertNode(nextNode);
            if (bodyAST) {
                console.log('[FlowToAST] Body AST created:', bodyAST.type);
                funcAST.addChild(bodyAST);
            } else {
                console.warn('[FlowToAST] Body AST is null');
            }
        } else {
            console.warn('[FlowToAST] No next node found after function');
        }

        console.log('[FlowToAST] Function AST children count:', funcAST.children.length);
        return funcAST;
    }

    convertVariable(node) {
        const varName = node.data?.name || node.data?.varName || 'unnamed';
        const varType = node.data?.varType || 'int';
        const arraySize = node.data?.arraySize;
        const arrayDims = node.data?.arrayDims || 1;
        const initialValue = node.data?.initialValue;

        // Store in variable map for later reference
        this.variableMap.set(varName, {
            type: varType,
            arraySize,
            arrayDims,
            initialValue
        });

        return new FlowASTNode(FlowASTType.VARIABLE_DECLARATION, {
            name: varName,
            varType,
            arraySize,
            arrayDims,
            initialValue
        });
    }

    convertNode(node) {
        if (!node || this.visited.has(node.id)) {
            return null;
        }

        this.visited.add(node.id);

        switch (node.type) {
            case 'input':
                return this.convertInput(node);
            case 'output':
                return this.convertOutput(node);
            case 'process':
                return this.convertProcess(node);
            case 'condition':
                return this.convertCondition(node);
            case 'loop':
                return this.convertLoop(node);
            case 'return':
                return this.convertReturn(node);
            case 'variable':
                return this.convertVariable(node);
            default:
                // For unknown types, try to continue the flow
                const next = this.getNextNode(node.id);
                return next ? this.convertNode(next) : null;
        }
    }

    convertInput(node) {
        const varName = node.data?.varName || node.data?.label || 'input';

        const inputAST = new FlowASTNode(FlowASTType.INPUT, {
            variable: varName,
            prompt: node.data?.prompt || ''
        });

        // Continue to next node
        const next = this.getNextNode(node.id);
        if (next) {
            const nextAST = this.convertNode(next);
            if (nextAST) {
                // Return a block containing both
                const block = new FlowASTNode(FlowASTType.BLOCK);
                block.addChild(inputAST);
                block.addChild(nextAST);
                return block;
            }
        }

        return inputAST;
    }

    convertOutput(node) {
        const expression = node.data?.label || node.data?.expression || '';
        const connectedVars = node.data?.connectedVariables || [];

        // If we have connected variables, use them
        const outputExpr = connectedVars.length > 0 ? connectedVars.join(', ') : expression;

        const outputAST = new FlowASTNode(FlowASTType.OUTPUT, {
            expression: outputExpr,
            expressionAST: parseExpression(outputExpr)
        });

        // Continue to next node
        const next = this.getNextNode(node.id);
        if (next) {
            const nextAST = this.convertNode(next);
            if (nextAST) {
                const block = new FlowASTNode(FlowASTType.BLOCK);
                block.addChild(outputAST);
                block.addChild(nextAST);
                return block;
            }
        }

        return outputAST;
    }

    convertProcess(node) {
        const expression = node.data?.label || node.data?.expression || '';
        const connectedVars = node.data?.connectedVariables || [];

        // Build expression using connected variables if available
        let processExpr = expression;
        if (connectedVars.length > 0 && !expression) {
            processExpr = connectedVars.join(' + '); // Default to addition
        }

        const processAST = new FlowASTNode(FlowASTType.PROCESS, {
            expression: processExpr,
            expressionAST: parseExpression(processExpr),
            connectedVariables: connectedVars
        });

        // Continue to next node
        const next = this.getNextNode(node.id);
        if (next) {
            const nextAST = this.convertNode(next);
            if (nextAST) {
                const block = new FlowASTNode(FlowASTType.BLOCK);
                block.addChild(processAST);
                block.addChild(nextAST);
                return block;
            }
        }

        return processAST;
    }

    convertCondition(node) {
        const condition = node.data?.label || node.data?.expression || 'true';
        const condType = node.data?.condType || 'if-else';
        const connectedVars = node.data?.connectedVariables || [];

        const ifAST = new FlowASTNode(FlowASTType.IF_STATEMENT, {
            condition,
            conditionAST: parseExpression(condition),
            connectedVariables: connectedVars,
            mode: condType
        });

        // Get true branch
        const trueNode = this.getNextNode(node.id, 'trueOutput');
        if (trueNode) {
            const trueBlock = new FlowASTNode(FlowASTType.BLOCK);
            const trueBranch = this.convertBranch(trueNode);
            if (trueBranch) {
                trueBranch.forEach(stmt => trueBlock.addChild(stmt));
            }
            ifAST.addChild(trueBlock);
        }

        // Get false branch (if if-else mode)
        if (condType === 'if-else') {
            const falseNode = this.getNextNode(node.id, 'falseOutput');
            if (falseNode) {
                const elseBlock = new FlowASTNode(FlowASTType.BLOCK);
                const falseBranch = this.convertBranch(falseNode);
                if (falseBranch) {
                    falseBranch.forEach(stmt => elseBlock.addChild(stmt));
                }
                ifAST.addChild(elseBlock);
            }
        }

        // Continue after the if statement (if there's a merge point)
        // For now, we'll handle this in the branch conversion

        return ifAST;
    }

    convertBranch(startNode) {
        const statements = [];
        let current = startNode;
        const branchVisited = new Set();

        while (current && !branchVisited.has(current.id)) {
            branchVisited.add(current.id);

            // Stop at else node or return
            if (current.type === 'else') {
                break;
            }

            if (current.type === 'return') {
                statements.push(this.convertReturn(current));
                break;
            }

            // Mark as visited globally
            this.visited.add(current.id);

            const stmt = this.convertNodeSingle(current);
            if (stmt) {
                statements.push(stmt);
            }

            // For condition nodes, don't continue linearly
            if (current.type === 'condition') {
                break;
            }

            current = this.getNextNode(current.id);
        }

        return statements;
    }

    convertNodeSingle(node) {
        // Convert a single node without following to next
        switch (node.type) {
            case 'input':
                return new FlowASTNode(FlowASTType.INPUT, {
                    variable: node.data?.varName || node.data?.label || 'input',
                    prompt: node.data?.prompt || ''
                });
            case 'output':
                const outExpr = (node.data?.connectedVariables || []).join(', ') || node.data?.label || '';
                return new FlowASTNode(FlowASTType.OUTPUT, {
                    expression: outExpr,
                    expressionAST: parseExpression(outExpr)
                });
            case 'process':
                const procExpr = node.data?.label || node.data?.expression || '';
                return new FlowASTNode(FlowASTType.PROCESS, {
                    expression: procExpr,
                    expressionAST: parseExpression(procExpr),
                    connectedVariables: node.data?.connectedVariables || []
                });
            case 'condition':
                return this.convertCondition(node);
            case 'loop':
                return this.convertLoop(node);
            case 'return':
                return this.convertReturn(node);
            default:
                return null;
        }
    }

    convertLoop(node) {
        const loopType = node.data?.loopType || 'for';
        const condition = node.data?.label || node.data?.condition || '';
        const counterVar = node.data?.connectedVariables?.[0] || 'i';
        const startValue = node.data?.startValue || 0;
        const endValue = node.data?.endValue || 10;
        const step = node.data?.step || 1;

        const loopAST = new FlowASTNode(FlowASTType.LOOP, {
            loopType,
            counterVar,
            startValue,
            endValue,
            step,
            condition,
            conditionAST: parseExpression(condition)
        });

        // Get loop body
        const bodyNode = this.getNextNode(node.id, 'loopBody');
        if (bodyNode) {
            const bodyBlock = new FlowASTNode(FlowASTType.BLOCK);
            const bodyStatements = this.convertBranch(bodyNode);
            if (bodyStatements) {
                bodyStatements.forEach(stmt => bodyBlock.addChild(stmt));
            }
            loopAST.addChild(bodyBlock);
        }

        return loopAST;
    }

    convertReturn(node) {
        const value = node.data?.label || node.data?.value || '';

        return new FlowASTNode(FlowASTType.RETURN, {
            value,
            valueAST: value ? parseExpression(value) : null
        });
    }

    getNextNode(nodeId, handleId = null) {
        const outgoingEdges = handleId
            ? this.edges.filter(e => e.source === nodeId && e.sourceHandle === handleId)
            : this.edges.filter(e =>
                e.source === nodeId &&
                // Exclude variable connection edges (data flow, not control flow)
                e.targetHandle !== 'varInput' &&
                e.targetHandle !== 'defaultVarInput' &&
                e.targetHandle !== 'conditionVarInput' &&
                e.targetHandle !== 'counterVarInput'
            );

        if (outgoingEdges.length === 0) return null;

        const edge = outgoingEdges[0];
        return this.nodes.find(n => n.id === edge.target);
    }
}

// Helper function to convert flow to AST
export function flowToAST(nodes, edges) {
    const converter = new FlowToAST(nodes, edges);
    return converter.convert();
}
