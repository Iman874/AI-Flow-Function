import NodeWindowControls from "./NodeWindowControls.jsx";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Handle, Position } from "reactflow";

// Redesigned composite Function node: top banner + two panels (name & parameter list)
const NameFunctionNode = ({ id, data, selected, patchNode }) => {
  const [funcName, setFuncName] = useState(data.name || "");
  const connectedVars = data?.connectedVariables || [];
  const connectedVarDetails = data?.connectedVariableDetails || [];
  const [collapsed, setCollapsed] = useState(!!data?.collapsed);

  const validateName = (val) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(val);

  const handleChange = (e) => {
    const val = e.target.value;
    if ((validateName(val) || val === "") && val !== funcName) {
      setFuncName(val);
      if (val !== data.name) patchNode?.(id, { name: val });
    }
  };

  const handleCollapseToggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      if (next !== data.collapsed) patchNode?.(id, { collapsed: next });
      return next;
    });
  };

  useEffect(() => {
    if ((data.name || "") !== funcName) setFuncName(data.name || "");
  }, [data.name]);
  useEffect(() => {
    const ext = !!data?.collapsed;
    if (ext !== collapsed) setCollapsed(ext);
  }, [data?.collapsed]);

  const info = `Function: ${funcName || 'unnamed'}; params: ${connectedVars.join(', ') || '-'}`;

  return (
    <div
      className={`relative rounded-2xl p-4 shadow-md border ${selected ? 'ring-2 ring-yellow-400' : ''}`}
      title={info}
      style={{
        backgroundColor: data.styleCardBg || '#f8fafc',
        opacity: data.styleCardOpacity || 1,
        borderRadius: (data.styleCardRadius ?? 16) + 'px',
        boxShadow: (data.styleShadowDistance || 4) > 0 ? `0 ${(data.styleShadowDistance||4)}px ${(data.styleShadowDistance||4)*2}px -2px ${data.styleShadowColor || 'rgba(0,0,0,0.15)'}` : 'none',
        borderColor: '#cbd5e1',
        display: 'flex', flexDirection: 'column',
        alignItems: data.styleSizeMode === 'expand' ? 'stretch' : (data.styleAlignH === 'left' ? 'flex-start' : data.styleAlignH === 'right' ? 'flex-end' : 'center'),
        width: data.styleSizeMode === 'expand' ? (data.styleExpandWidth || 340) : undefined,
        minWidth: data.styleSizeMode === 'expand' ? (data.styleExpandWidth || 340) : 288
      }}
    >
      <NodeWindowControls collapsed={collapsed} onToggle={handleCollapseToggle} />
      {/* Top banner */}
      <div className={`text-white flex items-center gap-2 px-4 py-3 justify-start ${data.styleSizeMode==='expand' ? '' : 'rounded-md'}`}
        style={{ backgroundColor: data.styleHeaderBg || '#87ceeb', color: '#003d5c' }}
      >
        <span className="text-xl">⚙️</span>
        <span className="font-semibold tracking-wide">Function</span>
        {collapsed && (
          <span className="ml-auto text-white/90 text-xs truncate" title={funcName}>{funcName || "(unnamed)"}</span>
        )}
      </div>
      {/* Panels */}
      {!collapsed && (
      <div className="mt-3 grid grid-cols-2 gap-3">
        {/* Name panel */}
        <div className="rounded-md px-2 py-2 flex flex-col items-center"
          style={{ backgroundColor: data.styleNamePanelBg || '#fde68a' }}
        >
          <div className="text-xs font-semibold uppercase text-amber-900">name</div>
          <input
            type="text"
            placeholder="nama_fungsi"
            value={funcName}
            onChange={handleChange}
            className="mt-1 text-xs w-full bg-white/80 border border-amber-400 rounded px-2 py-1 outline-none text-center"
          />
        </div>
        {/* Parameter panel (lists connected variable name + type) */}
        <div className="rounded-md px-2 py-2 flex flex-col items-center min-h-[66px]"
          style={{ backgroundColor: data.styleParamPanelBg || '#e9d5ff' }}
        >
          <div className="text-xs font-semibold uppercase text-purple-900">parameter</div>
          {connectedVarDetails.length === 0 ? (
            <div className="mt-1 italic text-[10px] text-purple-700">no variables</div>
          ) : (
            <div className="mt-1 w-full flex flex-col gap-1">
              {connectedVarDetails.map((v, i) => {
                const label = v.type === 'array'
                  ? `${v.name}:array(size=${v.arraySize},dims=${v.arrayDims})`
                  : `${v.name}:${v.type}`;
                return (
                  <div
                    key={i}
                    className="text-[10px] w-full bg-white/70 border border-purple-400 rounded px-1 py-0.5 text-center text-purple-800"
                  >
                    {label}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      )}

      {/* Handles */}
      <Handle type="source" position={Position.Bottom} id="output" />
      <Handle
        type="target"
        position={Position.Right}
        id="varInput"
        style={{ background: "#8b5cf6" }}
      />
    </div>
  );
};

export default NameFunctionNode;
