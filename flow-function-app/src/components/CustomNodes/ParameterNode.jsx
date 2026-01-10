import React, { useState, useEffect } from "react";
import { Handle, Position } from "reactflow";
import NodeWindowControls from "./NodeWindowControls";

const ParameterNode = ({ id, data, selected }) => {
  const connected = data?.connectedVariables || []; // array nama variabel
  const [collapsed, setCollapsed] = useState(!!data?.collapsed);
  React.useEffect(() => {
    if ((data?.collapsed ? true : false) !== collapsed) setCollapsed(!!data?.collapsed);
  }, [data?.collapsed]);
  const info = `Parameter: ${connected.length ? connected.join(', ') : '-'}`;

  return (
    <div
      className={`relative border-2 rounded-md shadow-md px-4 py-3 text-center ${selected ? 'ring-2 ring-yellow-400' : ''}`}
      title={info}
      style={{
        backgroundColor: data.styleCardBg || '#ffffff',
        opacity: data.styleCardOpacity || 1,
        borderColor: '#3b82f6',
        borderRadius: (data.styleCardRadius ?? 8) + 'px',
        boxShadow: (data.styleShadowDistance || 4) > 0 ? `0 ${(data.styleShadowDistance||4)}px ${(data.styleShadowDistance||4)*2}px -2px ${data.styleShadowColor || 'rgba(0,0,0,0.15)'}` : 'none',
        display:'flex', flexDirection:'column',
        alignItems: data.styleSizeMode === 'expand' ? 'stretch' : (data.styleAlignH === 'left' ? 'flex-start' : data.styleAlignH === 'right' ? 'flex-end' : 'center'),
        width: data.styleSizeMode === 'expand' ? (data.styleExpandWidth || 300) : undefined,
        minWidth: data.styleSizeMode === 'expand' ? (data.styleExpandWidth || 300) : 256
      }}
    >
      <NodeWindowControls collapsed={collapsed} onToggle={() => setCollapsed(v=>!v)} />
      <div className={`font-semibold w-full px-3 py-2.5`} style={{ color:'#003d5c', backgroundColor: data.styleHeaderBg || '#87ceeb', borderRadius: data.styleSizeMode==='expand' ? 0 : 4 }}>Parameter</div>

      {!collapsed && (
        <>
          {/* kalau belum ada variabel terhubung */}
          {connected.length === 0 ? (
            <div className="text-gray-400 italic mt-2 text-sm">no variable connected</div>
          ) : (
            <div className="mt-2 flex flex-col items-center gap-2">
              {connected.map((name, i) => (
                <div
                  key={i}
                  className="w-full border border-gray-300 rounded bg-gray-50 text-gray-800 text-sm px-2 py-1"
                >
                  {name}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* handle utama untuk chain atas-bawah */}
      <Handle type="target" position={Position.Top} id="input" />
      <Handle type="source" position={Position.Bottom} id="output" />

      {/* handle kanan untuk menerima koneksi Variable */}
      <Handle type="target" position={Position.Right} id="varInput" style={{ background: "#8b5cf6" }} />
    </div>
  );
};

export default ParameterNode;
