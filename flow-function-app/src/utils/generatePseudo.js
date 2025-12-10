// Utility to generate pseudocode from ReactFlow graph

function findStartNode(nodes) {
  return nodes.find(n => n.type === 'namefunction');
}

function getOutgoingEdges(nodeId, edges) {
  return edges.filter(e => e.source === nodeId);
}

function getNextNode(currentNode, edges, nodes) {
  // Find the next node(s) connected from currentNode
  const outgoing = getOutgoingEdges(currentNode.id, edges);
  // For simplicity, follow the first outgoing edge (top-to-bottom)
  if (outgoing.length === 0) return null;
  const nextEdge = outgoing[0];
  return nodes.find(n => n.id === nextEdge.target) || null;
}

function walkFlow(nodes, edges, startNode) {
  const visited = new Set();
  const result = [];
  let current = startNode;
  while (current && !visited.has(current.id)) {
    visited.add(current.id);
    result.push(current);
    current = getNextNode(current, edges, nodes);
  }
  return result;
}

function nodeToPseudo(node) {
  switch (node.type) {
    case 'variable':
      return `DECLARE ${node.data?.name || 'var'}`;
    case 'process':
      return node.data?.label || 'PROCESS';
    case 'condition':
      return `IF ${node.data?.comparison || 'condition'}`;
    case 'loop':
      return `LOOP (${node.data?.label || 'loop'})`;
    case 'return':
      return `RETURN ${node.data?.value || ''}`;
    case 'namefunction':
      return `FUNCTION ${node.data?.name || 'func'}`;
    case 'parameter':
      return `PARAM ${node.data?.name || 'param'}`;
    case 'else':
      return 'ELSE';
    case 'if':
      return 'IF';
    case 'input':
      return `READ ${node.data?.name || 'variable'}`;
    case 'output':
      return `PRINT ${node.data?.name || 'variable'}`;
    default:
      return node.type.toUpperCase();
  }
}

export function generatePseudo(nodes, edges) {
  const startNode = findStartNode(nodes);
  if (!startNode) return [];
  const flowNodes = walkFlow(nodes, edges, startNode);
  const lines = flowNodes.map(nodeToPseudo);
  return lines;
}
