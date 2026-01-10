/**
 * LogViewer Component - Real-time log viewer untuk debugging flow
 * Displays logs, node states, edges, dan flow validation
 */

import React, { useState, useEffect, useRef } from 'react';
import { flowLogger } from '../utils/log/FlowLogger';

const LogViewer = ({ isOpen = false, onClose }) => {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [autoScroll, setAutoScroll] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const [tab, setTab] = useState('logs'); // 'logs', 'nodes', 'edges', 'flow'
  const logsEndRef = useRef(null);
  const updateIntervalRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  // Poll for new logs
  useEffect(() => {
    const updateLogs = () => {
      setLogs([...flowLogger.logs]);
    };

    updateIntervalRef.current = setInterval(updateLogs, 500);
    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  // Filter logs
  let displayedLogs = logs;
  if (filter !== 'ALL') {
    displayedLogs = logs.filter(log => log.type === filter);
  }

  // Get unique log types for filter
  const logTypes = ['ALL', ...new Set(logs.map(l => l.type))];

  // Get log statistics
  const stats = {
    total: logs.length,
    byType: {}
  };
  logs.forEach(log => {
    stats.byType[log.type] = (stats.byType[log.type] || 0) + 1;
  });

  // Get node and edge summaries
  const nodeStates = Array.from(flowLogger.nodeStates.entries()).map(([nodeId, state]) => ({
    nodeId,
    ...state,
    connectionCount: state.connections.incoming.length + state.connections.outgoing.length
  }));

  const edgeStates = Array.from(flowLogger.edgeConnections.entries()).map(([edgeId, conn]) => ({
    edgeId,
    ...conn
  }));

  // Get log type color
  const getLogColor = (type) => {
    const colors = {
      'NODE_CREATED': 'bg-green-100 text-green-800',
      'NODE_DATA_UPDATED': 'bg-blue-100 text-blue-800',
      'EDGE_CREATED': 'bg-purple-100 text-purple-800',
      'EDGE_STYLE_CHANGED': 'bg-indigo-100 text-indigo-800',
      'CONNECTION_VALIDATION': 'bg-yellow-100 text-yellow-800',
      'VARIABLES_CONNECTED': 'bg-cyan-100 text-cyan-800',
      'PSEUDOCODE_PARSING': 'bg-orange-100 text-orange-800',
      'CONDITION_BRANCHING': 'bg-red-100 text-red-800',
      'PROCESS_EXECUTION': 'bg-pink-100 text-pink-800',
      'IO_OPERATION': 'bg-teal-100 text-teal-800',
      'FLOW_VALIDATION': 'bg-lime-100 text-lime-800',
      'NODE_STATE_SUMMARY': 'bg-gray-100 text-gray-800',
      'FLOW_GRAPH_SUMMARY': 'bg-slate-100 text-slate-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed bottom-0 right-0 w-full h-96 bg-white border-t-2 border-gray-300 shadow-lg rounded-t-lg z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 text-white px-4 py-3 flex justify-between items-center rounded-t-lg">
        <div>
          <h2 className="text-lg font-bold">Flow Logger</h2>
          <p className="text-xs text-gray-300">
            Total logs: {stats.total} | Active types: {Object.keys(stats.byType).length}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              flowLogger.clearLogs();
              setLogs([]);
            }}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded"
          >
            Clear
          </button>
          <button
            onClick={() => {
              const json = JSON.stringify(flowLogger.exportLogsJSON(), null, 2);
              const blob = new Blob([json], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `flow-logs-${new Date().getTime()}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded"
          >
            Export
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded"
          >
            Close
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-100 border-b flex gap-1 px-3 py-2">
        {['logs', 'nodes', 'edges', 'flow'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1 text-sm font-medium rounded ${
              tab === t
                ? 'bg-blue-600 text-white'
                : 'bg-gray-300 text-gray-800 hover:bg-gray-400'
            }`}
          >
            {t.toUpperCase()}
            {tab === 'logs' && ` (${displayedLogs.length})`}
            {tab === 'nodes' && ` (${nodeStates.length})`}
            {tab === 'edges' && ` (${edgeStates.length})`}
          </button>
        ))}
      </div>

      {/* Filter */}
      {tab === 'logs' && (
        <div className="bg-gray-50 border-b px-3 py-2 flex gap-2 items-center">
          <label className="text-sm font-medium">Filter:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-2 py-1 text-sm border rounded"
          >
            {logTypes.map(type => (
              <option key={type} value={type}>
                {type} {stats.byType[type] ? `(${stats.byType[type]})` : ''}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 ml-auto text-sm">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
            />
            Auto-scroll
          </label>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto bg-white font-mono text-xs">
        {tab === 'logs' && (
          <div>
            {displayedLogs.length === 0 ? (
              <div className="p-4 text-gray-500">No logs to display</div>
            ) : (
              displayedLogs.map((log, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedLog(selectedLog === idx ? null : idx)}
                  className={`border-b p-2 cursor-pointer hover:bg-gray-50 ${
                    selectedLog === idx ? 'bg-gray-100' : ''
                  }`}
                >
                  <div className={`inline-block px-2 py-1 rounded text-xs font-bold mb-1 ${getLogColor(log.type)}`}>
                    {log.type}
                  </div>
                  <div className="text-gray-500 text-xs">
                    {log.timestamp.toLocaleTimeString()}
                  </div>
                  <div className="text-gray-800 mt-1">{log.message}</div>
                  
                  {selectedLog === idx && (
                    <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                      <pre className="whitespace-pre-wrap break-words">
                        {JSON.stringify(log, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>
        )}

        {tab === 'nodes' && (
          <div>
            {nodeStates.length === 0 ? (
              <div className="p-4 text-gray-500">No nodes created yet</div>
            ) : (
              nodeStates.map((node, idx) => (
                <div key={idx} className="border-b p-2 hover:bg-gray-50">
                  <div className="font-bold text-blue-700">
                    {node.nodeType.toUpperCase()} - {node.nodeId}
                  </div>
                  <div className="text-gray-600 text-xs mt-1">
                    <div>Created: {node.createdAt.toLocaleTimeString()}</div>
                    <div>Updates: {node.dataHistory.length - 1}</div>
                    <div>Connections: {node.connectionCount} (↓{node.connections.incoming.length} ↑{node.connections.outgoing.length})</div>
                  </div>
                  <div className="text-gray-700 mt-2">
                    <div className="font-semibold text-xs">Current Data:</div>
                    <pre className="text-xs bg-gray-100 p-1 rounded mt-1 whitespace-pre-wrap break-words">
                      {JSON.stringify(node.dataHistory[node.dataHistory.length - 1], null, 2)}
                    </pre>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'edges' && (
          <div>
            {edgeStates.length === 0 ? (
              <div className="p-4 text-gray-500">No edges created yet</div>
            ) : (
              edgeStates.map((edge, idx) => (
                <div key={idx} className="border-b p-2 hover:bg-gray-50">
                  <div className="font-bold text-purple-700">
                    {edge.connection.sourceNodeId}({edge.connection.sourceHandle}) → {edge.connection.targetNodeId}({edge.connection.targetHandle})
                  </div>
                  <div className="text-gray-600 text-xs mt-1">
                    <div>Edge ID: {edge.edgeId}</div>
                    <div>Created: {edge.createdAt.toLocaleTimeString()}</div>
                    <div>Style changes: {edge.styleHistory.length - 1}</div>
                  </div>
                  <div className="text-gray-700 mt-2">
                    <div className="font-semibold text-xs">Style History:</div>
                    <div className="text-xs">
                      {edge.styleHistory.map((h, i) => (
                        <div key={i} className="text-gray-600">
                          {i === 0 ? '→' : '→'} {h.style} @ {h.timestamp.toLocaleTimeString()}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'flow' && (
          <div>
            {flowLogger.processFlow.length === 0 ? (
              <div className="p-4 text-gray-500">No process flow events yet</div>
            ) : (
              flowLogger.processFlow.map((log, idx) => (
                <div key={idx} className="border-b p-2">
                  <div className={`inline-block px-2 py-1 rounded text-xs font-bold ${getLogColor(log.type)}`}>
                    {log.type}
                  </div>
                  <div className="text-gray-800 mt-1">{log.message}</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LogViewer;
