import React, { useMemo, useState } from "react";

const Section = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-200">
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-800 hover:bg-gray-50"
        onClick={() => setOpen((v) => !v)}
      >
        <span>{title}</span>
        <span className="text-gray-500">{open ? "▾" : "▸"}</span>
      </button>
      {open && <div className="px-4 pb-4 text-sm text-gray-800">{children}</div>}
    </div>
  );
};

const FieldRow = ({ label, children }) => (
  <div className="grid grid-cols-3 gap-2 items-center py-1">
    <div className="text-gray-600 text-[11px] font-medium col-span-1 truncate" title={label}>{label}</div>
    <div className="col-span-2 text-[11px]">{children}</div>
  </div>
);

const NavPropertiesNode = ({ node, onPatch }) => {
  const [tab, setTab] = useState("system");

  const type = node?.type;
  const data = node?.data || {};
  const connectedVars = data?.connectedVariables || [];

  // Derived defaults to avoid conditional render gaps on first highlight
  const loopType = (data.loopType || (type === 'loop' ? 'for' : ''));
  const counterMode = data.counterMode || 'custom';
  const forCondMode = data.forCondMode || 'none';
  const condMode = data.condMode || 'none';

  const title = useMemo(() => {
    if (!node) return "";
    const t = type || "node";
    return `${t.toUpperCase()} Properties`;
  }, [node, type]);

  if (!node) return null;

  return (
    <div className="h-full w-[320px] bg-white border-l border-gray-200 flex flex-col select-none">
      {/* Top bar like Figma: tabs and a small toolbar placeholder */}
      <div className="px-3 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="inline-flex rounded-md overflow-hidden border border-gray-300">
            <button
              className={`px-3 py-1.5 text-sm ${tab === "system" ? "bg-gray-900 text-white" : "bg-white text-gray-700"}`}
              onClick={() => setTab("system")}
            >
              System
            </button>
            <button
              className={`px-3 py-1.5 text-sm ${tab === "design" ? "bg-gray-900 text-white" : "bg-white text-gray-700"}`}
              onClick={() => setTab("design")}
            >
              Design
            </button>
          </div>
          <div className="text-xs text-gray-500">{title}</div>
        </div>
      </div>

      {tab === "system" ? (
        <div className="flex-1 overflow-auto">
          <Section title="Node">
            <FieldRow label="Type">
              <div className="px-2 py-1 bg-gray-100 rounded text-xs inline-block">{type}</div>
            </FieldRow>
            <FieldRow label="ID">
              <div className="px-2 py-1 bg-gray-100 rounded text-xs break-all">{node.id}</div>
            </FieldRow>
            <FieldRow label="Collapsed">
              <input
                type="checkbox"
                checked={!!data.collapsed}
                onChange={(e) => onPatch(node.id, { collapsed: e.target.checked })}
              />
            </FieldRow>
          </Section>

          {/* Common editable names */}
          {(type === "variable" || type === "namefunction" || type === "process" || type === "parameter" || type === "return") && (
            <Section title="General">
              <FieldRow label="Name">
                <input
                  className="w-full border rounded px-2 py-1 text-sm"
                  value={data.name || ""}
                  onChange={(e) => onPatch(node.id, { name: e.target.value })}
                  placeholder="name"
                />
              </FieldRow>
            </Section>
          )}

          {/* Variable specific */}
          {type === "variable" && (
            <Section title="Variable">
              <FieldRow label="Type">
                <select
                  className="w-full border rounded px-2 py-1 text-sm bg-white"
                  value={data.varType || "int"}
                  onChange={(e) => onPatch(node.id, { varType: e.target.value })}
                >
                  {"int float double string char array".split(" ").map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </FieldRow>
              {(data.varType === "array") && (
                <>
                  <FieldRow label="Array Size">
                    <input
                      type="number"
                      min={1}
                      className="w-full border rounded px-2 py-1 text-sm"
                      value={data.arraySize ?? 1}
                      onChange={(e) => onPatch(node.id, { arraySize: Math.max(1, Number(e.target.value || 1)) })}
                    />
                  </FieldRow>
                  <FieldRow label="Dimensions">
                    <select
                      className="w-full border rounded px-2 py-1 text-sm bg-white"
                      value={data.arrayDims ?? 1}
                      onChange={(e) => onPatch(node.id, { arrayDims: Number(e.target.value) })}
                    >
                      {[1,2,3].map((n)=> <option key={n} value={n}>{n}</option>)}
                    </select>
                  </FieldRow>
                </>
              )}
              <div className="mt-2 text-[11px] text-gray-500">Connected: {connectedVars.join(", ") || "-"}</div>
            </Section>
          )}

          {/* Condition specific */}
          {type === "condition" && (
            <Section title="Condition">
              <FieldRow label="Type">
                <select
                  className="w-full border rounded px-2 py-1 text-sm bg-white"
                  value={data.condType || "if-else"}
                  onChange={(e) => onPatch(node.id, { condType: e.target.value })}
                >
                  <option value="if-only">if-only (true only)</option>
                  <option value="if-else">if-else</option>
                  <option value="switch">switch</option>
                </select>
              </FieldRow>
              <FieldRow label="Default Mode">
                <select
                  className="w-full border rounded px-2 py-1 text-sm bg-white"
                  value={data.defaultMode || "none"}
                  onChange={(e) => onPatch(node.id, { defaultMode: e.target.value })}
                >
                  <option value="none">none</option>
                  <option value="variable">variable</option>
                  <option value="custom">custom</option>
                </select>
              </FieldRow>
              {data.defaultMode === "custom" && (
                <FieldRow label="Default Value">
                  <input
                    className="w-full border rounded px-2 py-1 text-sm"
                    value={data.defaultCustom || ""}
                    onChange={(e) => onPatch(node.id, { defaultCustom: e.target.value })}
                    placeholder="value"
                  />
                </FieldRow>
              )}
              {data.defaultMode === "variable" && (
                <div className="text-[11px] text-gray-500">Connect a variable on the node →</div>
              )}
            </Section>
          )}

          {/* Process specific */}
          {type === "process" && (
            <Section title="Process">
              <FieldRow label="Label">
                <input
                  className="w-full border rounded px-2 py-1 text-sm"
                  value={data.label || ""}
                  onChange={(e) => onPatch(node.id, { label: e.target.value })}
                  placeholder="Process label"
                />
              </FieldRow>
              <FieldRow label="Template">
                <select
                  className="w-full border rounded px-2 py-1 text-sm bg-white"
                  value={data.template || "custom"}
                  onChange={(e) => onPatch(node.id, { template: e.target.value })}
                >
                  <option value="custom">custom</option>
                  <option value="addition">addition (a+b)</option>
                  <option value="subtraction">subtraction (a-b)</option>
                  <option value="multiplication">multiplication (a*b)</option>
                  <option value="division">division (a/b)</option>
                  <option value="assignment">assignment (a=b)</option>
                </select>
              </FieldRow>
              <div className="mt-1 text-[11px] text-gray-500">Connected vars: {connectedVars.join(", ") || "-"}</div>
            </Section>
          )}

          {/* Loop specific */}
          {type === "loop" && (
            <Section title="Loop">
              <FieldRow label="Type">
                <select
                  className="w-full border rounded px-2 py-1 text-sm bg-white"
                  value={loopType}
                  onChange={(e) => onPatch(node.id, { loopType: e.target.value })}
                >
                  <option value="for">for</option>
                  <option value="while">while</option>
                  <option value="do-while">do-while</option>
                </select>
              </FieldRow>

              {loopType === "for" && (
                <>
                  <FieldRow label="Counter Mode">
                    <select
                      className="w-full border rounded px-2 py-1 text-sm bg-white"
                      value={counterMode}
                      onChange={(e) => onPatch(node.id, { counterMode: e.target.value })}
                    >
                      <option value="variable">variable</option>
                      <option value="custom">custom</option>
                    </select>
                  </FieldRow>
                  {counterMode === "custom" && (
                    <FieldRow label="Counter Value">
                      <input
                        className="w-full border rounded px-2 py-1 text-sm"
                        value={data.counterCustom || ""}
                        onChange={(e) => onPatch(node.id, { counterCustom: e.target.value })}
                        placeholder="+1 / -1"
                      />
                    </FieldRow>
                  )}
                  <FieldRow label="For Condition">
                    <select
                      className="w-full border rounded px-2 py-1 text-sm bg-white"
                      value={forCondMode}
                      onChange={(e) => onPatch(node.id, { forCondMode: e.target.value })}
                    >
                      <option value="none">none</option>
                      <option value="variable">variable</option>
                      <option value="custom">custom</option>
                      <option value="if">if</option>
                    </select>
                  </FieldRow>
                  {forCondMode === "custom" && (
                    <FieldRow label="Condition Expression">
                      <input
                        className="w-full border rounded px-2 py-1 text-sm"
                        value={data.forCondCustom || ""}
                        onChange={(e) => onPatch(node.id, { forCondCustom: e.target.value })}
                        placeholder="x < 10"
                      />
                    </FieldRow>
                  )}
                </>
              )}

              {(loopType === "while" || loopType === "do-while") && (
                <>
                  <FieldRow label="Condition Mode">
                    <select
                      className="w-full border rounded px-2 py-1 text-sm bg-white"
                      value={condMode}
                      onChange={(e) => onPatch(node.id, { condMode: e.target.value })}
                    >
                      <option value="none">none</option>
                      <option value="variable">variable</option>
                      <option value="custom">custom</option>
                      <option value="if">if</option>
                    </select>
                  </FieldRow>
                  {condMode === "custom" && (
                    <FieldRow label="Condition Expression">
                      <input
                        className="w-full border rounded px-2 py-1 text-sm"
                        value={data.condCustom || ""}
                        onChange={(e) => onPatch(node.id, { condCustom: e.target.value })}
                        placeholder="x < 10"
                      />
                    </FieldRow>
                  )}
                </>
              )}
            </Section>
          )}

          {/* Read-only: connected variables */}
          {connectedVars?.length > 0 && (
            <Section title="Connected Variables" defaultOpen={false}>
              <div className="flex flex-wrap gap-1">
                {connectedVars.map((v, i) => (
                  <span key={i} className="px-2 py-0.5 bg-gray-100 rounded text-xs">{v}</span>
                ))}
              </div>
            </Section>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-auto p-4 text-sm text-gray-800 space-y-6">
          {/* Design Tab */}
          {/* Alignment Group */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-2 bg-gray-50 font-medium text-gray-700">Alignment & Size</div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-3 gap-2 items-center">
                <div className="text-[11px] text-gray-600 font-medium">Horizontal</div>
                <div className="col-span-2">
                  <select
                    value={data.styleAlignH || 'center'}
                    onChange={(e) => onPatch(node.id, { styleAlignH: e.target.value })}
                    disabled={data.styleSizeMode === 'expand'}
                    className={`w-full border rounded px-2 py-1 text-[11px] ${data.styleSizeMode === 'expand' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white'}`}
                  >
                    <option value="left">left</option>
                    <option value="center">center</option>
                    <option value="right">right</option>
                  </select>
                  {data.styleSizeMode === 'expand' && (
                    <div className="mt-1 text-[10px] text-gray-500">Disabled in expand mode (full width)</div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 items-center">
                <div className="text-[11px] text-gray-600 font-medium">Sizing</div>
                <div className="col-span-2">
                  <select
                    value={data.styleSizeMode || 'content'}
                    onChange={(e) => onPatch(node.id, { styleSizeMode: e.target.value })}
                    className="w-full border rounded px-2 py-1 text-[11px] bg-white"
                  >
                    <option value="content">content</option>
                    <option value="expand">expand</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Appearance Group */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-2 bg-gray-50 font-medium text-gray-700">Appearance</div>
            <div className="p-4 space-y-3">
              {/* Card basic styling */}
              <div className="grid grid-cols-3 gap-2 items-center">
                <div className="text-[11px] text-gray-600 font-medium">Card Color</div>
                <div className="col-span-2 flex items-center gap-3">
                  <div className="relative">
                    <input
                      type="color"
                      value={
                        data.styleCardBg ||
                        (type === 'variable' ? '#ecfeff' :
                          type === 'return' ? '#e5e7eb' :
                          type === 'process' ? '#ffffff' :
                          type === 'parameter' ? '#ffffff' :
                          type === 'namefunction' ? '#f8fafc' :
                          type === 'loop' ? '#fffbeb' :
                          type === 'condition' ? '#f5f3ff' :
                          '#ffffff')
                      }
                      onChange={(e) => onPatch(node.id, { styleCardBg: e.target.value })}
                      className="h-10 w-16 border border-gray-300 rounded shadow-sm cursor-pointer"
                    />
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] text-gray-500 whitespace-nowrap">Preview</div>
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <div className="text-[11px] text-gray-600 font-medium">Opacity</div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded px-2 py-1">
                        <span className="text-[10px] text-gray-500">%</span>
                        <input
                          type="number"
                          min={10}
                          max={100}
                          step={5}
                          value={Math.round((data.styleCardOpacity || 1) * 100)}
                          onChange={(e) => {
                            const raw = Number(e.target.value);
                            const pct = isNaN(raw) ? 100 : Math.min(100, Math.max(10, raw));
                            onPatch(node.id, { styleCardOpacity: pct / 100 });
                          }}
                          className="w-16 bg-transparent outline-none text-right text-[11px]"
                        />
                        <span className="text-[11px] text-gray-700">{Math.round((data.styleCardOpacity||1)*100)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 items-center">
                <div className="text-[11px] text-gray-600 font-medium">Radius</div>
                <div className="col-span-2 flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={40}
                    value={data.styleCardRadius ?? 16}
                    onChange={(e) => onPatch(node.id, { styleCardRadius: Number(e.target.value) })}
                    className="w-20 border rounded px-2 py-1 text-[11px]"
                  />
                  <div className="text-[10px] text-gray-500">px</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 items-center">
                <div className="text-[11px] text-gray-600 font-medium">Shadow Color</div>
                <div className="col-span-2">
                  <input
                    type="color"
                    value={data.styleShadowColor || '#000000'}
                    onChange={(e) => onPatch(node.id, { styleShadowColor: e.target.value })}
                    className="h-8 w-12 border rounded"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 items-center">
                <div className="text-[11px] text-gray-600 font-medium">Shadow Distance</div>
                <div className="col-span-2 flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={24}
                    step={1}
                    value={data.styleShadowDistance || 4}
                    onChange={(e) => onPatch(node.id, { styleShadowDistance: Number(e.target.value) })}
                    className="flex-1"
                  />
                  <div className="text-[10px] w-8 text-right">{data.styleShadowDistance || 4}px</div>
                </div>
              </div>

              {/* Header color (nodes with header/banner) */}
              {(type === 'namefunction' || type === 'variable' || type === 'condition' || type === 'loop' || type === 'return' || type === 'process' || type === 'parameter') && (
                <div className="grid grid-cols-3 gap-2 items-center">
                  <div className="text-[11px] text-gray-600 font-medium">Header Color</div>
                  <div className="col-span-2">
                    <input
                      type="color"
                      value={data.styleHeaderBg || (type === 'variable' ? '#0e7490' : type === 'namefunction' ? '#6366f1' : '#6d28d9')}
                      onChange={(e) => onPatch(node.id, { styleHeaderBg: e.target.value })}
                      className="h-8 w-12 border rounded"
                    />
                  </div>
                </div>
              )}

              {/* Extra tag colors per node */}
              {type === 'variable' && (
                <div className="grid grid-cols-3 gap-2 items-center">
                  <div className="text-[11px] text-gray-600 font-medium">Type Panel</div>
                  <div className="col-span-2">
                    <input
                      type="color"
                      value={data.styleTypePanelBg || '#9ca3af'}
                      onChange={(e) => onPatch(node.id, { styleTypePanelBg: e.target.value })}
                      className="h-8 w-12 border rounded"
                    />
                  </div>
                </div>
              )}
              {type === 'namefunction' && (
                <div className="grid grid-cols-3 gap-2 items-center">
                  <div className="text-[11px] text-gray-600 font-medium">Name Panel</div>
                  <div className="col-span-2">
                    <input
                      type="color"
                      value={data.styleNamePanelBg || '#fcd34d'}
                      onChange={(e) => onPatch(node.id, { styleNamePanelBg: e.target.value })}
                      className="h-8 w-12 border rounded"
                    />
                  </div>
                </div>
              )}
              {type === 'condition' && (
                <div className="grid grid-cols-3 gap-2 items-center">
                  <div className="text-[11px] text-gray-600 font-medium">True Color</div>
                  <div className="col-span-2 flex gap-2">
                    <input
                      type="color"
                      value={data.styleTrueBg || '#6ee7b7'}
                      onChange={(e) => onPatch(node.id, { styleTrueBg: e.target.value })}
                      className="h-8 w-12 border rounded"
                    />
                    <input
                      type="color"
                      value={data.styleFalseBg || '#fda4af'}
                      onChange={(e) => onPatch(node.id, { styleFalseBg: e.target.value })}
                      className="h-8 w-12 border rounded"
                    />
                  </div>
                </div>
              )}
              {type === 'loop' && (
                <div className="grid grid-cols-3 gap-2 items-center">
                  <div className="text-[11px] text-gray-600 font-medium">Counter / Condition</div>
                  <div className="col-span-2 flex gap-2">
                    <input
                      type="color"
                      value={data.styleCounterPanelBg || '#fda4af'}
                      onChange={(e) => onPatch(node.id, { styleCounterPanelBg: e.target.value })}
                      className="h-8 w-12 border rounded"
                    />
                    <input
                      type="color"
                      value={data.styleConditionPanelBg || '#e9d5ff'}
                      onChange={(e) => onPatch(node.id, { styleConditionPanelBg: e.target.value })}
                      className="h-8 w-12 border rounded"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavPropertiesNode;
