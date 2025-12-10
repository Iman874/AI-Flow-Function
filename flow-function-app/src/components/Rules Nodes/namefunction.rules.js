export default function namefunctionRule(params, nodes) {
  const { sourceNode, targetNode, sourceHandle, targetHandle } = params;
  if (targetNode?.type === 'namefunction' && targetHandle === 'varInput') {
    if (sourceNode?.type !== 'variable') {
      return false;
    }
  }
  return true;
}
