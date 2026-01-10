/**
 * FlowLogger - Comprehensive logging system untuk AI Flow Function
 * Tracks node relationships, state changes, connections, dan data flow
 */

class FlowLogger {
  constructor() {
    this.logs = [];
    this.sessionStart = new Date();
    this.nodeStates = new Map(); // Track node state history
    this.edgeConnections = new Map(); // Track edge relationships
    this.processFlow = []; // Track execution/validation flow
  }

  /**
   * Log node creation
   */
  logNodeCreated(nodeId, nodeType, position, data) {
    const timestamp = new Date();
    const log = {
      type: 'NODE_CREATED',
      timestamp,
      nodeId,
      nodeType,
      position,
      initialData: { ...data },
      message: `[NODE_CREATED] ${nodeType.toUpperCase()} (${nodeId}) created at (${position.x}, ${position.y})`
    };
    this.logs.push(log);
    this.nodeStates.set(nodeId, {
      type: nodeType,
      createdAt: timestamp,
      dataHistory: [{ ...data, timestamp }],
      connections: { incoming: [], outgoing: [] }
    });
    console.log(log.message, data);
    return log;
  }

  /**
   * Log node data update (including template, condition type, variable binding, etc)
   */
  logNodeDataUpdated(nodeId, nodeType, oldData, newData, changeType) {
    const timestamp = new Date();
    const changes = this._detectChanges(oldData, newData);
    const log = {
      type: 'NODE_DATA_UPDATED',
      timestamp,
      nodeId,
      nodeType,
      changeType, // 'template', 'label', 'condType', 'varBinding', 'style', etc
      oldData,
      newData,
      changes,
      message: `[NODE_DATA_UPDATED] ${nodeType.toUpperCase()} (${nodeId}) - ${changeType}: ${JSON.stringify(changes)}`
    };
    this.logs.push(log);

    if (this.nodeStates.has(nodeId)) {
      const state = this.nodeStates.get(nodeId);
      state.dataHistory.push({ ...newData, timestamp, changeType });
      state.lastUpdated = timestamp;
    }

    console.log(log.message);
    return log;
  }

  /**
   * Log edge creation (connection between nodes)
   */
  logEdgeCreated(edgeId, sourceNodeId, targetNodeId, sourceHandle, targetHandle, edgeStyle = 'corner') {
    const timestamp = new Date();
    const log = {
      type: 'EDGE_CREATED',
      timestamp,
      edgeId,
      connection: {
        source: sourceNodeId,
        sourceHandle,
        target: targetNodeId,
        targetHandle
      },
      edgeStyle,
      message: `[EDGE_CREATED] ${sourceNodeId}(${sourceHandle}) → ${targetNodeId}(${targetHandle}) style=${edgeStyle}`
    };
    this.logs.push(log);

    // Track edge relationships
    if (!this.edgeConnections.has(edgeId)) {
      this.edgeConnections.set(edgeId, {
        createdAt: timestamp,
        connection: { sourceNodeId, targetNodeId, sourceHandle, targetHandle },
        styleHistory: [{ style: edgeStyle, timestamp }]
      });
    }

    // Update node connection tracking
    if (this.nodeStates.has(sourceNodeId)) {
      this.nodeStates.get(sourceNodeId).connections.outgoing.push({
        target: targetNodeId,
        handle: sourceHandle,
        edge: edgeId,
        timestamp
      });
    }
    if (this.nodeStates.has(targetNodeId)) {
      this.nodeStates.get(targetNodeId).connections.incoming.push({
        source: sourceNodeId,
        handle: targetHandle,
        edge: edgeId,
        timestamp
      });
    }

    console.log(log.message);
    return log;
  }

