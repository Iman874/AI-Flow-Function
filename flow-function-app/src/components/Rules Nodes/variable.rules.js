export default function variableRule(params, nodes) {
  const { sourceNode, targetNode, sourceHandle, targetHandle } = params;
  if (sourceNode?.type === 'variable' && sourceHandle === 'output1') {
    if (!(targetNode?.type === 'condition' && targetHandle === 'defaultVarInput')) {
      return false;
    }
  }
  return true;
}
