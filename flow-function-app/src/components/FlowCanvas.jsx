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
import NavPropertiesNode from "../nav/nav_propertis_node";
import { validateConnection } from "./Rules Nodes/index.js";
import GenerateCodeModal from "./GenerateCodeModal.jsx";
import { pseudoToFlow } from "../utils/pseudoToFlow.js";

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

const FlowCanvas = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [showModal, setShowModal] = useState(false);

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
        setEdges((eds) => addEdge({ ...params, animated: true }, eds));
        return;
      }
      if (sourceNode?.type === "variable" && targetNode?.type === "input") {
        const newVar = sourceNode.data?.varName || "unknown";
        patchNode(targetNode.id, { varName: newVar });
        patchNode(sourceNode.id, { varName: newVar });
        setEdges((eds) => addEdge({ ...params, animated: true }, eds));
        return;
      }

      // ...existing connection validation and rules...
      const res = validateConnection(sourceNode, targetNode, params.sourceHandle, params.targetHandle);
      if (!res.valid) {
        alert(res.msg || 'Koneksi tidak valid!');
        return;
      }
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            style: {
              stroke:
                params.targetHandle === "varInput" ||
                params.targetHandle === "defaultVarInput" ||
                params.targetHandle === "conditionVarInput" ||
                params.targetHandle === "counterVarInput"
                  ? "#8b5cf6"
                  : "#555",
              strokeWidth: 2,
            },
          },
          eds
        )
      );
    },
    [nodes, setEdges, patchNode]
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
            };
            return {
              id: `${now}-${idx}-${Math.random().toString(36).slice(2,8)}`,
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
      const newNode = {
        id: String(Date.now()),
        type: type.toLowerCase().replace(/\s+/g, ""),
        position,
        data: {
          styleSizeMode: "expand",
          styleExpandWidth: 340,
        },
      };
      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  const onDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  // ...existing code...

  const [description, setDescription] = useState("");

  const handlePseudoSubmit = () => {
    if (!description.trim()) return;
    const { nodes: newNodes, edges: newEdges } = pseudoToFlow(description);
    setNodes(newNodes);
    setEdges(newEdges);
  };

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodeTypes={Object.fromEntries(Object.entries(memoNodeTypes).map(([key, Comp]) => [key, (props) => key === 'input' ? <Comp {...props} patchNode={patchNode} /> : <Comp {...props} />]))}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
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
        className="absolute bottom-6 left-0 flex justify-center w-full pointer-events-none z-40"
        style={selectedNode ? { right: 320 } : { right: 0 }}
      >
        <div className="flex items-center gap-4 px-4" >
          {/* Description input */}
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="describe your function here"
            className="pointer-events-auto w-[520px] bg-white rounded-md shadow-sm px-4 py-2 text-sm outline-none border border-gray-200 focus:border-indigo-400"
          />
          {/* Arrow button */}
          <button
            className="pointer-events-auto h-10 w-10 rounded-md bg-white shadow-sm border border-gray-200 flex items-center justify-center text-indigo-600 font-bold hover:bg-indigo-50 active:scale-95"
            title="Submit description"
            onClick={handlePseudoSubmit}
          >
            &gt;
          </button>
          {/* Action card */}
          <div className="pointer-events-auto bg-white shadow-md rounded-xl px-8 py-4 flex items-end gap-12 border border-gray-200">
            {/* Run tile */}
            <button
              className="group flex flex-col items-center gap-1"
              title="Run"
            >
              <div className="h-12 w-12 rounded-md bg-white shadow-sm border border-gray-200 flex items-center justify-center group-hover:border-green-500 group-hover:shadow group-active:scale-95 transition">
                <svg viewBox="0 0 24 24" className="h-6 w-6 text-green-500" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
              </div>
              <span className="text-xs font-medium text-gray-700">Run</span>
            </button>
            {/* Generate Code tile */}
            <button
              className="group flex flex-col items-center gap-1"
              title="Generate Code"
              onClick={() => setShowModal(true)}
            >
              <div className="h-12 w-12 rounded-md bg-white shadow-sm border border-gray-200 flex items-center justify-center group-hover:border-indigo-600 group-hover:shadow group-active:scale-95 transition">
                <svg viewBox="0 0 24 24" className="h-6 w-6 text-gray-900" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="14" rx="2" />
                  <path d="M8 8h8M8 12h5" />
                </svg>
              </div>
              <span className="text-xs font-medium text-gray-700">Generate Code</span>
            </button>
          </div>
        </div>
      </div>

      {selectedNode && (
        <div className="absolute top-0 right-0 h-full z-50 pointer-events-auto">
          <NavPropertiesNode node={selectedNode} onPatch={patchNode} />
        </div>
      )}
    {/* Modal rendering inside main div */}
    {showModal && (
      <GenerateCodeModal
        nodes={nodes}
        edges={edges}
        onClose={() => setShowModal(false)}
      />
    )}
  </div>
  );
};

export default FlowCanvas;
