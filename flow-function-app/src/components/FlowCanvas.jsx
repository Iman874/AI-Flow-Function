import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  MiniMap,
} from "reactflow";
import "reactflow/dist/style.css";
import useFlowLogger from "../hooks/useFlowLogger";
import { flowLogger } from "../utils/log/FlowLogger";

import VariableNode from "./CustomNodes/VariableNode";
import IfNode from "./CustomNodes/IfNode";
import ElseNode from "./CustomNodes/ElseNode";
import NameFunctionNode from "./CustomNodes/NameFunctionNode";
import ParameterNode from "./CustomNodes/ParameterNode";
import ProcessNode from "./CustomNodes/ProcessNode";
import ConditionNode from "./CustomNodes/ConditionNode";
import LoopNode from "./CustomNodes/LoopNode";
import ReturnNode from "./CustomNodes/ReturnNode";
import InputNode from "./CustomNodes/InputNode.jsx";
import OutputNode from "./CustomNodes/OutputNode.jsx";
import NavPropertiesNode from "../nav/right_nav_propertis_node";
import { validateConnection } from "./Rules Nodes/index.js";
import GenerateCodeModal from "./GenerateCodeModal.jsx";
import { pseudoToFlow } from "../utils/pseudoToFlow.js";
import EdgeStyleModal from "./EdgeStyleModal.jsx";
import { useEdgeStyle } from "../hooks/useEdgeStyle.js";
import TerminalOutput from "./TerminalOutput.jsx";
import InputModal from "./InputModal.jsx";
import { useCodeExecution } from "../hooks/useCodeExecution.js";
import { generateCode } from "../utils/generateCode/index.js";

const nodeTypes = {
  variable: VariableNode,
  if: IfNode,
  else: ElseNode,
  namefunction: NameFunctionNode,
  parameter: ParameterNode,
  process: ProcessNode,
  condition: ConditionNode,
  loop: LoopNode,
  return: ReturnNode,
  input: InputNode,
  output: OutputNode,
};

const NODE_HEIGHT = 140;
const COLLISION_PADDING = 24;

const estimateSize = (node) => {
  const width = node?.data?.styleExpandWidth || node?.data?.width || 340;
  const height = node?.data?.height || NODE_HEIGHT;
  return { width, height };
};

const nodesOverlap = (a, b, padding = COLLISION_PADDING) => {
  const sizeA = estimateSize(a);
  const sizeB = estimateSize(b);
  return !(
    a.position.x + sizeA.width + padding < b.position.x - padding ||
    b.position.x + sizeB.width + padding < a.position.x - padding ||
    a.position.y + sizeA.height + padding < b.position.y - padding ||
    b.position.y + sizeB.height + padding < a.position.y - padding
  );
};

const resolveCollisions = (incoming = []) => {
  const placed = [];
  return incoming.map((node) => {
    let pos = { ...(node.position || { x: 0, y: 0 }) };
    let safety = 0;
    let candidate = { ...node, position: pos };
    while (placed.some((p) => nodesOverlap(candidate, p)) && safety < 80) {
      pos = { x: pos.x + 60, y: pos.y + 40 };
      safety += 1;
      candidate = { ...candidate, position: pos };
    }
    const placedNode = { ...node, position: pos };
    placed.push(placedNode);
    return placedNode;
  });
};

const detectLayoutIssues = (nodes) => {
  const issues = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (nodesOverlap(nodes[i], nodes[j])) {
        issues.push({ a: nodes[i].id, b: nodes[j].id });
      }
    }
  }
  return issues;
};

