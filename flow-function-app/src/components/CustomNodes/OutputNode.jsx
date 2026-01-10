import React from "react";
import { Handle, Position } from "reactflow";

export default function OutputNode({ data }) {
  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow p-3 min-w-[120px] text-center">
      <div className="font-bold text-white mb-2 px-2 py-2 rounded" style={{ backgroundColor: '#87ceeb', color: '#003d5c' }}>Output</div>
      <Handle type="target" position={Position.Top} id="input" style={{ background: '#22c55e' }} />
    </div>
  );
}
