import NodeWindowControls from "./NodeWindowControls";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Handle, Position, useReactFlow } from "reactflow";

const VariableNode = ({ id, data, selected }) => {
  const [variableName, setVariableName] = useState(data.name ?? data.varName ?? "");
  const varType = data.varType || "var";
  const [arraySize, setArraySize] = useState(data.arraySize || 1);
  const [arraySizeInput, setArraySizeInput] = useState(String(data.arraySize || 1));
  const [arrayDims, setArrayDims] = useState(data.arrayDims || 1);
  const [isEditing, setIsEditing] = useState(false);
  const [collapsed, setCollapsed] = useState(!!data?.collapsed);
  const { setNodes } = useReactFlow();

  const validateName = (value) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value);

  const updateNodeData = (patch) => {
    // Always sync both name and varName fields
    const syncPatch = { ...patch };
    if (typeof patch.name === "string") syncPatch.varName = patch.name;
    if (typeof patch.varName === "string") syncPatch.name = patch.varName;
    setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...syncPatch } } : n)));
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (!validateName(variableName)) {
      setVariableName("");
      updateNodeData({ name: "", varName: "" });
      alert(
        "Nama variabel tidak valid! Gunakan huruf, angka, dan underscore tanpa spasi."
      );
    }
  };

  // write-through handled inline on change handlers

  useEffect(() => {
    if (varType === "array") {
      updateNodeData({ arraySize, arrayDims });
    }
  }, [arraySize, arrayDims, varType]);

  // sync from external data updates
  useEffect(() => {
    const newName = data.name ?? data.varName ?? "";
    if (newName !== variableName) setVariableName(newName);
  }, [data.name, data.varName]);
  // varType state removed; rely on data as single source of truth
  useEffect(() => {
    if (data.varType === "array") {
      if ((data.arraySize ?? 1) !== arraySize) {
        setArraySize(data.arraySize ?? 1);
        setArraySizeInput(String(data.arraySize ?? 1));
      }
      if ((data.arrayDims ?? 1) !== arrayDims) setArrayDims(data.arrayDims ?? 1);
    }
  }, [data.varType, data.arraySize, data.arrayDims]);
  useEffect(() => {
    const ext = !!data?.collapsed;
    if (ext !== collapsed) setCollapsed(ext);
  }, [data?.collapsed]);

  const typeOptions = ["int", "float", "double", "string", "char", "array"];
  const sizeOptions = Array.from({ length: 10 }, (_, i) => i + 1);
  const dimOptions = [1, 2, 3];

  const handleSizeInputChange = (e) => {
    const v = e.target.value;
    setArraySizeInput(v);
    const parsed = parseInt(v, 10);
    if (!Number.isNaN(parsed) && parsed > 0) {
      setArraySize(parsed);
    }
  };

  const handleSizeInputBlur = () => {
    const parsed = parseInt(arraySizeInput, 10);
    if (Number.isNaN(parsed) || parsed < 1) {
      setArraySize(1);
      setArraySizeInput("1");
    }
  };

  return (
    <div
      className={`relative rounded-2xl p-4 ${selected ? 'ring-2 ring-yellow-400' : ''}`}
      onDoubleClick={() => setIsEditing(true)}
      title={`name: ${variableName || '-'} | type: ${varType}${varType==='array' ? ` [size=${arraySize}, dims=${arrayDims}]` : ''}`}
      style={{
        backgroundColor: data.styleCardBg || '#ecfeff',
        opacity: data.styleCardOpacity || 1,
        borderRadius: (data.styleCardRadius ?? 16) + 'px',
        boxShadow: (data.styleShadowDistance || 4) > 0 ? `0 ${(data.styleShadowDistance||4)}px ${(data.styleShadowDistance||4)*2}px -2px ${data.styleShadowColor || 'rgba(0,0,0,0.15)'}` : 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: data.styleSizeMode === 'expand' ? 'stretch' : (data.styleAlignH === 'left' ? 'flex-start' : data.styleAlignH === 'right' ? 'flex-end' : 'center'),
        width: data.styleSizeMode === 'expand' ? (data.styleExpandWidth || 300) : undefined,
        minWidth: data.styleSizeMode === 'expand' ? (data.styleExpandWidth || 300) : 256
      }}
    >
      <NodeWindowControls collapsed={collapsed} onToggle={() => { setCollapsed(v=>!v); updateNodeData({ collapsed: !collapsed }); }} />
      <div className={`text-white flex items-center gap-2 px-4 py-3 justify-start ${data.styleSizeMode==='expand' ? '' : 'rounded-md'}`}
        style={{ backgroundColor: data.styleHeaderBg || '#0e7490' }}
      >
        <span className="text-lg">📘</span>
        <span className="font-semibold">Variabel</span>
      </div>
      {!collapsed && (
      <div className="mt-3 grid grid-cols-2 gap-3 items-center">
        <div className="rounded-md text-[11px]">
          <select
            value={varType}
            onChange={(e) => {
              const t = e.target.value;
              if (t === 'array') {
                const size = arraySize || 1;
                const dims = arrayDims || 1;
                updateNodeData({ varType: t, arraySize: size, arrayDims: dims });
                setArraySizeInput(String(size));
              } else {
                updateNodeData({ varType: t, arraySize: undefined, arrayDims: undefined });
              }
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            className="w-full text-white rounded-md px-2 py-2 text-center font-semibold outline-none cursor-pointer"
            style={{ backgroundColor: data.styleTypePanelBg || '#9ca3af' }}
          >
            {typeOptions.map((t) => (
              <option key={t} value={t} className="text-black">{t}</option>
            ))}
          </select>
        </div>
        {!isEditing ? (
          <div
            className="rounded-md px-2 py-2 text-center text-[11px] font-semibold"
            style={{ backgroundColor: data.styleNamePanelBg || '#fde68a', color: '#92400e' }}
            onClick={() => setIsEditing(true)}
          >
            {variableName || "name"}
          </div>
        ) : (
          <input
            type="text"
            autoFocus
            value={variableName}
            onChange={(e) => { const v = e.target.value; setVariableName(v); updateNodeData({ name: v, varName: v }); }}
            onBlur={handleBlur}
            className="bg-white rounded-md px-2 py-1 text-[11px] border border-amber-400 outline-none text-center"
            placeholder="nama_variabel"
          />
        )}
      </div>
      )}

      {!collapsed && varType === "array" && (
        <div className="mt-3 grid grid-cols-2 gap-3 items-center">
          <div className="rounded-md text-[11px]">
            <input
              type="number"
              min={1}
              step={1}
              list="variable-size-suggestions"
              value={arraySizeInput}
              onChange={handleSizeInputChange}
              onBlur={handleSizeInputBlur}
              onPointerDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              className="w-full bg-gray-300 text-gray-800 rounded-md px-2 py-2 text-center font-semibold outline-none"
              placeholder="size"
            />
            <datalist id="variable-size-suggestions">
              {sizeOptions.map((n) => (
                <option key={n} value={n} />
              ))}
            </datalist>
          </div>
          <div className="rounded-md text-[11px]">
            <select
              value={arrayDims}
              onChange={(e) => setArrayDims(Number(e.target.value))}
              onPointerDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              className="w-full bg-gray-300 text-gray-800 rounded-md px-2 py-2 text-center font-semibold outline-none cursor-pointer"
            >
              {dimOptions.map((n) => (
                <option key={n} value={n}>{`dims: ${n}`}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Source handle kiri → ke Parameter / Process */}
      <Handle
        type="source"
        position={Position.Left}
        id="varOutput"
        style={{ top: "50%", background: "#8b5cf6" }}
      />

      {/* Target & Source biasa (atas-bawah) */}
      <Handle type="target" position={Position.Top} id="input1" />
      <Handle type="source" position={Position.Bottom} id="output1" />
    </div>
  );
};

export default VariableNode;
