import NodeWindowControls from "./NodeWindowControls.jsx";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Handle, Position } from "reactflow";

const ProcessNode = ({ data, selected }) => {
  const connectedVars = data?.connectedVariables || [];
  const [collapsed, setCollapsed] = useState(!!data?.collapsed);
  React.useEffect(() => {
    if ((data?.collapsed ? true : false) !== collapsed) setCollapsed(!!data?.collapsed);
  }, [data?.collapsed]);
  const info = `Process vars: ${connectedVars.length ? connectedVars.join(', ') : '-'}`;

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
      <div className={`font-semibold w-full px-2 py-2 ${data.styleSizeMode==='expand' ? '' : ''}`} style={{ color: '#7e22ce', backgroundColor: data.styleHeaderBg || 'transparent', borderRadius: data.styleSizeMode==='expand' ? 0 : 4 }}>Process</div>

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
          no variable connected
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