  /**
   * Log edge style change
   */
  logEdgeStyleChanged(edgeId, oldStyle, newStyle, appliedToAll = false) {
    const timestamp = new Date();
    const log = {
      type: 'EDGE_STYLE_CHANGED',
      timestamp,
      edgeId,
      oldStyle,
      newStyle,
      appliedToAll,
      message: `[EDGE_STYLE_CHANGED] Edge ${edgeId}: ${oldStyle} → ${newStyle}${appliedToAll ? ' (APPLIED TO ALL)' : ''}`
    };
    this.logs.push(log);

    if (this.edgeConnections.has(edgeId)) {
      this.edgeConnections.get(edgeId).styleHistory.push({
        style: newStyle,
        timestamp,
        appliedToAll
      });
    }

    console.log(log.message);
    return log;
  }

  /**
   * Log connection validation
   */
  logConnectionValidation(sourceNodeId, targetNodeId, sourceHandle, targetHandle, isValid, reason = '') {
    const timestamp = new Date();
    const log = {
      type: 'CONNECTION_VALIDATION',
      timestamp,
      sourceNodeId,
      targetNodeId,
      handles: { source: sourceHandle, target: targetHandle },
      isValid,
      reason,
      message: `[CONNECTION_VALIDATION] ${sourceNodeId}(${sourceHandle}) → ${targetNodeId}(${targetHandle}): ${isValid ? '✓ VALID' : '✗ INVALID'} ${reason ? `(${reason})` : ''}`
    };
    this.logs.push(log);
    this.processFlow.push(log);

    console.log(log.message);
    return log;
  }

  /**
   * Log connected variables to a node (automatic binding)
   */
  logVariablesConnected(nodeId, nodeType, variables) {
    const timestamp = new Date();
    const log = {
      type: 'VARIABLES_CONNECTED',
      timestamp,
      nodeId,
      nodeType,
      variables,
      message: `[VARIABLES_CONNECTED] ${nodeType.toUpperCase()} (${nodeId}) now connected to variables: [${variables.join(', ')}]`
    };
    this.logs.push(log);
    this.processFlow.push(log);

    console.log(log.message);
    return log;
  }

