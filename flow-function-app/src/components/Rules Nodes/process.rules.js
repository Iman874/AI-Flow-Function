export default function processRule(params, nodes) {
  const { sourceNode, targetNode, sourceHandle, targetHandle } = params;
  if (sourceNode?.type === 'process' && sourceHandle === 'bottomOutput') {
    if (!((targetNode?.type === 'condition' || targetNode?.type === 'loop') && targetHandle === 'input')) {
      return false;
    }
  }
  if (targetNode?.type === 'process' && targetHandle === 'topInput') {
    if (sourceNode?.type !== 'parameter') {
      return false;
    }
  }
  if (targetNode?.type === 'process' && targetHandle === 'varInput') {
    if (sourceNode?.type !== 'variable') {
      return false;
    }
  }
  return true;
}
