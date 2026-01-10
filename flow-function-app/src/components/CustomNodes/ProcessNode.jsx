import NodeWindowControls from "./NodeWindowControls.jsx";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Handle, Position, useReactFlow } from "reactflow";

const PROCESS_TEMPLATES = [
  { key: "custom", label: "Custom" },
  { key: "addition", label: "Addition (a + b)" },
  { key: "subtraction", label: "Subtraction (a - b)" },
  { key: "multiplication", label: "Multiplication (a * b)" },
  { key: "division", label: "Division (a / b)" },
  { key: "assignment", label: "Assignment (a = b)" },
];
const ProcessNode = ({ id, data, selected, patchNode }) => {
  const connectedVars = data?.connectedVariables || [];
  const [collapsed, setCollapsed] = useState(!!data?.collapsed);
  const [template, setTemplate] = useState(data?.template || "custom");
  const { setNodes } = useReactFlow();

  const updateData = useCallback(
    (patch) => {
      if (patchNode) {
        patchNode(id, patch);
      } else {
        setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n)));
      }
    },
    [id, patchNode, setNodes]
  );

  React.useEffect(() => {
    if ((data?.collapsed ? true : false) !== collapsed) setCollapsed(!!data?.collapsed);
  }, [data?.collapsed]);
  React.useEffect(() => {
    if ((data?.template || "custom") !== template) setTemplate(data?.template || "custom");
  }, [data?.template]);

  const handleTemplateChange = (val) => {
    setTemplate(val);
    const label = val === "custom" ? (data.label || "Process") : `Process: ${val}`;
    updateData({ template: val, label });
  };
  const info = `Process vars: ${connectedVars.length ? connectedVars.join(', ') : '-'}`;
  const summaryLabel = (() => {
    const base = template !== "custom" ? `Process: ${template}` : (data.label || "Process");
    if (connectedVars.length) return `${base} → ${connectedVars.join(', ')}`;
    return `${base} (hubungkan variable ke kanan)`;
  })();

  return (
    <div
      className={`relative border-2 rounded-md px-4 py-3 text-center shadow-md ${selected ? 'ring-2 ring-yellow-400' : ''}`}
      title={info}
      style={{
        backgroundColor: data.styleCardBg || '#ffffff',
        opacity: data.styleCardOpacity || 1,
        borderColor: '#9333ea',
        borderRadius: (data.styleCardRadius ?? 8) + 'px',
        boxShadow: (data.styleShadowDistance || 4) > 0 ? `0 ${(data.styleShadowDistance||4)}px ${(data.styleShadowDistance||4)*2}px -2px ${data.styleShadowColor || 'rgba(0,0,0,0.15)'}` : 'none',
        display:'flex', flexDirection:'column',
        alignItems: data.styleSizeMode === 'expand' ? 'stretch' : (data.styleAlignH === 'left' ? 'flex-start' : data.styleAlignH === 'right' ? 'flex-end' : 'center'),
        width: data.styleSizeMode === 'expand' ? (data.styleExpandWidth || 300) : undefined,
        minWidth: data.styleSizeMode === 'expand' ? (data.styleExpandWidth || 300) : 256
      }}
    >
      <NodeWindowControls collapsed={collapsed} onToggle={() => setCollapsed(v=>!v)} />
      <div className={`font-semibold w-full px-3 py-2.5 ${data.styleSizeMode==='expand' ? '' : ''}`} style={{ color: '#003d5c', backgroundColor: data.styleHeaderBg || '#87ceeb', borderRadius: data.styleSizeMode==='expand' ? 0 : 4 }}>{summaryLabel}</div>

      {!collapsed && (
        <div className="mt-2 w-full">
          <label className="block text-[11px] text-gray-500 mb-1">Template</label>
          <select
            value={template}
            onChange={(e) => handleTemplateChange(e.target.value)}
            className="w-full text-sm border border-gray-300 rounded px-2 py-1 bg-white"
          >
            {PROCESS_TEMPLATES.map((t) => (
              <option key={t.key} value={t.key}>{t.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* Daftar variable yang terhubung (kanan) */}
      {!collapsed && connectedVars.length > 0 && (
        <div className="mt-2 flex flex-col items-center gap-1">
          {connectedVars.map((v, i) => (
            <div
              key={i}
              className="w-full border border-gray-300 rounded bg-gray-50 text-gray-800 text-sm px-2 py-1"
            >
              {v}
            </div>
          ))}
        </div>
      )}

      {/* Kalau belum ada variable */}
      {!collapsed && connectedVars.length === 0 && (
        <div className="text-gray-400 italic mt-2 text-sm">
          Hubungkan variable ke handle kanan untuk otomatis menampilkan rangkuman.
        </div>
      )}

      {/* handle atas (hanya bisa ke Parameter bawah) */}
      <Handle type="target" position={Position.Top} id="topInput" />

      {/* handle bawah (ke Return / node berikutnya) */}
      <Handle type="source" position={Position.Bottom} id="bottomOutput" />

      {/* handle kanan (menampung Variable) */}
      <Handle
        type="target"
        position={Position.Right}
        id="varInput"
        style={{ background: "#8b5cf6" }}
      />
    </div>
  );
};

export default ProcessNode;