  /**
   * Log pseudocode parsing and flow generation
   */
  logPseudocodeParsing(pseudocode, generatedNodes, generatedEdges) {
    const timestamp = new Date();
    const lines = pseudocode.split('\n').filter(l => l.trim());
    const log = {
      type: 'PSEUDOCODE_PARSING',
      timestamp,
      pseudocodeLines: lines,
      lineCount: lines.length,
      generatedNodeCount: generatedNodes.length,
      generatedEdgeCount: generatedEdges.length,
      nodes: generatedNodes.map(n => ({
        id: n.id,
        type: n.type,
        label: n.data?.label || n.data?.name || n.type
      })),
      edges: generatedEdges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle
      })),
      message: `[PSEUDOCODE_PARSING] ${lines.length} lines → ${generatedNodes.length} nodes, ${generatedEdges.length} edges`
    };
    this.logs.push(log);
    this.processFlow.push(log);

    console.log(log.message);
    console.log('Generated nodes:', generatedNodes);
    console.log('Generated edges:', generatedEdges);
    return log;
  }

  /**
   * Log condition branching logic
   */
  logConditionBranching(conditionNodeId, condType, branches) {
    const timestamp = new Date();
    const log = {
      type: 'CONDITION_BRANCHING',
      timestamp,
      conditionNodeId,
      condType, // 'if-only', 'if-else', 'switch'
      branches, // { true: targetNodeId, false: targetNodeId, default: targetNodeId }
      message: `[CONDITION_BRANCHING] Condition (${conditionNodeId}) type=${condType} branches: ${JSON.stringify(branches)}`
    };
    this.logs.push(log);
    this.processFlow.push(log);

    console.log(log.message);
    return log;
  }

  /**
   * Log process execution with input variables
   */
  logProcessExecution(processNodeId, template, inputVariables, operation) {
    const timestamp = new Date();
    const log = {
      type: 'PROCESS_EXECUTION',
      timestamp,
      processNodeId,
      template,
      inputVariables,
      operation, // 'addition', 'subtraction', 'custom', etc
      message: `[PROCESS_EXECUTION] Process (${processNodeId}) template=${template} on vars=[${inputVariables.join(', ')}] op=${operation}`
    };
    this.logs.push(log);
    this.processFlow.push(log);

    console.log(log.message);
    return log;
  }

  /**
   * Log input/output operations
   */
  logIOOperation(nodeId, ioType, variable, operation = 'read/write') {
    const timestamp = new Date();
    const log = {
      type: 'IO_OPERATION',
      timestamp,
      nodeId,
      ioType, // 'input' or 'output'
      variable,
      operation,
      message: `[IO_OPERATION] ${ioType.toUpperCase()} node (${nodeId}) - ${operation} variable: ${variable}`
    };
    this.logs.push(log);
    this.processFlow.push(log);

    console.log(log.message);
    return log;
  }

  /**
   * Log UI layout issues (node overlaps / intersections) for debugging canvas collisions
   */
  logUILayoutIssue(issues) {
    const timestamp = new Date();
    const log = {
      type: 'UI_LAYOUT_ISSUE',
      timestamp,
      issueCount: issues?.length || 0,
      issues,
      message: `[UI_LAYOUT_ISSUE] ${issues?.length || 0} overlap(s) detected`
    };
    this.logs.push(log);
    this.processFlow.push(log);

    if (issues?.length) {
      console.warn(log.message, issues);
    } else {
      console.log(log.message);
    }
    return log;
  }

  /**
   * Log node state summary (for debugging specific node)
   */
  logNodeStateSummary(nodeId) {
    const timestamp = new Date();
    const nodeState = this.nodeStates.get(nodeId);
    if (!nodeState) {
      console.warn(`[NODE_STATE_SUMMARY] Node ${nodeId} not found`);
      return null;
    }

    const log = {
      type: 'NODE_STATE_SUMMARY',
      timestamp,
      nodeId,
      nodeType: nodeState.type,
      createdAt: nodeState.createdAt,
      lastUpdated: nodeState.lastUpdated,
      updateCount: nodeState.dataHistory.length - 1,
      currentData: nodeState.dataHistory[nodeState.dataHistory.length - 1],
      incomingConnections: nodeState.connections.incoming.length,
      outgoingConnections: nodeState.connections.outgoing.length,
      connections: nodeState.connections,
      message: `[NODE_STATE_SUMMARY] ${nodeState.type.toUpperCase()} (${nodeId}): ${nodeState.connections.incoming.length} in, ${nodeState.connections.outgoing.length} out, ${nodeState.dataHistory.length - 1} updates`
    };
    this.logs.push(log);

    console.log(log.message);
    console.log('Full state:', log);
    return log;
  }

  /**
   * Log overall flow graph summary
   */
  logFlowGraphSummary(allNodes, allEdges) {
    const timestamp = new Date();
    const nodeTypeCounts = {};
    allNodes.forEach(n => {
      nodeTypeCounts[n.type] = (nodeTypeCounts[n.type] || 0) + 1;
    });

    const edgeStyleCounts = {};
    allEdges.forEach(e => {
      const style = e.data?.edgeStyle || e.type || 'unknown';
      edgeStyleCounts[style] = (edgeStyleCounts[style] || 0) + 1;
    });

    const log = {
      type: 'FLOW_GRAPH_SUMMARY',
      timestamp,
      totalNodes: allNodes.length,
      totalEdges: allEdges.length,
      nodeTypeCounts,
      edgeStyleCounts,
      nodeList: allNodes.map(n => ({
        id: n.id,
        type: n.type,
        label: n.data?.label || n.data?.name || n.type
      })),
      edgeList: allEdges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        style: e.data?.edgeStyle || e.type || 'unknown'
      })),
      message: `[FLOW_GRAPH_SUMMARY] ${allNodes.length} nodes (${JSON.stringify(nodeTypeCounts)}), ${allEdges.length} edges`
    };
    this.logs.push(log);

    console.log(log.message);
    console.log('Node type distribution:', nodeTypeCounts);
    console.log('Edge style distribution:', edgeStyleCounts);
    return log;
  }

  /**
   * Helper: detect differences between old and new data
   */
  _detectChanges(oldData, newData) {
    const changes = {};
    const allKeys = new Set([...Object.keys(oldData || {}), ...Object.keys(newData || {})]);
    
    allKeys.forEach(key => {
      const old = oldData?.[key];
      const neu = newData?.[key];
      if (JSON.stringify(old) !== JSON.stringify(neu)) {
        changes[key] = { old, new: neu };
      }
    });

    return Object.keys(changes).length > 0 ? changes : null;
  }

  /**
   * Export logs to JSON (for file storage)
   */
  exportLogsJSON() {
    return {
      sessionStart: this.sessionStart,
      sessionEnd: new Date(),
      totalLogs: this.logs.length,
      logs: this.logs,
      nodeStates: Array.from(this.nodeStates.entries()).map(([nodeId, state]) => ({
        nodeId,
        ...state
      })),
      edgeConnections: Array.from(this.edgeConnections.entries()).map(([edgeId, conn]) => ({
        edgeId,
        ...conn
      })),
      processFlow: this.processFlow
    };
  }

  /**
   * Get logs filtered by type
   */
  getLogsByType(logType) {
    return this.logs.filter(log => log.type === logType);
  }

  /**
   * Get all logs (human-readable format)
   */
  getAllLogsFormatted() {
    return this.logs.map(log => ({
      time: log.timestamp.toLocaleTimeString(),
      type: log.type,
      message: log.message,
      details: log
    }));
  }

  /**
   * Clear all logs
   */
  clearLogs() {
    this.logs = [];
    this.nodeStates.clear();
    this.edgeConnections.clear();
    this.processFlow = [];
    console.log('[LOGGER] All logs cleared');
  }

  /**
   * Validate flow graph integrity
   */
  validateFlowIntegrity(nodes, edges) {
    const timestamp = new Date();
    const issues = [];

    // Check for orphaned nodes (no connections)
    nodes.forEach(node => {
      const hasIncoming = edges.some(e => e.target === node.id);
      const hasOutgoing = edges.some(e => e.source === node.id);
      
      if (node.type !== 'namefunction' && !hasIncoming && !hasOutgoing) {
        issues.push(`Node ${node.id} (${node.type}) is orphaned - no connections`);
      }
    });

    // Check for circular dependencies
    const adjacency = {};
    edges.forEach(e => {
      if (!adjacency[e.source]) adjacency[e.source] = [];
      adjacency[e.source].push(e.target);
    });

    const visited = new Set();
    const recursionStack = new Set();
    const hasCycle = (nodeId) => {
      visited.add(nodeId);
      recursionStack.add(nodeId);

      (adjacency[nodeId] || []).forEach(neighbor => {
        if (!visited.has(neighbor)) {
          if (hasCycle(neighbor)) return true;
        } else if (recursionStack.has(neighbor)) {
          return true;
        }
      });

      recursionStack.delete(nodeId);
      return false;
    };

    nodes.forEach(node => {
      visited.clear();
      recursionStack.clear();
      if (hasCycle(node.id)) {
        issues.push(`Potential circular dependency detected involving ${node.id}`);
      }
    });

    const log = {
      type: 'FLOW_VALIDATION',
      timestamp,
      isValid: issues.length === 0,
      issueCount: issues.length,
      issues,
      message: `[FLOW_VALIDATION] ${issues.length === 0 ? '✓ VALID' : '✗ INVALID'} - ${issues.length} issues found`
    };
    this.logs.push(log);

    console.log(log.message);
    if (issues.length > 0) {
      console.warn('Issues:', issues);
    }

    return log;
  }
}

// Export as singleton
export const flowLogger = new FlowLogger();

export default FlowLogger;
