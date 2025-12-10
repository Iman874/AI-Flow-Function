export default function conditionRule(params, nodes) {
  const { sourceNode, targetNode, sourceHandle, targetHandle } = params;
  if (targetNode?.type === 'condition' && targetHandle === 'defaultVarInput') {
    if (sourceNode?.type !== 'variable') {
      return false;
    }
  }
  if (sourceNode?.type === 'condition' && targetNode?.type === 'return' && targetHandle === 'input') {
    if (!(sourceHandle === 'trueOutput' || sourceHandle === 'falseOutput' || sourceHandle === 'defaultOutput')) {
      return false;
    }
  }
  return true;
}
