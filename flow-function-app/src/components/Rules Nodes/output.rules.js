export function rule(sourceNode, targetNode, sourceHandle, targetHandle) {
  // Output node input can receive from Process, Condition, Loop, Return
  if (targetNode?.type === 'output' && targetHandle === 'input') {
    if (!['process', 'condition', 'loop', 'return'].includes(sourceNode?.type)) {
      return { valid: false, msg: 'Output node hanya boleh menerima dari Process, Condition, Loop, atau Return.' };
    }
  }
  return { valid: true, msg: '' };
}
