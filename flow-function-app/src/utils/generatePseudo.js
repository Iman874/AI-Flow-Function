// Utility to generate pseudocode from ReactFlow graph
// Improved: Handle IF-ELSE branching, proper variable names, complete flow

function findStartNode(nodes) {
  return nodes.find(n => n.type === 'namefunction');
}

function getOutgoingEdges(nodeId, edges, handleId = null) {
  if (handleId) {
    return edges.filter(e => e.source === nodeId && e.sourceHandle === handleId);
  }
  return edges.filter(e => e.source === nodeId);
}

function getNextNode(nodeId, edges, nodes, handleId = null) {
  const outgoing = getOutgoingEdges(nodeId, edges, handleId);
  if (outgoing.length === 0) return null;
  const nextEdge = outgoing[0];
  return nodes.find(n => n.id === nextEdge.target) || null;
}

function getNodeLabel(node) {
  return node.data?.label || node.data?.varName || node.data?.name || 'unknown';
}

function nodeToPseudo(node) {
  const label = getNodeLabel(node);
  
  switch (node.type) {
    case 'namefunction':
      return `FUNCTION ${label}`;
    case 'variable':
      return `DECLARE ${label}`;
    case 'input':
      return `READ ${label}`;
    case 'output':
      return `PRINT ${label}`;
    case 'process':
      return `PROCESS ${label}`;
    case 'condition':
      // Include condition type info
      const condType = node.data?.condType || 'if-else';
      return `IF ${label} [${condType}]`;
    case 'if':
      return 'IF_BRANCH';
    case 'else':
      return 'ELSE';
    case 'loop':
      return `LOOP ${label}`;
    case 'return':
      return `RETURN ${label || ''}`;
    case 'parameter':
      return `PARAM ${label}`;
    default:
      return `${node.type.toUpperCase()} ${label}`;
  }
}

function walkFlowWithBranching(nodes, edges, startNode) {
  const visited = new Set();
  const result = [];
  
  function traverse(current, depth = 0) {
    if (!current || visited.has(current.id)) return;
    visited.add(current.id);
    result.push(current);
    
    // Check if this is a condition node
    if (current.type === 'condition') {
      const condType = current.data?.condType || 'if-else';
      
      // For if-only mode, only follow true branch
      if (condType === 'if-only') {
        const trueNext = getNextNode(current.id, edges, nodes, 'trueOutput');
        if (trueNext) traverse(trueNext, depth + 1);
      } 
      // For if-else mode, follow true and false branches
      else if (condType === 'if-else') {
        // True branch
        const trueNext = getNextNode(current.id, edges, nodes, 'trueOutput');
        const truePath = [];
        let trueCurrent = trueNext;
        while (trueCurrent && !visited.has(trueCurrent.id)) {
          truePath.push(trueCurrent);
          visited.add(trueCurrent.id);
          // Stop at condition/return/else
          if (['condition', 'else', 'return'].includes(trueCurrent.type)) break;
          trueCurrent = getNextNode(trueCurrent.id, edges, nodes);
        }
        result.push(...truePath);
        
        // False branch (ELSE)
        const falseNext = getNextNode(current.id, edges, nodes, 'falseOutput');
        if (falseNext) traverse(falseNext, depth + 1);
      }
    } else if (current.type === 'else') {
      // Continue after ELSE
      const nextAfterElse = getNextNode(current.id, edges, nodes);
      if (nextAfterElse) traverse(nextAfterElse, depth + 1);
    } else if (current.type !== 'return') {
      // Normal flow for non-return nodes
      const next = getNextNode(current.id, edges, nodes);
      if (next) traverse(next, depth + 1);
    }
  }
  
  traverse(startNode);
  return result;
}

export function generatePseudo(nodes, edges) {
  const startNode = findStartNode(nodes);
  if (!startNode) {
    console.warn('No namefunction node found');
    return [];
  }
  
  const flowNodes = walkFlowWithBranching(nodes, edges, startNode);
  console.log('Flow nodes:', flowNodes.map(n => ({ id: n.id, type: n.type, label: getNodeLabel(n) })));
  
  const lines = flowNodes.map(nodeToPseudo);
  return lines;
}
