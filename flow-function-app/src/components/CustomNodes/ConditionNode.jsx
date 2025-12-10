import NodeWindowControls from "./NodeWindowControls.jsx";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Handle, Position, useReactFlow } from "reactflow";

// Condition node with True / False outputs
const ConditionNode = ({ id, data, selected, patchNode }) => {
  const [collapsed, setCollapsed] = useState(!!data?.collapsed);
  const [condType, setCondType] = useState(data?.condType || "if-else"); // 'if-else' | 'switch'
  const [defaultMode, setDefaultMode] = useState(data?.defaultMode || "none"); // 'none' | 'variable' | 'custom'
  const [defaultCustom, setDefaultCustom] = useState(data?.defaultCustom || "");
  const [defaultOpen, setDefaultOpen] = useState(false);
  const connectedVars = data?.connectedVariables || [];

  const handleCollapseToggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      if (next !== data.collapsed) patchNode?.(id, { collapsed: next });
      return next;
    });
  };
  const handleCondTypeChange = (val) => {
    if (val !== condType) {
      setCondType(val);
      if (val !== data.condType) patchNode?.(id, { condType: val });
    }
  };
  const handleDefaultModeChange = (val) => {
    if (val !== defaultMode) {
      setDefaultMode(val);
      if (val !== data.defaultMode) patchNode?.(id, { defaultMode: val });
    }
  };
  const handleDefaultCustomChange = (val) => {
    if (val !== defaultCustom) {
      setDefaultCustom(val);
      if (val !== data.defaultCustom) patchNode?.(id, { defaultCustom: val });
    }
  };

  useEffect(() => {
    if ((data?.collapsed ? true : false) !== collapsed) setCollapsed(!!data?.collapsed);
  }, [data?.collapsed]);
  useEffect(() => {
    if ((data?.condType || "if-else") !== condType) setCondType(data?.condType || "if-else");
  }, [data?.condType]);
  useEffect(() => {
    if ((data?.defaultMode || "none") !== defaultMode) setDefaultMode(data?.defaultMode || "none");
    if ((data?.defaultCustom || "") !== defaultCustom) setDefaultCustom(data?.defaultCustom || "");
  }, [data?.defaultMode, data?.defaultCustom]);

  return (
    <div
      className={`relative rounded-2xl p-4 shadow-md ${selected ? 'ring-2 ring-yellow-400' : ''}`}
      title={`Condition: ${condType === 'switch' ? 'Switch' : 'If/Else'}`}
      style={{
        backgroundColor: data.styleCardBg || '#f5f3ff',
        opacity: data.styleCardOpacity || 1,
        borderRadius: (data.styleCardRadius ?? 16) + 'px',
        boxShadow: (data.styleShadowDistance || 4) > 0 ? `0 ${(data.styleShadowDistance||4)}px ${(data.styleShadowDistance||4)*2}px -2px ${data.styleShadowColor || 'rgba(0,0,0,0.15)'}` : 'none',
        display: 'flex', flexDirection: 'column',
        alignItems: data.styleSizeMode === 'expand' ? 'stretch' : (data.styleAlignH === 'left' ? 'flex-start' : data.styleAlignH === 'right' ? 'flex-end' : 'center'),
        width: data.styleSizeMode === 'expand' ? (data.styleExpandWidth || 360) : undefined,
        minWidth: data.styleSizeMode === 'expand' ? (data.styleExpandWidth || 360) : 320
      }}
    >
      <NodeWindowControls collapsed={collapsed} onToggle={handleCollapseToggle} />
      <div className="text-sm font-semibold mb-2">Type Condition</div>
      {!collapsed && (
        <div className="rounded-md overflow-hidden">
          <select
            value={condType}
            onChange={(e) => handleCondTypeChange(e.target.value)}
            className="w-full bg-gray-400 text-white rounded-md px-2 py-2 text-center text-xs font-medium outline-none"
          >
            <option value="if-else" className="text-black">If Else</option>
            <option value="switch" className="text-black">Switch</option>
          </select>
        </div>
      )}
      <div className={`text-white flex items-center justify-center mt-3 px-4 py-3 font-semibold text-sm ${data.styleSizeMode==='expand' ? '' : 'rounded-md'}`}
        style={{ backgroundColor: data.styleHeaderBg || '#a855f7' }}
      >Condition</div>
      {!collapsed && (
        <>
          <div className={`mt-3 grid ${condType === 'switch' ? 'grid-cols-3' : 'grid-cols-2'} gap-3`}>
            <div className="rounded-md px-2 py-2 text-center text-xs font-semibold" style={{ backgroundColor: data.styleTrueBg || '#6ee7b7', color:'#065f46' }}>True</div>
            <div className="rounded-md px-2 py-2 text-center text-xs font-semibold" style={{ backgroundColor: data.styleFalseBg || '#fda4af', color:'#9f1239' }}>False</div>
            {condType === 'switch' && (
              <button
                className={`rounded-md px-2 py-2 text-center text-xs font-semibold ${defaultOpen || defaultMode !== 'none' ? 'bg-indigo-400 text-white' : 'bg-indigo-200 text-indigo-900'}`}
                onClick={() => setDefaultOpen((o) => !o)}
                title="Set default behavior"
              >
                Default
              </button>
            )}
          </div>
          {condType === 'switch' && defaultOpen && (
            <div className="mt-3 grid grid-cols-3 gap-3 items-center">
              <div className="col-span-2">
                <select
                  value={defaultMode}
                  onChange={(e) => handleDefaultModeChange(e.target.value)}
                  className="w-full bg-gray-200 text-gray-800 rounded-md px-2 py-2 text-center text-xs font-medium outline-none"
                >
                  <option value="none">none</option>
                  <option value="variable">variable</option>
                  <option value="custom">custom</option>
                </select>
              </div>
              <div className="text-[11px] text-gray-700 text-center">
                {defaultMode === 'variable' && (connectedVars[0] ? `var: ${connectedVars[0]}` : 'connect a variable →')}
                {defaultMode === 'custom' && (
                  <input
                    type="text"
                    value={defaultCustom}
                    onChange={(e) => handleDefaultCustomChange(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-xs"
                    placeholder="value"
                  />
                )}
              </div>
            </div>
          )}
        </>
      )}
      {/* Handles: top input; bottom true/false outputs */}
      <Handle type="target" position={Position.Top} id="input" />
      {/* default variable value input */}
      <Handle type="target" position={Position.Right} id="defaultVarInput" style={{ background: "#8b5cf6" }} />
      <Handle type="source" position={Position.Bottom} id="trueOutput" style={{ left: "25%" }} />
      <Handle type="source" position={Position.Bottom} id="falseOutput" style={{ left: "50%" }} />
      {condType === 'switch' && <Handle type="source" position={Position.Bottom} id="defaultOutput" style={{ left: "75%" }} />}
    </div>
  );
};

export default ConditionNode;