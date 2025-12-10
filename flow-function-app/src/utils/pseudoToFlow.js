// Convert pseudocode string to nodes and edges for ReactFlow

export function pseudoToFlow(pseudo) {
  // Insert newlines before each keyword to split statements
  pseudo = pseudo
    .replace(/FUNCTION/g, "\nFUNCTION")
    .replace(/READ/g, "\nREAD")
    .replace(/ASK/g, "\nASK")
    .replace(/CONST/g, "\nCONST")
    .replace(/IF/g, "\nIF")
    .replace(/PROCESS/g, "\nPROCESS")
    .replace(/RETURN/g, "\nRETURN");
  const lines = pseudo
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);
  const nodes = [];
  const edges = [];
  let y = 40;
  let prevId = null;
  const variableNames = new Set();
  lines.forEach((line, idx) => {
    let type = 'process';
    let label = line;
    let id = `node-${idx}-${Date.now()}`;
    // Helper for default style
    const defaultStyle = { styleSizeMode: "expand", styleExpandWidth: 340 };
    // InputNode parsing
    if (line.startsWith("READ")) {
      const varName = line.replace("READ", "").trim();
      const inputId = id;
      nodes.push({
        id: inputId,
        type: "input",
        position: { x: 120, y },
        data: { varName, inputMode: "read", ...defaultStyle },
      });
      let varNode = nodes.find(
        n => n.type === "variable" && n.data?.varName === varName
      );
      let varId;
      if (!varNode) {
        varId = `var-${varName}-${Date.now()}`;
        nodes.push({
          id: varId,
          type: "variable",
          position: { x: 340, y },
          data: { varName, ...defaultStyle },
        });
      } else {
        varId = varNode.id;
      }
      edges.push({
        id: `edge-${inputId}-${varId}`,
        source: inputId,
        sourceHandle: "output",
        target: varId,
        targetHandle: "varInput",
      });
      prevId = inputId;
      y += 120;
      return;
    }
    if (line.startsWith('ASK')) {
      type = 'input';
      const varName = line.replace('ASK', '').trim();
      label = line;
      nodes.push({
        id,
        type,
        position: { x: 120, y },
        data: { label, varName, inputMode: 'ask', ...defaultStyle },
      });
      const varId = `var-${idx}-${Date.now()}`;
      nodes.push({
        id: varId,
        type: 'variable',
        position: { x: 320, y },
        data: { label: varName, varName, ...defaultStyle },
      });
      edges.push({
        id: `edge-${id}-${varId}`,
        source: id,
        sourceHandle: 'output',
        target: varId,
        targetHandle: 'varInput',
        animated: true,
      });
      if (prevId) {
        edges.push({
          id: `edge-${prevId}-${id}`,
          source: prevId,
          sourceHandle: 'output',
          target: id,
          targetHandle: 'input',
        });
      }
      prevId = varId;
      y += 120;
      return;
    }
    if (line.startsWith('CONST')) {
      type = 'input';
      // CONST pi = 3.14
      const rest = line.replace('CONST', '').trim();
      const [varName, ...restArr] = rest.split('=');
      const value = restArr.join('=').trim();
      nodes.push({
        id,
        type,
        position: { x: 120, y },
        data: { label: line, varName: varName.trim(), inputMode: 'const', value, ...defaultStyle },
      });
      const varId = `var-${idx}-${Date.now()}`;
      nodes.push({
        id: varId,
        type: 'variable',
        position: { x: 320, y },
        data: { label: varName.trim(), varName: varName.trim(), value, ...defaultStyle },
      });
      edges.push({
        id: `edge-${id}-${varId}`,
        source: id,
        sourceHandle: 'output',
        target: varId,
        targetHandle: 'varInput',
        animated: true,
      });
      if (prevId) {
        edges.push({
          id: `edge-${prevId}-${id}`,
          source: prevId,
          sourceHandle: 'output',
          target: id,
          targetHandle: 'input',
        });
      }
      prevId = varId;
      y += 120;
      return;
    }
    if (line.startsWith('FUNCTION')) {
      type = 'namefunction';
      label = line.replace('FUNCTION', '').trim();
    } else if (line.startsWith('IF')) type = 'condition';
    else if (line.startsWith('LOOP')) type = 'loop';
    else if (line.startsWith('RETURN')) type = 'return';
    // You can add more mappings as needed
    nodes.push({
      id,
      type,
      position: { x: 120, y },
      data: { label, ...defaultStyle },
    });
    if (prevId) {
      edges.push({
        id: `edge-${prevId}-${id}`,
        source: prevId,
        sourceHandle: 'output',
        target: id,
        targetHandle: 'input',
      });
    }
    prevId = id;
    y += 120;
  });
  return { nodes, edges };
}
