import NodeWindowControls from "./NodeWindowControls.jsx";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Handle, Position } from "reactflow";

const ReturnNode = ({ data, selected }) => {
  const [collapsed, setCollapsed] = useState(!!data?.collapsed);
  // sync from external data
  React.useEffect(() => {
    if ((data?.collapsed ? true : false) !== collapsed) setCollapsed(!!data?.collapsed);
  }, [data?.collapsed]);
  return (
    <div
      className={`relative rounded-2xl p-4 shadow-md ${selected ? 'ring-2 ring-yellow-400' : ''}`}
      title="Return value"
      style={{
        backgroundColor: data.styleCardBg || '#e5e7eb',
        opacity: data.styleCardOpacity || 1,
        borderRadius: (data.styleCardRadius ?? 16) + 'px',
        boxShadow: (data.styleShadowDistance || 4) > 0 ? `0 ${(data.styleShadowDistance||4)}px ${(data.styleShadowDistance||4)*2}px -2px ${data.styleShadowColor || 'rgba(0,0,0,0.15)'}` : 'none',
        display:'flex', flexDirection:'column',
        alignItems: data.styleSizeMode === 'expand' ? 'stretch' : (data.styleAlignH === 'left' ? 'flex-start' : data.styleAlignH === 'right' ? 'flex-end' : 'center'),
        width: data.styleSizeMode === 'expand' ? (data.styleExpandWidth || 300) : undefined,
        minWidth: data.styleSizeMode === 'expand' ? (data.styleExpandWidth || 300) : 240
      }}
    >
      <NodeWindowControls collapsed={collapsed} onToggle={() => setCollapsed(v=>!v)} />
      <div className={`text-white flex items-center justify-center px-4 py-3 font-semibold gap-2 text-sm ${data.styleSizeMode==='expand' ? '' : 'rounded-md'}`}
        style={{ backgroundColor: data.styleHeaderBg || '#87ceeb', color: '#003d5c' }}
      >
        <span>↩️</span> <span>Return</span>
      </div>
      {!collapsed && (
        <div className="mt-3 bg-gray-400 text-white rounded-md px-2 py-2 text-center text-xs font-semibold">Value</div>
      )}
      {/* Handles: top input only (terminal) */}
      <Handle type="target" position={Position.Top} id="input" />
    </div>
  );
};

export default ReturnNode;