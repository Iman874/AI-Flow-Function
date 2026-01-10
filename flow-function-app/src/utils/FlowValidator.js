/**
 * FlowValidator - Validates flow graph before code generation
 */

export class ValidationError {
    constructor(type, message, nodeId = null) {
        this.type = type; // 'error' | 'warning'
        this.message = message;
        this.nodeId = nodeId;
    }
}

export class FlowValidator {
    constructor(nodes, edges) {
        this.nodes = nodes;
        this.edges = edges;
        this.errors = [];
        this.warnings = [];
    }

    validate() {
        this.errors = [];
        this.warnings = [];

        this.validateFunctionNode();
        this.validateConnections();
        this.validateNodeData();
        this.validateVariableUsage();
        this.checkCircularDependencies();

        return {
            isValid: this.errors.length === 0,
            errors: this.errors,
            warnings: this.warnings
        };
    }

    validateFunctionNode() {
        const functionNodes = this.nodes.filter(n => n.type === 'namefunction');

        if (functionNodes.length === 0) {
            this.errors.push(new ValidationError(
                'error',
                'No function node found. Every flow must start with a function node.'
            ));
        } else if (functionNodes.length > 1) {
            this.warnings.push(new ValidationError(
                'warning',
                'Multiple function nodes found. Only the first one will be used.',
                functionNodes[1].id
            ));
        }
    }

    validateConnections() {
        this.nodes.forEach(node => {
            // Check if nodes that require inputs have them
            const requiresInput = ['process', 'output', 'return', 'condition'];
            if (requiresInput.includes(node.type)) {
                const hasInput = this.edges.some(e => e.target === node.id);
                if (!hasInput) {
                    this.warnings.push(new ValidationError(
                        'warning',
                        `Node "${this.getNodeLabel(node)}" has no input connections`,
                        node.id
                    ));
                }
            }

            // Check if condition nodes have both true and false outputs (for if-else mode)
            if (node.type === 'condition' && node.data?.condType === 'if-else') {
                const trueEdge = this.edges.find(e => e.source === node.id && e.sourceHandle === 'trueOutput');
                const falseEdge = this.edges.find(e => e.source === node.id && e.sourceHandle === 'falseOutput');

                if (!trueEdge) {
                    this.warnings.push(new ValidationError(
                        'warning',
                        `Condition "${this.getNodeLabel(node)}" has no true branch`,
                        node.id
                    ));
                }
                if (!falseEdge) {
                    this.warnings.push(new ValidationError(
                        'warning',
                        `Condition "${this.getNodeLabel(node)}" has no false branch`,
                        node.id
                    ));
                }
            }
        });
    }

    validateNodeData() {
        this.nodes.forEach(node => {
            switch (node.type) {
                case 'variable':
                    if (!node.data?.name || node.data.name === 'unnamed') {
                        this.errors.push(new ValidationError(
                            'error',
                            'Variable node must have a name',
                            node.id
                        ));
                    }
                    if (!node.data?.varType) {
                        this.warnings.push(new ValidationError(
                            'warning',
                            `Variable "${node.data?.name}" has no type specified`,
                            node.id
                        ));
                    }
                    break;

                case 'namefunction':
                    if (!node.data?.name || node.data.name === 'unnamed') {
                        this.errors.push(new ValidationError(
                            'error',
                            'Function node must have a name',
                            node.id
                        ));
                    }
                    break;

                case 'process':
                    if (!node.data?.label && !node.data?.expression) {
                        this.warnings.push(new ValidationError(
                            'warning',
                            'Process node has no expression defined',
                            node.id
                        ));
                    }
                    break;

                case 'condition':
                    if (!node.data?.label && !node.data?.expression) {
                        this.warnings.push(new ValidationError(
                            'warning',
                            'Condition node has no expression defined',
                            node.id
                        ));
                    }
                    break;
            }
        });
    }

    validateVariableUsage() {
        const declaredVars = new Set();

        // Collect all declared variables
        this.nodes.forEach(node => {
            if (node.type === 'variable' && node.data?.name) {
                declaredVars.add(node.data.name);
            }
        });

        // Check if process/condition nodes reference undeclared variables
        this.nodes.forEach(node => {
            if (node.type === 'process' || node.type === 'condition') {
                const connectedVars = node.data?.connectedVariables || [];
                connectedVars.forEach(varName => {
                    if (!declaredVars.has(varName)) {
                        this.warnings.push(new ValidationError(
                            'warning',
                            `Node references undeclared variable "${varName}"`,
                            node.id
                        ));
                    }
                });
            }
        });
    }

    checkCircularDependencies() {
        const visited = new Set();
        const recursionStack = new Set();

        const hasCycle = (nodeId) => {
            if (!visited.has(nodeId)) {
                visited.add(nodeId);
                recursionStack.add(nodeId);

                // Only check control flow edges, not variable connection edges
                const outgoingEdges = this.edges.filter(e =>
                    e.source === nodeId &&
                    e.targetHandle !== 'varInput' &&
                    e.targetHandle !== 'defaultVarInput' &&
                    e.targetHandle !== 'conditionVarInput' &&
                    e.targetHandle !== 'counterVarInput'
                );

                for (const edge of outgoingEdges) {
                    if (!visited.has(edge.target) && hasCycle(edge.target)) {
                        return true;
                    } else if (recursionStack.has(edge.target)) {
                        return true;
                    }
                }
            }
            recursionStack.delete(nodeId);
            return false;
        };

        const functionNode = this.nodes.find(n => n.type === 'namefunction');
        if (functionNode && hasCycle(functionNode.id)) {
            this.errors.push(new ValidationError(
                'error',
                'Circular dependency detected in flow graph'
            ));
        }
    }

    getNodeLabel(node) {
        return node.data?.label || node.data?.name || node.data?.varName || node.type;
    }
}

export function validateFlow(nodes, edges) {
    const validator = new FlowValidator(nodes, edges);
    return validator.validate();
}
