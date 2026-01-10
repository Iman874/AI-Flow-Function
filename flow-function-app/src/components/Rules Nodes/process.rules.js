export default function processRule(params) {
  const { sourceNode, targetNode, sourceHandle, targetHandle } = params;

  // Outgoing from Process bottomOutput: allow chaining to Condition/Loop/Return/Process
  if (sourceNode?.type === 'process' && sourceHandle === 'bottomOutput') {
    const allowed =
      (targetNode?.type === 'condition' && targetHandle === 'input') ||
      targetNode?.type === 'loop' ||
      targetNode?.type === 'process' ||
      targetNode?.type === 'return';
    if (!allowed) return false;
  }

  // Incoming to Process topInput: allow Parameter or Condition branches
  if (targetNode?.type === 'process' && targetHandle === 'topInput') {
    const fromParam = sourceNode?.type === 'parameter';
    const fromCondition =
      sourceNode?.type === 'condition' &&
      (sourceHandle === 'trueOutput' || sourceHandle === 'falseOutput' || sourceHandle === 'defaultOutput');
    if (!(fromParam || fromCondition)) {
      return { valid: false, msg: 'Process (top) hanya menerima dari Parameter atau output Condition.' };
    }
  }

  // Incoming variable binding (right): must be Variable
  if (targetNode?.type === 'process' && targetHandle === 'varInput') {
    if (sourceNode?.type !== 'variable') {
      return { valid: false, msg: 'Sambungkan Variable ke input kanan Process.' };
    }
  }

  return true;
}
