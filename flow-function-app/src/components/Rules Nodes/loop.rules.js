export default function loopRule(params, nodes) {
  const { sourceNode, targetNode, sourceHandle, targetHandle } = params;
  if (targetNode?.type === 'loop' && (targetHandle === 'conditionVarInput' || targetHandle === 'counterVarInput')) {
    if (sourceNode?.type !== 'variable') {
      return false;
    }
  }
  if (targetNode?.type === 'loop' && targetHandle === 'input') {
    if (!(sourceNode?.type === 'process' && sourceHandle === 'bottomOutput')) {
      return false;
    }
  }
  return true;
}
