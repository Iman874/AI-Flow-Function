/**
 * logExporter - Utilities untuk export dan analyze logs
 */

import { flowLogger } from './FlowLogger';

/**
 * Export logs ke file JSON
 */
export const exportLogsToFile = (filename = null) => {
  const json = JSON.stringify(flowLogger.exportLogsJSON(), null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `flow-logs-${new Date().getTime()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * Export logs ke CSV (human-readable)
 */
export const exportLogsToCSV = (filename = null) => {
  const logs = flowLogger.logs;
  const headers = ['Timestamp', 'Type', 'Message', 'Node/Edge ID', 'Details'];
  
  const rows = logs.map(log => [
    log.timestamp.toLocaleTimeString(),
    log.type,
    log.message,
    log.nodeId || log.edgeId || log.conditionNodeId || log.processNodeId || '',
    JSON.stringify({
      ...log,
      timestamp: undefined,
      type: undefined,
      message: undefined
    })
  ]);

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `flow-logs-${new Date().getTime()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * Generate log report (HTML)
 */
export const generateLogReport = () => {
  const data = flowLogger.exportLogsJSON();
  const stats = {
    totalLogs: data.logs.length,
    nodeCount: data.nodeStates.length,
    edgeCount: data.edgeConnections.length,
    logTypes: {}
  };

  data.logs.forEach(log => {
    stats.logTypes[log.type] = (stats.logTypes[log.type] || 0) + 1;
  });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>AI Flow Function - Log Report</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 20px;
      background: #f5f5f5;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 { color: #333; border-bottom: 3px solid #1f2937; padding-bottom: 10px; }
    h2 { color: #555; margin-top: 30px; }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin: 20px 0;
    }
    .stat-box {
      background: #f0f9ff;
      border-left: 4px solid #3b82f6;
      padding: 15px;
      border-radius: 4px;
    }
    .stat-box .number {
      font-size: 28px;
      font-weight: bold;
      color: #3b82f6;
    }
    .stat-box .label {
      font-size: 12px;
      color: #666;
      margin-top: 5px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    th {
      background: #1f2937;
      color: white;
      padding: 10px;
      text-align: left;
      font-weight: 600;
    }
    td {
      padding: 10px;
      border-bottom: 1px solid #e5e7eb;
    }
    tr:hover {
      background: #f9fafb;
    }
    .log-entry {
      background: #f9fafb;
      padding: 10px;
      margin: 5px 0;
      border-left: 3px solid #3b82f6;
      border-radius: 4px;
    }
    .log-time {
      color: #999;
      font-size: 12px;
    }
    .log-type {
      display: inline-block;
      background: #dbeafe;
      color: #1e40af;
      padding: 3px 8px;
      border-radius: 3px;
      font-size: 11px;
      font-weight: 600;
      margin-right: 10px;
    }
    .log-message {
      color: #333;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      margin-top: 5px;
    }
    .summary {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      padding: 15px;
      border-radius: 4px;
      margin: 15px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>📊 AI Flow Function - Log Report</h1>
    <p>Generated: ${new Date().toLocaleString()}</p>
    <p>Session Duration: ${Math.round((new Date() - new Date(data.sessionStart)) / 1000)} seconds</p>

    <div class="stats">
      <div class="stat-box">
        <div class="number">${stats.totalLogs}</div>
        <div class="label">Total Logs</div>
      </div>
      <div class="stat-box">
        <div class="number">${stats.nodeCount}</div>
        <div class="label">Nodes Created</div>
      </div>
      <div class="stat-box">
        <div class="number">${stats.edgeCount}</div>
        <div class="label">Edges Created</div>
      </div>
      <div class="stat-box">
        <div class="number">${Object.keys(stats.logTypes).length}</div>
        <div class="label">Log Types</div>
      </div>
    </div>

    <h2>📈 Log Type Distribution</h2>
    <table>
      <thead>
        <tr>
          <th>Log Type</th>
          <th>Count</th>
          <th>Percentage</th>
        </tr>
      </thead>
      <tbody>
        ${Object.entries(stats.logTypes).map(([type, count]) => `
          <tr>
            <td>${type}</td>
            <td>${count}</td>
            <td>${((count / stats.totalLogs) * 100).toFixed(1)}%</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <h2>🔧 Nodes Summary</h2>
    <table>
      <thead>
        <tr>
          <th>Node ID</th>
          <th>Type</th>
          <th>Connections</th>
          <th>Updates</th>
        </tr>
      </thead>
      <tbody>
        ${data.nodeStates.map(node => `
          <tr>
            <td><code>${node.nodeId}</code></td>
            <td>${node.type}</td>
            <td>↓${node.connections.incoming.length} ↑${node.connections.outgoing.length}</td>
            <td>${node.dataHistory.length - 1}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <h2>🔗 Edges Summary</h2>
    <table>
      <thead>
        <tr>
          <th>Edge ID</th>
          <th>Source → Target</th>
          <th>Current Style</th>
          <th>Changes</th>
        </tr>
      </thead>
      <tbody>
        ${data.edgeConnections.map(edge => `
          <tr>
            <td><code>${edge.edgeId}</code></td>
            <td>${edge.connection.sourceNodeId}(${edge.connection.sourceHandle}) → ${edge.connection.targetNodeId}(${edge.connection.targetHandle})</td>
            <td>${edge.styleHistory[edge.styleHistory.length - 1]?.style || 'unknown'}</td>
            <td>${edge.styleHistory.length - 1}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <h2>📋 Recent Logs</h2>
    <div class="summary">
      <p><strong>Last 50 logs in chronological order:</strong></p>
    </div>
    ${data.logs.slice(-50).map(log => `
      <div class="log-entry">
        <span class="log-type">${log.type}</span>
        <span class="log-time">${new Date(log.timestamp).toLocaleTimeString()}</span>
        <div class="log-message">${log.message}</div>
      </div>
    `).join('')}
  </div>
</body>
</html>
  `;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `flow-logs-report-${new Date().getTime()}.html`;
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * Analyze logs dan return insights
 */
export const analyzeLogs = () => {
  const logs = flowLogger.logs;
  const nodeStates = flowLogger.nodeStates;
  const edgeConnections = flowLogger.edgeConnections;

  const analysis = {
    summary: {
      totalLogs: logs.length,
      totalNodes: nodeStates.size,
      totalEdges: edgeConnections.size,
      sessionDuration: new Date() - flowLogger.sessionStart
    },
    nodeAnalysis: {
      byType: {},
      orphaned: [],
      highestUpdates: null,
      mostConnected: null
    },
    edgeAnalysis: {
      byStyle: {},
      mostChanged: null
    },
    errors: [],
    insights: []
  };

  // Node analysis
  nodeStates.forEach((state, nodeId) => {
    const type = state.type;
    if (!analysis.nodeAnalysis.byType[type]) {
      analysis.nodeAnalysis.byType[type] = { count: 0, totalConnections: 0 };
    }
    analysis.nodeAnalysis.byType[type].count += 1;
    analysis.nodeAnalysis.byType[type].totalConnections += 
      state.connections.incoming.length + state.connections.outgoing.length;

    // Check for orphaned
    if (type !== 'namefunction' && 
        state.connections.incoming.length === 0 && 
        state.connections.outgoing.length === 0) {
      analysis.nodeAnalysis.orphaned.push(nodeId);
    }

    // Track updates
    if (!analysis.nodeAnalysis.highestUpdates || 
        state.dataHistory.length > analysis.nodeAnalysis.highestUpdates.updates) {
      analysis.nodeAnalysis.highestUpdates = {
        nodeId,
        type,
        updates: state.dataHistory.length - 1
      };
    }

    // Track connections
    const connCount = state.connections.incoming.length + state.connections.outgoing.length;
    if (!analysis.nodeAnalysis.mostConnected || 
        connCount > analysis.nodeAnalysis.mostConnected.connections) {
      analysis.nodeAnalysis.mostConnected = {
        nodeId,
        type,
        connections: connCount
      };
    }
  });

  // Edge analysis
  edgeConnections.forEach((conn, edgeId) => {
    const style = conn.styleHistory[conn.styleHistory.length - 1]?.style || 'unknown';
    if (!analysis.edgeAnalysis.byStyle[style]) {
      analysis.edgeAnalysis.byStyle[style] = 0;
    }
    analysis.edgeAnalysis.byStyle[style] += 1;

    // Track changes
    if (!analysis.edgeAnalysis.mostChanged || 
        conn.styleHistory.length > analysis.edgeAnalysis.mostChanged.changes) {
      analysis.edgeAnalysis.mostChanged = {
        edgeId,
        changes: conn.styleHistory.length - 1
      };
    }
  });

  // Generate insights
  if (analysis.nodeAnalysis.orphaned.length > 0) {
    analysis.insights.push(`⚠️ ${analysis.nodeAnalysis.orphaned.length} orphaned nodes detected`);
    analysis.errors.push(...analysis.nodeAnalysis.orphaned);
  }

  if (analysis.nodeAnalysis.highestUpdates?.updates > 5) {
    analysis.insights.push(
      `🔄 Node ${analysis.nodeAnalysis.highestUpdates.nodeId} updated ${analysis.nodeAnalysis.highestUpdates.updates} times`
    );
  }

  // Validation
  const validationLog = logs.find(l => l.type === 'FLOW_VALIDATION');
  if (validationLog && !validationLog.isValid) {
    analysis.insights.push(`❌ Flow validation failed with ${validationLog.issueCount} issues`);
  }

  return analysis;
};

/**
 * Get flow diagram as ASCII art
 */
export const generateFlowDiagram = () => {
  const nodeStates = flowLogger.nodeStates;
  const edgeConnections = flowLogger.edgeConnections;

  let diagram = '\n========== FLOW DIAGRAM ==========\n\n';

  // Sort nodes by creation time
  const sortedNodes = Array.from(nodeStates.entries())
    .sort((a, b) => a[1].createdAt - b[1].createdAt);

  sortedNodes.forEach(([nodeId, state]) => {
    diagram += `\n📦 ${state.type.toUpperCase()} [${nodeId}]\n`;
    diagram += `   Created: ${state.createdAt.toLocaleTimeString()}\n`;
    
    if (state.connections.incoming.length > 0) {
      diagram += `   ↓ From: `;
      diagram += state.connections.incoming.map(c => `${c.source}(${c.handle})`).join(', ');
      diagram += '\n';
    }
    
    if (state.connections.outgoing.length > 0) {
      diagram += `   ↑ To: `;
      diagram += state.connections.outgoing.map(c => `${c.target}(${c.handle})`).join(', ');
      diagram += '\n';
    }

    diagram += `   📊 Data Updates: ${state.dataHistory.length - 1}\n`;
  });

  diagram += '\n========== EDGES ==========\n';
  edgeConnections.forEach((conn, edgeId) => {
    const style = conn.styleHistory[conn.styleHistory.length - 1]?.style || 'unknown';
    diagram += `\n→ ${edgeId}\n`;
    diagram += `  ${conn.connection.sourceNodeId}(${conn.connection.sourceHandle}) → ${conn.connection.targetNodeId}(${conn.connection.targetHandle})\n`;
    diagram += `  Style: ${style}\n`;
  });

  diagram += '\n====================================\n';
  return diagram;
};

export default {
  exportLogsToFile,
  exportLogsToCSV,
  generateLogReport,
  analyzeLogs,
  generateFlowDiagram
};
