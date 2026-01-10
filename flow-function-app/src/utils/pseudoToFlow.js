// Convert pseudocode string to nodes and edges for ReactFlow with lanes and color hints

export function pseudoToFlow(pseudo, options = {}) {
  const {
    defaultNodeColor = '#f8fafc',
    defaultHeaderColor = '#eef2ff',
    defaultEdgeColor = '#6366f1',
    trueEdgeColor = '#22c55e',
    falseEdgeColor = '#ef4444',
    laneX = {
      namefunction: 120,
      variable: 240,
      input: 80,
      output: 520,
      condition: 360,
      else: 360,
      process: 520,
      loop: 520,
      return: 680,
      default: 320,
    },
    laneYStep = 140,
  } = options;

  const colorForHandle = (handle) => {
    if (handle === 'trueOutput') return trueEdgeColor;
    if (handle === 'falseOutput') return falseEdgeColor;
    return defaultEdgeColor;
  };

  const baseStyle = {
    styleSizeMode: 'expand',
    styleExpandWidth: 340,
    styleCardBg: defaultNodeColor,
    styleHeaderBg: '#87ceeb',
    styleTrueBg: '#d1fae5',
    styleFalseBg: '#fee2e2',
  };

  // Insert newlines before each keyword to split statements
  pseudo = pseudo
    .replace(/FUNCTION/g, "\nFUNCTION")
    .replace(/DECLARE/g, "\nDECLARE")
    .replace(/READ/g, "\nREAD")
    .replace(/PRINT/g, "\nPRINT")
    .replace(/ASK/g, "\nASK")
    .replace(/CONST/g, "\nCONST")
    .replace(/IF/g, "\nIF")
    .replace(/ELSE/g, "\nELSE")
    .replace(/PROCESS/g, "\nPROCESS")
    .replace(/RETURN/g, "\nRETURN");

  const lines = pseudo
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const nodes = [];
  const edges = [];
  let y = 40;
  let prevId = null;
  let lastConditionId = null;
  let lastIfId = null;
  const declaredVars = new Set();
  const laneFor = (type) => laneX[type] ?? laneX.default ?? 320;

  // Helper functions to get correct handle names for each node type
  const getInputHandle = (nodeType) => {
    switch (nodeType) {
      case 'variable': return 'input1';
      case 'process': return 'topInput';
      case 'input':
      case 'output':
      case 'condition':
      case 'loop':
      case 'namefunction':
      case 'else':
      case 'return':
      default: return 'input';
    }
  };

  const getOutputHandle = (nodeType) => {
    switch (nodeType) {
      case 'variable': return 'output1';
      case 'process': return 'bottomOutput';
      case 'input':
      case 'output':
      case 'condition':
      case 'loop':
      case 'namefunction':
      case 'else':
      case 'return':
      default: return 'output';
    }
  };

  lines.forEach((line, idx) => {
    let type = 'process';
    let label = line;
    const id = `node-${idx}-${Date.now()}`;
    const defaultStyle = { ...baseStyle };

    // DECLARE variable
    if (line.startsWith('DECLARE')) {
      const rest = line.replace('DECLARE', '').trim();
      let varName = rest;
      let varType = 'int'; // default type

      // Parse "DECLARE varName as type" or "DECLARE varName"
      if (rest.includes(' as ')) {
        const parts = rest.split(' as ');
        varName = parts[0].trim();
        varType = parts[1].trim();
      }

      declaredVars.add(varName);
      nodes.push({
        id,
        type: 'variable',
        position: { x: laneFor('variable'), y },
        data: {
          varName,
          name: varName,
          varType,
          ...defaultStyle
        },
      });
      if (prevId) {
        const prevNode = nodes.find(n => n.id === prevId);
        const prevType = prevNode?.type || 'variable';
        edges.push({
          id: `edge-${prevId}-${id}`,
          source: prevId,
          sourceHandle: getOutputHandle(prevType),
          target: id,
          targetHandle: getInputHandle('variable'), // Target is always variable for DECLARE
          style: { stroke: defaultEdgeColor },
        });
      }
      prevId = id;
      y += laneYStep;
      return;
    }

    // READ variable (Input Node)
    if (line.startsWith('READ')) {
      const varName = line.replace('READ', '').trim();
      const inputId = id;
      nodes.push({
        id: inputId,
        type: 'input',
        position: { x: laneFor('input'), y },
        data: { varName, inputMode: 'read', ...defaultStyle },
      });

      const existingVar = nodes.find((n) => n.type === 'variable' && n.data?.varName === varName);
      let varId;
      if (!existingVar) {
        varId = `var-${varName}-${Date.now()}`;
        nodes.push({
          id: varId,
          type: 'variable',
          position: { x: laneFor('variable') + 200, y },
          data: { varName, ...defaultStyle },
        });
      } else {
        varId = existingVar.id;
      }

      edges.push({
        id: `edge-${inputId}-${varId}`,
        source: inputId,
        sourceHandle: getOutputHandle(nodes.find(n => n.id === prevId)?.type || 'variable'),
        target: varId,
        targetHandle: 'varInput',
        style: { stroke: defaultEdgeColor },
      });

      if (prevId && prevId !== varId) {
        const prevNode = nodes.find(n => n.id === prevId);
        const prevType = prevNode?.type || 'input';
        edges.push({
          id: `edge-${prevId}-${inputId}`,
          source: prevId,
          sourceHandle: getOutputHandle(prevType),
          target: inputId,
          targetHandle: getInputHandle('input'),
          style: { stroke: defaultEdgeColor },
        });
      }

      prevId = inputId;
      y += laneYStep;
      return;
    }

    // PRINT variable (Output Node)
    if (line.startsWith('PRINT')) {
      const varName = line.replace('PRINT', '').trim();
      const outputId = id;
      nodes.push({
        id: outputId,
        type: 'output',
        position: { x: laneFor('output'), y },
        data: { varName, label: varName, ...defaultStyle },
      });

      // Connect to variable node if it exists
      const varNode = nodes.find(n => n.type === 'variable' && n.data?.varName === varName);
      if (varNode) {
        console.log(`[pseudoToFlow] Connecting variable "${varName}" (${varNode.id}) to output (${outputId})`);
        edges.push({
          id: `edge-${varNode.id}-${outputId}-var`,
          source: varNode.id,
          sourceHandle: 'varOutput', // FIX: Use correct handle name
          target: outputId,
          targetHandle: 'varInput',
          type: 'default',
          animated: false,
          style: { stroke: '#8b5cf6', strokeWidth: 2 },
          data: { edgeStyle: 'corner' },
        });
      } else {
        console.warn(`[pseudoToFlow] Variable "${varName}" not found for PRINT`);
      }

      if (prevId) {
        const prevNode = nodes.find(n => n.id === prevId);
        const prevType = prevNode?.type || 'variable';
        edges.push({
          id: `edge-${prevId}-${outputId}`,
          source: prevId,
          sourceHandle: getOutputHandle(prevType),
          target: outputId,
          targetHandle: getInputHandle('output'), // Target is output node
          style: { stroke: defaultEdgeColor },
        });
      }

      prevId = outputId;
      y += laneYStep;
      return;
    }

    // ASK variable (alternative input)
    if (line.startsWith('ASK')) {
      type = 'input';
      const varName = line.replace('ASK', '').trim();
      label = line;
      nodes.push({
        id,
        type,
        position: { x: laneFor('input'), y },
        data: { label, varName, inputMode: 'ask', ...defaultStyle },
      });
      const varId = `var-${idx}-${Date.now()}`;
      nodes.push({
        id: varId,
        type: 'variable',
        position: { x: laneFor('variable') + 200, y },
        data: { label: varName, varName, ...defaultStyle },
      });
      edges.push({
        id: `edge-${id}-${varId}`,
        source: id,
        sourceHandle: getOutputHandle(nodes.find(n => n.id === prevId)?.type || 'variable'),
        target: varId,
        targetHandle: 'varInput',
        style: { stroke: defaultEdgeColor },
      });
      if (prevId) {
        const prevNode = nodes.find(n => n.id === prevId);
        const prevType = prevNode?.type || 'variable';
        edges.push({
          id: `edge-${prevId}-${id}`,
          source: prevId,
          sourceHandle: getOutputHandle(prevType),
          target: id,
          targetHandle: getInputHandle('input'), // Target is input node (ASK)
          style: { stroke: defaultEdgeColor },
        });
      }
      prevId = varId;
      y += laneYStep;
      return;
    }

    // CONST variable
    if (line.startsWith('CONST')) {
      type = 'input';
      const rest = line.replace('CONST', '').trim();
      const [varName, ...restArr] = rest.split('=');
      const value = restArr.join('=').trim();
      nodes.push({
        id,
        type,
        position: { x: laneFor('input'), y },
        data: { label: line, varName: varName.trim(), inputMode: 'const', value, ...defaultStyle },
      });
      const varId = `var-${idx}-${Date.now()}`;
      nodes.push({
        id: varId,
        type: 'variable',
        position: { x: laneFor('variable') + 200, y },
        data: { label: varName.trim(), varName: varName.trim(), value, ...defaultStyle },
      });
      edges.push({
        id: `edge-${id}-${varId}`,
        source: id,
        sourceHandle: getOutputHandle(nodes.find(n => n.id === prevId)?.type || 'variable'),
        target: varId,
        targetHandle: 'varInput',
        style: { stroke: defaultEdgeColor },
      });
      if (prevId) {
        const prevNode = nodes.find(n => n.id === prevId);
        const prevType = prevNode?.type || 'variable';
        edges.push({
          id: `edge-${prevId}-${id}`,
          source: prevId,
          sourceHandle: getOutputHandle(prevType),
          target: id,
          targetHandle: getInputHandle('input'), // Target is input node (CONST)
          style: { stroke: defaultEdgeColor },
        });
      }
      prevId = varId;
      y += laneYStep;
      return;
    }

    // FUNCTION
    if (line.startsWith('FUNCTION')) {
      type = 'namefunction';
      label = line.replace('FUNCTION', '').trim();
    }
    // IF condition
    else if (line.startsWith('IF')) {
      type = 'condition';
      label = line.replace('IF', '').trim();
      lastConditionId = id;
    }
    // ELSE branch
    else if (line.startsWith('ELSE')) {
      type = 'else';
      label = 'ELSE';

      // Connect ELSE to previous condition
      if (lastConditionId) {
        edges.push({
          id: `edge-${lastConditionId}-${id}`,
          source: lastConditionId,
          sourceHandle: 'falseOutput',
          target: id,
          targetHandle: getInputHandle('else'), // Target is else node
          style: { stroke: colorForHandle('falseOutput') },
        });
        lastIfId = null;
      }

      prevId = id;
      y += laneYStep;

      nodes.push({
        id,
        type,
        position: { x: laneFor('else'), y },
        data: { label, ...defaultStyle },
      });

      return;
    }
    // PROCESS operation
    else if (line.startsWith('PROCESS')) {
      type = 'process';
      const operation = line.replace('PROCESS', '').trim();
      label = operation;

      // Parse expression to find variables used
      const usedVars = [];
      declaredVars.forEach(varName => {
        if (operation.includes(varName)) {
          usedVars.push(varName);
        }
      });

      // If previous was condition (IF), connect to true output
      if (lastConditionId && !lastIfId) {
        edges.push({
          id: `edge-${lastConditionId}-${id}`,
          source: lastConditionId,
          sourceHandle: 'trueOutput',
          target: id,
          targetHandle: getInputHandle('process'), // Target is process node
          style: { stroke: colorForHandle('trueOutput') },
        });
        lastIfId = id;
      } else if (prevId) {
        const prevNode = nodes.find(n => n.id === prevId);
        const prevType = prevNode?.type || 'variable';
        edges.push({
          id: `edge-${prevId}-${id}`,
          source: prevId,
          sourceHandle: getOutputHandle(prevType),
          target: id,
          targetHandle: getInputHandle('process'), // Target is process node
          style: { stroke: defaultEdgeColor },
        });
      }

      // Connect variables to process node
      usedVars.forEach(varName => {
        const varNode = nodes.find(n => n.type === 'variable' && n.data?.varName === varName);
        if (varNode) {
          console.log(`[pseudoToFlow] Connecting variable "${varName}" (${varNode.id}) to process (${id})`);
          edges.push({
            id: `edge-${varNode.id}-${id}-var`,
            source: varNode.id,
            sourceHandle: 'varOutput', // FIX: Use correct handle name
            target: id,
            targetHandle: 'varInput',
            type: 'default',
            animated: false,
            style: { stroke: '#8b5cf6', strokeWidth: 2 },
            data: { edgeStyle: 'corner' },
          });
        } else {
          console.warn(`[pseudoToFlow] Variable "${varName}" not found in nodes array`);
        }
      });

      prevId = id;
      y += laneYStep;

      nodes.push({
        id,
        type,
        position: { x: laneFor('process'), y },
        data: {
          label,
          expression: operation,
          template: 'custom',
          connectedVariables: usedVars,
          ...defaultStyle
        },
      });

      return;
    }
    // LOOP
    else if (line.startsWith('LOOP') || line.startsWith('FOR') || line.startsWith('WHILE')) {
      type = 'loop';
      let loopType = 'for';
      let counterVar = 'i';
      let startValue = 0;
      let endValue = 10;
      let condition = '';

      if (line.startsWith('FOR')) {
        loopType = 'for';
        // Parse "FOR i = 0 TO 10" or "FOR i FROM 0 TO 10"
        const forMatch = line.match(/FOR\s+(\w+)\s*(?:=|FROM)\s*(\d+)\s+TO\s+(\d+)/i);
        if (forMatch) {
          counterVar = forMatch[1];
          startValue = parseInt(forMatch[2]);
          endValue = parseInt(forMatch[3]);
        }
        label = `FOR ${counterVar} = ${startValue} TO ${endValue}`;
      } else if (line.startsWith('WHILE')) {
        loopType = 'while';
        condition = line.replace('WHILE', '').trim();
        label = `WHILE ${condition}`;
      } else {
        label = line.replace('LOOP', '').trim();
      }

      nodes.push({
        id,
        type,
        position: { x: laneFor('loop'), y },
        data: {
          label,
          loopType,
          counterVar,
          startValue,
          endValue,
          condition,
          ...defaultStyle
        },
      });
    }
    // RETURN
    else if (line.startsWith('RETURN')) {
      type = 'return';
      const value = line.replace('RETURN', '').trim();
      label = value ? `RETURN ${value}` : 'RETURN';

      nodes.push({
        id,
        type,
        position: { x: laneFor('return'), y },
        data: {
          label,
          value,
          ...defaultStyle
        },
      });
    }

    // Default node creation
    const nodeData = { label, ...defaultStyle };

    // Add specific data for certain node types
    if (type === 'namefunction') {
      nodeData.name = label; // Function name for code generation
    }

    nodes.push({
      id,
      type,
      position: { x: laneFor(type), y },
      data: nodeData,
    });

    if (prevId && type !== 'else') {
      const prevNode = nodes.find(n => n.id === prevId);
      const prevType = prevNode?.type || 'variable';
      edges.push({
        id: `edge-${prevId}-${id}`,
        source: prevId,
        sourceHandle: getOutputHandle(prevType),
        target: id,
        targetHandle: getInputHandle(type), // Use actual target node type
        style: { stroke: defaultEdgeColor },
      });
    }

    prevId = id;
    y += laneYStep;
  });
  return { nodes, edges };
}