const FlowCanvas = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [showModal, setShowModal] = useState(false);
  const [showEdgeStyleModal, setShowEdgeStyleModal] = useState(false);
  const [selectedEdge, setSelectedEdge] = useState(null);

  // Terminal modal state
  const [showTerminal, setShowTerminal] = useState(false);
  const { output, error, isRunning, executionTime, executeCode, clearOutput } = useCodeExecution();

  // Input modal state
  const [showInputModal, setShowInputModal] = useState(false);
  const [requiredInputs, setRequiredInputs] = useState([]);

  // Logger hook
  const { logNodeCreated, logNodeDataUpdated, logEdgeCreated, logConnectionValidation, logEdgeStyleChanged, logFlowGraphSummary, logUILayoutIssue } = useFlowLogger('FlowCanvas');

  const [nodeColor, setNodeColor] = useState('#f8fafc');
  const [edgeColor, setEdgeColor] = useState('#6366f1');
  const [trueEdgeColor, setTrueEdgeColor] = useState('#22c55e');
  const [falseEdgeColor, setFalseEdgeColor] = useState('#ef4444');
  const lastLayoutIssueHash = useRef('');

  // Hook untuk edge styling
  const { getEdgeProperties, applyEdgeStyle, applyEdgeStyleToAll, setDefaultEdgeStyle } = useEdgeStyle();

  // Normalize edges with current default style (used for imports / pseudoToFlow)
  const applyDefaultEdgeProps = useCallback(
    (rawEdges = []) =>
      rawEdges.map((edge) => {
        const edgeStyleKey = edge?.data?.edgeStyle;
        const base = getEdgeProperties(edgeStyleKey);
        const stroke = edge.style?.stroke ||
          (edge.sourceHandle === 'trueOutput' ? trueEdgeColor : edge.sourceHandle === 'falseOutput' ? falseEdgeColor : edgeColor);
        return {
          ...edge,
          ...base,
          type: base.type,
          animated: base.animated,
          style: { ...base.style, ...(edge.style || {}), stroke },
          data: { ...edge.data, edgeStyle: edgeStyleKey || base.data.edgeStyle },
        };
      }),
    [getEdgeProperties, edgeColor, trueEdgeColor, falseEdgeColor]
  );

  // memoize nodeTypes so ReactFlow doesn't warn about new object each render
  const memoNodeTypes = useMemo(() => nodeTypes, []);

  // Patch node helper (must be defined before onConnect)
  const patchNode = useCallback(
    (id, patch) => {
      setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n)));
    },
    [setNodes]
  );

  // 🔗 koneksi antar node
  const onConnect = useCallback(
    (params) => {
      const sourceNode = nodes.find((n) => n.id === params.source);
      const targetNode = nodes.find((n) => n.id === params.target);

      // Propagate varName for Input→Variable and Variable→Input BEFORE any other rules
      if (sourceNode?.type === "input" && targetNode?.type === "variable") {
        const newVar = sourceNode.data?.varName || "unknown";
        patchNode(targetNode.id, { varName: newVar });
        patchNode(sourceNode.id, { varName: newVar });
        const edgeProps = getEdgeProperties();
        setEdges((eds) => addEdge({ ...params, ...edgeProps }, eds));
        return;
      }
      if (sourceNode?.type === "variable" && targetNode?.type === "input") {
        const newVar = sourceNode.data?.varName || "unknown";
        patchNode(targetNode.id, { varName: newVar });
        patchNode(sourceNode.id, { varName: newVar });
        const edgeProps = getEdgeProperties();
        setEdges((eds) => addEdge({ ...params, ...edgeProps }, eds));
        return;
      }

      // ...existing connection validation and rules...
      const res = validateConnection(
        {
          sourceNode,
          targetNode,
          sourceHandle: params.sourceHandle,
          targetHandle: params.targetHandle,
        },
        nodes
      );

      // Log validation result
      const isValid = res !== false && (!res || res.valid !== false);
      logConnectionValidation(
        params.source,
        params.target,
        params.sourceHandle,
        params.targetHandle,
        isValid,
        (res && res.msg) || ''
      );

      if (res === false || (res && res.valid === false)) {
        alert((res && res.msg) || 'Koneksi tidak valid!');
        return;
      }

      const edgeProps = getEdgeProperties();
      const edgeId = `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const baseStroke =
        params.targetHandle === "varInput" ||
          params.targetHandle === "defaultVarInput" ||
          params.targetHandle === "conditionVarInput" ||
          params.targetHandle === "counterVarInput"
          ? "#8b5cf6"
          : params.sourceHandle === 'trueOutput'
            ? trueEdgeColor
            : params.sourceHandle === 'falseOutput'
              ? falseEdgeColor
              : edgeColor;

      // Log edge creation
      logEdgeCreated(
        edgeId,
        params.source,
        params.target,
        params.sourceHandle,
        params.targetHandle,
        edgeProps.data?.edgeStyle || 'corner'
      );

      setEdges((eds) =>
        addEdge(
          {
            id: edgeId,
            ...params,
            ...edgeProps,
            style: {
              ...edgeProps.style,
              stroke: baseStroke,
              strokeWidth: edgeProps.style.strokeWidth,
            },
          },
          eds
        )
      );
    },
    [nodes, setEdges, patchNode, getEdgeProperties, edgeColor, trueEdgeColor, falseEdgeColor]
  );

  // 🔄 update daftar variabel untuk Parameter, Process, Condition, Loop, dan Function (namefunction)
  useEffect(() => {
    // Sinkronisasi daftar variabel & detail parameter function.
    // Hindari loop: hanya panggil setNodes jika ada perubahan nyata.
    setNodes((nds) => {
      const varMap = {};
      const varDetailMap = {};
      edges.forEach((edge) => {
        const sourceNode = nds.find((n) => n.id === edge.source);
        const targetNode = nds.find((n) => n.id === edge.target);
        if (!sourceNode || !targetNode) return;

        // ...existing sync logic for other node types...
        if (
          (targetNode.type === "parameter" || targetNode.type === "process" || targetNode.type === "namefunction") &&
          edge.targetHandle === "varInput" &&
          sourceNode.type === "variable"
        ) {
          const name = sourceNode.data?.name || "unnamed";
          if (!varMap[targetNode.id]) varMap[targetNode.id] = [];
          if (!varMap[targetNode.id].includes(name)) varMap[targetNode.id].push(name);
          if (targetNode.type === 'namefunction') {
            const detail = {
              name,
              type: sourceNode.data?.varType || 'int',
              arraySize: sourceNode.data?.varType === 'array' ? (sourceNode.data?.arraySize ?? 1) : undefined,
              arrayDims: sourceNode.data?.varType === 'array' ? (sourceNode.data?.arrayDims ?? 1) : undefined,
            };
            if (!varDetailMap[targetNode.id]) varDetailMap[targetNode.id] = [];
            varDetailMap[targetNode.id].push(detail);
          }
        }

        // Variabel → Condition (default variable)
        if (
          targetNode.type === "condition" &&
          edge.targetHandle === "defaultVarInput" &&
          sourceNode.type === "variable"
        ) {
          const name = sourceNode.data?.name || "unnamed";
          if (!varMap[targetNode.id]) varMap[targetNode.id] = [];
          if (!varMap[targetNode.id].includes(name)) varMap[targetNode.id].push(name);
        }

        // Variabel → Loop (condition input)
        if (
          targetNode.type === "loop" &&
          edge.targetHandle === "conditionVarInput" &&
          sourceNode.type === "variable"
        ) {
          const name = sourceNode.data?.name || "unnamed";
          if (!varMap[targetNode.id]) varMap[targetNode.id] = [];
          if (!varMap[targetNode.id].includes(name)) varMap[targetNode.id].push(name);
        }

        // Variabel → Loop (counter input)
        if (
          targetNode.type === "loop" &&
          edge.targetHandle === "counterVarInput" &&
          sourceNode.type === "variable"
        ) {
          const name = sourceNode.data?.name || "unnamed";
          if (!varMap[targetNode.id]) varMap[targetNode.id] = [];
          if (!varMap[targetNode.id].includes(name)) varMap[targetNode.id].push(name);
        }
      });

      // Recompute details for each function node strictly from incoming varInput edges
      const functionDetailMap = {};
      nds.forEach((fn) => {
        if (fn.type !== 'namefunction') return;
        const incoming = edges.filter(e => e.target === fn.id && e.targetHandle === 'varInput');
        const details = incoming.map(e => {
          const src = nds.find(n => n.id === e.source);
          if (!src || src.type !== 'variable') return null;
          const name = src.data?.name || 'unnamed';
          const varType = src.data?.varType || 'int';
          return {
            name,
            type: varType,
            arraySize: varType === 'array' ? (src.data?.arraySize ?? 1) : undefined,
            arrayDims: varType === 'array' ? (src.data?.arrayDims ?? 1) : undefined,
          };
        }).filter(Boolean);
        functionDetailMap[fn.id] = details;
      });

      let changed = false;
      const newNodes = nds.map((n) => {
        if (
          n.type === "parameter" ||
          n.type === "process" ||
          n.type === "namefunction" ||
          n.type === "condition" ||
          n.type === "loop"
        ) {
          const functionNames = n.type === 'namefunction' ? (functionDetailMap[n.id] || []).map(d => d.name) : null;
          const newConnected = n.type === 'namefunction' ? functionNames : (varMap[n.id] || []);
          const prevConnected = n.data?.connectedVariables || [];
          const same =
            newConnected.length === prevConnected.length &&
            newConnected.every((v, i) => v === prevConnected[i]);
          if (n.type === 'namefunction') {
            const newDetails = functionDetailMap[n.id] || varDetailMap[n.id] || [];
            const prevDetails = n.data?.connectedVariableDetails || [];
            const sameDetails = (() => {
              if (newDetails.length !== prevDetails.length) return false;
              for (const d of newDetails) {
                const p = prevDetails.find(x => x.name === d.name);
                if (!p) return false;
                if (d.type !== p.type) return false;
                if (d.arraySize !== p.arraySize) return false;
                if (d.arrayDims !== p.arrayDims) return false;
              }
              return true;
            })();
            if (same && sameDetails) return n;
            changed = true;
            return { ...n, data: { ...n.data, connectedVariables: newConnected, connectedVariableDetails: newDetails } };
          }
          if (same) return n;
          changed = true;
          return { ...n, data: { ...n.data, connectedVariables: newConnected } };
        }
        return n;
      });
      return changed ? newNodes : nds;
    });
  }, [edges, nodes, setNodes]);

  // Log layout overlaps to help debugging UI collisions
  useEffect(() => {
    const issues = detectLayoutIssues(nodes);
    const hash = issues
      .map((i) => `${i.a}-${i.b}`)
      .sort()
      .join('|');
    if (hash !== lastLayoutIssueHash.current) {
      if (issues.length) {
        logUILayoutIssue(issues);
      }
      lastLayoutIssueHash.current = hash;
    }
  }, [nodes, logUILayoutIssue]);

  // Recolor existing edges when palette changes (without touching var-highlighted links)
  useEffect(() => {
    setEdges((eds) => eds.map((edge) => {
      const isVarTarget = edge.targetHandle === "varInput" || edge.targetHandle === "defaultVarInput" || edge.targetHandle === "conditionVarInput" || edge.targetHandle === "counterVarInput";
      const stroke = isVarTarget
        ? edge.style?.stroke || "#8b5cf6"
        : edge.sourceHandle === 'trueOutput'
          ? trueEdgeColor
          : edge.sourceHandle === 'falseOutput'
            ? falseEdgeColor
            : edgeColor;
      return { ...edge, style: { ...(edge.style || {}), stroke } };
    }));
  }, [edgeColor, trueEdgeColor, falseEdgeColor, setEdges]);

  // Copy/Paste + Delete handling
  const copiedNodesRef = useRef([]);
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.defaultPrevented) return;
      const target = event.target;
      const tag = (target && target.tagName ? target.tagName.toLowerCase() : "");
      const isEditable =
        (tag === "input" || tag === "textarea" || tag === "select") ||
        (target && target.isContentEditable);
      if (isEditable) return;

      // Delete selected nodes/edges
      if (event.key === "Delete") {
        setNodes((nds) => nds.filter((node) => !node.selected));
        setEdges((eds) => eds.filter((edge) => !edge.selected));
      }

      // Copy selected nodes (styles & data) Ctrl+C
      if (event.ctrlKey && event.key.toLowerCase() === 'c') {
        const selected = nodes.filter(n => n.selected);
        if (selected.length > 0) {
          // Deep clone data to avoid accidental shared references
          copiedNodesRef.current = selected.map(n => ({
            id: n.id,
            type: n.type,
            position: { ...n.position },
            data: JSON.parse(JSON.stringify(n.data || {})),
          }));
        }
      }

      // Paste copied nodes Ctrl+V
      if (event.ctrlKey && event.key.toLowerCase() === 'v') {
        if (copiedNodesRef.current.length > 0) {
          const now = Date.now();
          const newNodes = copiedNodesRef.current.map((n, idx) => {
            // Only set default style if not present
            const data = {
              ...JSON.parse(JSON.stringify(n.data || {})),
              ...(n.data?.styleSizeMode ? {} : { styleSizeMode: "expand" }),
              ...(n.data?.styleExpandWidth ? {} : { styleExpandWidth: 340 }),
              ...(n.data?.styleCardBg ? {} : { styleCardBg: nodeColor }),
              ...(n.data?.styleHeaderBg ? {} : { styleHeaderBg: "#eef2ff" }),
            };
            return {
              id: `${now}-${idx}-${Math.random().toString(36).slice(2, 8)}`,
              type: n.type,
              position: { x: n.position.x + 40, y: n.position.y + 40 },
              data,
            };
          });
          setNodes(nds => nds.concat(newNodes));
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nodes, setNodes, setEdges]);

  // Derive the selected node directly from nodes to avoid flicker
  const selectedNode = useMemo(() => nodes.find((n) => n.selected) || null, [nodes]);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("application/reactflow");
      const position = { x: event.clientX - 300, y: event.clientY - 100 };
      const nodeId = String(Date.now());
      const newNode = {
        id: nodeId,
        type: type.toLowerCase().replace(/\s+/g, ""),
        position,
        data: {
          styleSizeMode: "expand",
          styleExpandWidth: 340,
          styleCardBg: nodeColor,
          styleHeaderBg: "#eef2ff",
        },
      };

      // Log node creation
      logNodeCreated(nodeId, newNode.type, position, newNode.data);

      setNodes((nds) => resolveCollisions(nds.concat(newNode)));
    },
    [setNodes, logNodeCreated, nodeColor]
  );

  const onDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  // ...existing code...

  const [description, setDescription] = useState("");

  const handlePseudoSubmit = () => {
    if (!description.trim()) return;
    const { nodes: newNodes, edges: newEdges } = pseudoToFlow(description, {
      defaultNodeColor: nodeColor,
      defaultEdgeColor: edgeColor,
      trueEdgeColor,
      falseEdgeColor,
    });
    const laidOutNodes = resolveCollisions(newNodes);
    const styledEdges = applyDefaultEdgeProps(newEdges);

    // Log pseudocode parsing
    flowLogger.logPseudocodeParsing(description, laidOutNodes, styledEdges);

    setNodes(laidOutNodes);
    setEdges(styledEdges);

    // Log flow graph after import
    setTimeout(() => {
      flowLogger.logFlowGraphSummary(laidOutNodes, styledEdges);
    }, 100);
  };

  // Handle edge click untuk membuka style modal
  const onEdgeClick = useCallback((event, edge) => {
    event.stopPropagation();
    setSelectedEdge(edge);
    setShowEdgeStyleModal(true);
  }, []);

  // Handle edge style application
  const handleEdgeStyleApply = useCallback((config) => {
    const { edgeId, style, applyToAll, setAsDefault } = config;

    if (setAsDefault) {
      setDefaultEdgeStyle(style);
    }

    if (applyToAll) {
      // Apply ke semua edges
      setEdges((eds) => applyEdgeStyleToAll(eds, style));
    } else {
      // Apply ke single edge
      setEdges((eds) => applyEdgeStyle(eds, edgeId, style));
    }

    setShowEdgeStyleModal(false);
    setSelectedEdge(null);
  }, [applyEdgeStyle, applyEdgeStyleToAll, setDefaultEdgeStyle]);

  return (
    <div className="w-full h-full relative">
      <div className="absolute top-4 left-4 z-40 bg-white border border-gray-200 rounded-lg shadow-sm px-3 py-2 flex flex-col gap-2 pointer-events-auto">
        <div className="text-xs font-semibold text-gray-700">Canvas Colors</div>
        <label className="text-[11px] text-gray-600 flex items-center gap-2">
          Node
          <input type="color" value={nodeColor} onChange={(e) => setNodeColor(e.target.value)} className="w-6 h-6 p-0 border" />
        </label>
        <label className="text-[11px] text-gray-600 flex items-center gap-2">
          Edge
          <input type="color" value={edgeColor} onChange={(e) => setEdgeColor(e.target.value)} className="w-6 h-6 p-0 border" />
        </label>
        <label className="text-[11px] text-gray-600 flex items-center gap-2">
          True Branch
          <input type="color" value={trueEdgeColor} onChange={(e) => setTrueEdgeColor(e.target.value)} className="w-6 h-6 p-0 border" />
        </label>
        <label className="text-[11px] text-gray-600 flex items-center gap-2">
          False Branch
          <input type="color" value={falseEdgeColor} onChange={(e) => setFalseEdgeColor(e.target.value)} className="w-6 h-6 p-0 border" />
        </label>
        <div className="text-[11px] text-gray-500">Edge colors will apply to new imports & connections.</div>
      </div>
      <ReactFlow
        nodeTypes={Object.fromEntries(
          Object.entries(memoNodeTypes).map(([key, Comp]) => [
            key,
            (props) =>
              key === 'input'
                ? <Comp {...props} patchNode={patchNode} />
                : key === 'process'
                  ? <Comp {...props} patchNode={patchNode} />
                  : key === 'condition'
                    ? <Comp {...props} patchNode={patchNode} />
                    : <Comp {...props} />,
          ])
        )}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeClick={onEdgeClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        fitView
      >
        {/* kembali ke background titik-titik */}
        <Background color="#555" gap={16} size={1} />
        <Controls />
      </ReactFlow>
      {/* Floating footer overlay (transparent, pass-through) */}
      <div
        className="absolute bottom-8 left-0 flex justify-center w-full pointer-events-none z-40"
        style={selectedNode ? { right: 320 } : { right: 0 }}
      >
        <div className="flex items-center gap-3 px-4" >
          {/* Description input */}
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="describe your function here"
            className="pointer-events-auto w-[480px] bg-white rounded-lg shadow-md px-4 py-2.5 text-sm outline-none border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-300"
          />
          {/* Arrow button */}
          <button
            className="pointer-events-auto h-10 w-10 rounded-lg bg-white shadow-md border border-gray-300 flex items-center justify-center text-indigo-600 font-bold hover:bg-indigo-50 active:scale-95 transition"
            title="Submit description"
            onClick={handlePseudoSubmit}
          >
            &gt;
          </button>
          {/* Action card */}
          <div className="pointer-events-auto bg-white shadow-lg rounded-xl px-6 py-3 flex items-center gap-10 border border-gray-300">
            {/* Run tile */}
            <button
              className="group flex flex-col items-center gap-1.5"
              title="Run Python Code"
              onClick={async () => {
                // Check if we need inputs
                const inputNodes = nodes.filter(n => n.type === 'input');

                if (inputNodes.length > 0) {
                  // Collect variable names for prompt
                  const inputs = inputNodes.map(n => n.data.varName || n.data.variable || 'unknown');
                  setRequiredInputs(inputs);
                  setShowInputModal(true);
                } else {
                  // No inputs needed, run directly
                  const pythonCode = generateCode('python', nodes, edges);
                  if (pythonCode && !pythonCode.startsWith('//')) {
                    setShowTerminal(true);
                    await executeCode(pythonCode);
                  } else {
                    alert('Please create a valid flow diagram or check for validation errors before running.');
                  }
                }
              }}
            >
              <div className="h-11 w-11 rounded-lg bg-white shadow-sm border border-gray-300 flex items-center justify-center group-hover:border-green-500 group-hover:shadow-md group-active:scale-95 transition">
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-green-500" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
              </div>
              <span className="text-xs font-semibold text-gray-700">Run</span>
            </button>
            {/* Generate Code tile */}
            <button
              className="group flex flex-col items-center gap-1.5"
              title="Generate Code"
              onClick={() => setShowModal(true)}
            >
              <div className="h-11 w-11 rounded-lg bg-white shadow-sm border border-gray-300 flex items-center justify-center group-hover:border-indigo-600 group-hover:shadow-md group-active:scale-95 transition">
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="14" rx="2" />
                  <path d="M8 8h8M8 12h5" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-gray-700">Generate Code</span>
            </button>
          </div>
        </div>
      </div>

      {selectedNode && (
        <div className="absolute top-0 right-0 h-full z-50 pointer-events-auto">
          <NavPropertiesNode node={selectedNode} onPatch={patchNode} />
        </div>
      )}

      {/* Generate Code Modal */}
      {showModal && (
        <GenerateCodeModal
          nodes={nodes}
          edges={edges}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Input Promot Modal */}
      {showInputModal && (
        <InputModal
          inputs={requiredInputs}
          onClose={() => setShowInputModal(false)}
          onRun={async (values) => {
            setShowInputModal(false);
            const pythonCode = generateCode('python', nodes, edges);
            if (pythonCode && !pythonCode.startsWith('//')) {
              setShowTerminal(true);
              await executeCode(pythonCode, values);
            }
          }}
        />
      )}

      {/* Terminal Modal */}
      {showTerminal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-3/4 max-w-4xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold">Python Execution Output</h2>
              <div className="flex items-center gap-2">
                {executionTime > 0 && (
                  <span className="text-sm text-gray-500">Time: {executionTime.toFixed(3)}s</span>
                )}
                <button
                  onClick={clearOutput}
                  className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
                >
                  Clear
                </button>
                <button
                  onClick={() => setShowTerminal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold px-2"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-4 flex-1 overflow-auto bg-gray-900">
              <TerminalOutput output={output} error={error} isRunning={isRunning} />
            </div>
          </div>
        </div>
      )}

      {/* Edge Style Modal */}
      {showEdgeStyleModal && selectedEdge && (
        <EdgeStyleModal
          selectedEdge={selectedEdge}
          onApply={handleEdgeStyleApply}
          onClose={() => {
            setShowEdgeStyleModal(false);
            setSelectedEdge(null);
          }}
        />
      )}
    </div>
  );
};

export default FlowCanvas;
