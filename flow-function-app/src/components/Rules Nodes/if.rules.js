export default function ifRule(params) {
  const { sourceNode, targetNode, sourceHandle, targetHandle } = params;

  // If node should only receive from Condition trueOutput
  if (targetNode?.type === 'if') {
    const fromCondition = sourceNode?.type === 'condition' && sourceHandle === 'trueOutput';
    if (!fromCondition) {
      return { valid: false, msg: 'If hanya boleh menerima dari output True pada Condition.' };
    }
  }

  return true;
}
