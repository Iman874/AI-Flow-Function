import NodeWindowControls from "./NodeWindowControls.jsx";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Handle, Position } from "reactflow";

const ElseNode = ({ data, selected }) => {
  const [collapsed, setCollapsed] = useState(!!data?.collapsed);
  return (
    <div
      className={`relative border-2 rounded-md shadow-md px-4 py-2 ${selected ? 'ring-2 ring-yellow-400' : ''}`}
      title={`Else node: ${data.label || ''}` }
      style={{
        backgroundColor: data.styleCardBg || '#ffffff',
        opacity: data.styleCardOpacity || 1,
        borderColor: '#1e40af',
        borderRadius: (data.styleCardRadius ?? 8) + 'px',
        boxShadow: (data.styleShadowDistance || 4) > 0 ? `0 ${(data.styleShadowDistance||4)}px ${(data.styleShadowDistance||4)*2}px -2px ${data.styleShadowColor || 'rgba(0,0,0,0.15)'}` : 'none',
        display:'flex', flexDirection:'column',
        alignItems: data.styleSizeMode === 'expand' ? 'stretch' : (data.styleAlignH === 'left' ? 'flex-start' : data.styleAlignH === 'right' ? 'flex-end' : 'center'),
        width: data.styleSizeMode === 'expand' ? (data.styleExpandWidth || 220) : undefined,
        minWidth: data.styleSizeMode === 'expand' ? (data.styleExpandWidth || 220) : 160
      }}
    >
      <NodeWindowControls collapsed={collapsed} onToggle={() => setCollapsed(v=>!v)} />
      <div className={`font-semibold text-center w-full px-2 py-2`} style={{ color:'#1e3a8a', backgroundColor: data.styleHeaderBg || 'transparent', borderRadius: data.styleSizeMode==='expand' ? 0 : 4 }}>{data.label}</div>

      <Handle type="target" position={Position.Left} />
      {!collapsed && <Handle type="source" position={Position.Right} />}
    </div>
  );
};

export default ElseNode;
