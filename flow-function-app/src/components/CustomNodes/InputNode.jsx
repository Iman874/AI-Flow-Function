import React from "react";
import { Handle, Position } from "reactflow";

const InputNode = ({ id, data, selected, patchNode }) => {

  const updateVarName = (e) => {
    patchNode?.(id, { varName: e.target.value });
  };

  const updateMode = (e) => {
    patchNode?.(id, { inputMode: e.target.value });
  };

  return (
    <div className={`rounded-2xl border p-4 shadow-md bg-white
      ${selected ? "ring-2 ring-indigo-400" : ""}`}>

      <div className="text-xs font-bold text-white mb-3 px-2 py-2 rounded" style={{ backgroundColor: '#87ceeb', color: '#003d5c' }}>
        Input
      </div>

      {/* Mode dropdown */}
      <select
        value={data.inputMode || "read"}
        onChange={updateMode}
        className="w-full border rounded px-2 py-1 text-sm"
      >
        <option value="read">READ</option>
        <option value="ask">ASK</option>
        <option value="const">CONST</option>
      </select>

      {/* Variable name */}
      <input
        placeholder="Variable name"
        value={data.varName || ""}
        onChange={updateVarName}
        className="w-full mt-2 border rounded px-2 py-1 text-sm"
      />

      {/* Handles */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="output"
        style={{ background: "#8b5cf6" }}
      />

      <Handle
        type="target"
        position={Position.Top}
        id="input"
      />

    </div>
  );
};

export default InputNode;
