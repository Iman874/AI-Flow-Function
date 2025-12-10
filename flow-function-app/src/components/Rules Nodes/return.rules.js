export default function returnRule(params, nodes) {
  const { sourceNode, targetNode, sourceHandle, targetHandle } = params;
  if (targetNode?.type === 'return' && targetHandle === 'input') {
    const allowed = (
      (sourceNode?.type === 'process' && sourceHandle === 'bottomOutput') ||
      (sourceNode?.type === 'loop' && sourceHandle === 'output') ||
      (sourceNode?.type === 'condition' && (sourceHandle === 'trueOutput' || sourceHandle === 'falseOutput' || sourceHandle === 'defaultOutput'))
    );
    if (!allowed) {
      return false;
    }
  }
  return true;
}
