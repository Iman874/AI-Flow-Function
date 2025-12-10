import NodeWindowControls from "./NodeWindowControls.jsx";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Handle, Position, useReactFlow } from "reactflow";

const LoopNode = ({ id, data, selected, patchNode }) => {
  const [collapsed, setCollapsed] = useState(!!data?.collapsed);
  const [loopType, setLoopType] = useState(data?.loopType || "for");
  const [condOpen, setCondOpen] = useState(false);
  const [condMode, setCondMode] = useState(data?.condMode || "none");
  const [condCustom, setCondCustom] = useState(data?.condCustom || "");
  const [counterOpen, setCounterOpen] = useState(false);
  const [counterMode, setCounterMode] = useState(data?.counterMode || "custom");
  const [counterCustom, setCounterCustom] = useState(data?.counterCustom || "+1");
  const [forCondOpen, setForCondOpen] = useState(false);
  const [forCondMode, setForCondMode] = useState(data?.forCondMode || "none");
  const [forCondCustom, setForCondCustom] = useState(data?.forCondCustom || "");
  const connectedVars = data?.connectedVariables || [];

  const handleCollapseToggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      if (next !== data.collapsed) patchNode?.(id, { collapsed: next });
      return next;
    });
  };
  const handleLoopTypeChange = (val) => {
    if (val !== loopType) {
      setLoopType(val);
      if (val !== data.loopType) patchNode?.(id, { loopType: val });
    }
  };
  const handleCondModeChange = (val) => {
    if (val !== condMode) {
      setCondMode(val);
      if (val !== data.condMode) patchNode?.(id, { condMode: val });
    }
  };
  const handleCondCustomChange = (val) => {
    if (val !== condCustom) {
      setCondCustom(val);
      if (val !== data.condCustom) patchNode?.(id, { condCustom: val });
    }
  };
  const handleCounterModeChange = (val) => {
    if (val !== counterMode) {
      setCounterMode(val);
      if (val !== data.counterMode) patchNode?.(id, { counterMode: val });
    }
  };
  const handleCounterCustomChange = (val) => {
    if (val !== counterCustom) {
      setCounterCustom(val);
      if (val !== data.counterCustom) patchNode?.(id, { counterCustom: val });
    }
  };
  const handleForCondModeChange = (val) => {
    if (val !== forCondMode) {
      setForCondMode(val);
      if (val !== data.forCondMode) patchNode?.(id, { forCondMode: val });
    }
  };
  const handleForCondCustomChange = (val) => {
    if (val !== forCondCustom) {
      setForCondCustom(val);
      if (val !== data.forCondCustom) patchNode?.(id, { forCondCustom: val });
    }
  };

  useEffect(() => {
    if ((data?.collapsed ? true : false) !== collapsed) setCollapsed(!!data?.collapsed);
  }, [data?.collapsed]);
  useEffect(() => {
    if ((data?.loopType || 'for') !== loopType) setLoopType(data?.loopType || 'for');
  }, [data?.loopType]);
  useEffect(() => {
    if ((data?.condMode || 'none') !== condMode) setCondMode(data?.condMode || 'none');
    if ((data?.condCustom || '') !== condCustom) setCondCustom(data?.condCustom || '');
    if ((data?.counterMode || 'custom') !== counterMode) setCounterMode(data?.counterMode || 'custom');
    if ((data?.counterCustom || '+1') !== counterCustom) setCounterCustom(data?.counterCustom || '+1');
    if ((data?.forCondMode || 'none') !== forCondMode) setForCondMode(data?.forCondMode || 'none');
    if ((data?.forCondCustom || '') !== forCondCustom) setForCondCustom(data?.forCondCustom || '');
  }, [data?.condMode, data?.condCustom, data?.counterMode, data?.counterCustom, data?.forCondMode, data?.forCondCustom]);

  const title = loopType === 'for' ? 'Loop: For' : loopType === 'while' ? 'Loop: While' : 'Loop: Do While';

  return (
    <div
      className={`relative rounded-2xl p-4 shadow-md ${selected ? 'ring-2 ring-yellow-400' : ''}`}
      title={title}
      style={{
        backgroundColor: data.styleCardBg || '#fffbeb',
        opacity: data.styleCardOpacity || 1,
        borderRadius: (data.styleCardRadius ?? 16) + 'px',
        boxShadow: (data.styleShadowDistance || 4) > 0 ? `0 ${(data.styleShadowDistance||4)}px ${(data.styleShadowDistance||4)*2}px -2px ${data.styleShadowColor || 'rgba(0,0,0,0.15)'}` : 'none',
        display:'flex', flexDirection:'column',
        alignItems: data.styleSizeMode === 'expand' ? 'stretch' : (data.styleAlignH === 'left' ? 'flex-start' : data.styleAlignH === 'right' ? 'flex-end' : 'center'),
        width: data.styleSizeMode === 'expand' ? (data.styleExpandWidth || 300) : undefined,
        minWidth: data.styleSizeMode === 'expand' ? (data.styleExpandWidth || 300) : 256
      }}
    >
      <NodeWindowControls collapsed={collapsed} onToggle={handleCollapseToggle} />
      <div className="text-sm font-semibold mb-2">Type Loop</div>
      {!collapsed && (
        <select
          value={loopType}
          onChange={(e) => handleLoopTypeChange(e.target.value)}
          className="w-full bg-gray-400 text-white rounded-md px-2 py-2 text-center text-xs font-medium outline-none"
        >
          <option value="for" className="text-black">For</option>
          <option value="while" className="text-black">While</option>
          <option value="do-while" className="text-black">Do While</option>
        </select>
      )}
      <div className={`text-white flex items-center justify-center mt-3 px-4 py-3 font-semibold text-sm ${data.styleSizeMode==='expand' ? '' : 'rounded-md'}`}
        style={{ backgroundColor: data.styleHeaderBg || '#f97316' }}
      >Loop</div>
      {!collapsed && (
        <>
          {loopType === 'for' ? (
            <>
              <button
                className="mt-3 w-full rounded-md px-2 py-2 text-center text-xs font-semibold"
                style={{ backgroundColor: data.styleCounterPanelBg || '#fda4af', color:'#9f1239' }}
                onClick={() => setCounterOpen((o) => !o)}
                title="Set counter value"
              >
                Counter
              </button>
              {counterOpen && (
                <div className="mt-2 grid grid-cols-2 gap-2 items-center">
                  <select
                    value={counterMode}
                    onChange={(e) => handleCounterModeChange(e.target.value)}
                    className="bg-gray-200 text-gray-800 rounded-md px-2 py-2 text-center text-xs font-medium outline-none"
                  >
                    <option value="variable">variable</option>
                    <option value="custom">custom</option>
                  </select>
                  <div className="text-[11px] text-gray-700 text-center">
                    {counterMode === 'variable' && (connectedVars[0] ? `var: ${connectedVars[0]}` : 'connect a variable →')}
                    {counterMode === 'custom' && (
                      <input
                        type="text"
                        value={counterCustom}
                        onChange={(e) => handleCounterCustomChange(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-xs"
                        placeholder="+1, +2, -1"
                      />
                    )}
                  </div>
                </div>
              )}

              <button
                className="mt-3 w-full rounded-md px-2 py-2 text-center text-xs font-semibold"
                style={{ backgroundColor: data.styleConditionPanelBg || '#e9d5ff', color:'#6b21a8' }}
                onClick={() => setForCondOpen((o) => !o)}
                title="Set for-condition"
              >
                Condition
              </button>
              {forCondOpen && (
                <div className="mt-2 grid grid-cols-2 gap-2 items-center">
                  <select
                    value={forCondMode}
                    onChange={(e) => handleForCondModeChange(e.target.value)}
                    className="bg-gray-200 text-gray-800 rounded-md px-2 py-2 text-center text-xs font-medium outline-none"
                  >
                    <option value="none">none</option>
                    <option value="variable">variable</option>
                    <option value="custom">custom</option>
                    <option value="if">if</option>
                  </select>
                  <div className="text-[11px] text-gray-700 text-center">
                    {forCondMode === 'variable' && (connectedVars[0] ? `var: ${connectedVars[0]}` : 'connect a variable →')}
                    {forCondMode === 'custom' && (
                      <input
                        type="text"
                        value={forCondCustom}
                        onChange={(e) => handleForCondCustomChange(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-xs"
                        placeholder="x < 10"
                      />
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <button
                className="mt-3 w-full rounded-md px-2 py-2 text-center text-xs font-semibold"
                style={{ backgroundColor: data.styleConditionPanelBg || '#e9d5ff', color:'#6b21a8' }}
                onClick={() => setCondOpen((o) => !o)}
                title="Set condition value"
              >
                Condition
              </button>
              {condOpen && (
                <div className="mt-2 grid grid-cols-2 gap-2 items-center">
                  <select
                    value={condMode}
                    onChange={(e) => handleCondModeChange(e.target.value)}
                    className="bg-gray-200 text-gray-800 rounded-md px-2 py-2 text-center text-xs font-medium outline-none"
                  >
                    <option value="none">none</option>
                    <option value="variable">variable</option>
                    <option value="custom">custom</option>
                    <option value="if">if</option>
                  </select>
                  <div className="text-[11px] text-gray-700 text-center">
                    {condMode === 'variable' && (connectedVars[0] ? `var: ${connectedVars[0]}` : 'connect a variable →')}
                    {condMode === 'custom' && (
                      <input
                        type="text"
                        value={condCustom}
                        onChange={(e) => handleCondCustomChange(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-xs"
                        placeholder="x < 10"
                      />
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Handles for variable inputs */}
      <Handle type="target" position={Position.Right} id="conditionVarInput" style={{ top: "50%", background: "#8b5cf6" }} />
      <Handle type="target" position={Position.Right} id="counterVarInput" style={{ top: "70%", background: "#8b5cf6" }} />
      {/* Handles: top input, bottom output */}
      <Handle type="target" position={Position.Top} id="input" />
      <Handle type="source" position={Position.Bottom} id="output" />
    </div>
  );
};

export default LoopNode;