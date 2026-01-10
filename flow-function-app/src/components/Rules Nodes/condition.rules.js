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

  // Condition outputs routing rules
  if (sourceNode?.type === 'condition') {
    const condType = sourceNode?.data?.condType || 'if-else';
    const isTrue = sourceHandle === 'trueOutput';
    const isFalse = sourceHandle === 'falseOutput';
    const isDefault = sourceHandle === 'defaultOutput';

    // if-only: only true branch should be used
    if (condType === 'if-only' && isFalse) {
      return { valid: false, msg: 'Mode If Only: tidak ada cabang False.' };
    }

    // True branch: allow If or Process
    if (isTrue) {
      if (!(targetNode?.type === 'if' || targetNode?.type === 'process')) {
        return { valid: false, msg: 'Output True hanya boleh menuju If atau Process.' };
      }
    }

    // False branch: allow Else or Process (only if condType supports it)
    if (isFalse) {
      if (condType === 'if-only') {
        return { valid: false, msg: 'Mode If Only tidak memiliki cabang False.' };
      }
      if (!(targetNode?.type === 'else' || targetNode?.type === 'process')) {
        return { valid: false, msg: 'Output False hanya boleh menuju Else atau Process.' };
      }
    }

    // Default branch (switch) : allow Process
    if (isDefault) {
      if (targetNode?.type !== 'process') {
        return { valid: false, msg: 'Output Default hanya boleh menuju Process.' };
      }
    }
  }
  return true;
}
