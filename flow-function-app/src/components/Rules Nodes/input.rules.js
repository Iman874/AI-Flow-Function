export default function inputRule(params, nodes) {
  const { sourceNode, targetNode, sourceHandle, targetHandle } = params;
  if (sourceNode?.type === 'input' && sourceHandle === 'output') {
    if (targetNode?.type === 'variable' && targetHandle === 'varInput') {
      return true;
    }
    if (["return", "process", "condition", "else", "loop", "parameter", "output", "if"].includes(targetNode?.type)) {
      return false;
    }
    return false;
  }
  if (sourceNode?.type === 'variable' && sourceHandle === 'output' && targetNode?.type === 'input') {
    return false;
  }
  return true;
}
