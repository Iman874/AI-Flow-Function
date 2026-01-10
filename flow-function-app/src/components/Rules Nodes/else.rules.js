export default function elseRule(params) {
  const { sourceNode, targetNode, sourceHandle } = params;

  // Else node should only receive from Condition false/default outputs
  if (targetNode?.type === 'else') {
    const fromCondition =
      sourceNode?.type === 'condition' && (sourceHandle === 'falseOutput' || sourceHandle === 'defaultOutput');
    if (!fromCondition) {
      return { valid: false, msg: 'Else hanya boleh menerima dari output False/Default pada Condition.' };
    }
  }

  return true;
}
