import React, { useMemo, useState } from "react";
import LeftMainNavigationNode from "../nav/left_main_navigation_node";
import { NODES } from "./sidebar/nodesList";

const Sidebar = () => {
  const nodes = [
    { label: "Function", type: "namefunction" },
    { label: "Input", type: "input" },
    { label: "Variabel", type: "variable" },
    { label: "Condition", type: "condition" },
    { label: "Loop", type: "loop" },
    { label: "Process", type: "process" },
    { label: "Parameter", type: "parameter" },
    { label: "Return", type: "return" },
    { label: "Output", type: "output" },
  ];

  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  

  // removed duplicate filtered declaration

  const onDragStart = (event, type) => {
    event.dataTransfer.setData("application/reactflow", type);
    event.dataTransfer.effectAllowed = "move";
  };

  const filtered = useMemo(() => {
    let base = NODES;
    if (tab === "input") {
      base = NODES.filter((n) => n.category === "input");
    } else if (tab === "process") {
      base = NODES.filter((n) => n.category === "process");
    } else if (tab === "output") {
      base = NODES.filter((n) => n.category === "output");
    } // 'all' shows all
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      base = base.filter((n) => n.label.toLowerCase().includes(q));
    }
    return base;
  }, [tab, query]);

  return (
    <div className="h-screen w-80 bg-white flex flex-col border-r border-gray-200 shadow-sm select-none">
      {/* Flow header */}
      <div className="px-7 pt-8 pb-6">
        <div className="text-2xl font-semibold text-gray-900 tracking-tight">Flow 1</div>
        <div className="mt-2 text-[11px] text-gray-400">last saved in 10.13 (31-10-2025)</div>
        <div className="mt-4 flex items-center gap-3 text-[11px]">
          <span className="px-3 py-1 rounded bg-indigo-100 text-indigo-600 font-medium">Free Tier</span>
          <button className="text-[11px] text-indigo-500 hover:underline">Upgrade Premium Tier</button>
        </div>
      </div>
      <div className="h-px w-full bg-gray-200" />
      {/* Tabs */}
      <div className="pb-0">
        <LeftMainNavigationNode
          value={tab}
          onChange={setTab}
          onToggleSearch={() => setShowSearch((v) => !v)}
        />
        {showSearch && (
          <div className="px-6 mb-3">
            <div className="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search nodes..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white placeholder-gray-400"
              />
            </div>
          </div>
        )}
        <div className="h-px w-full bg-gray-200" />
      </div>
      <div className="px-6 pt-4 text-[10px] font-semibold text-gray-500 tracking-wide uppercase">Nodes</div>
      <div className="mt-2 flex-1 overflow-y-auto px-5 pb-6 space-y-6">
        {filtered.map((n) => (
          <div
            key={n.type}
            draggable
            onDragStart={(e) => onDragStart(e, n.type)}
            className="group rounded-2xl p-0.5 bg-gradient-to-b from-gray-100 to-gray-200 shadow hover:shadow-md cursor-pointer"
          >
            <div className="rounded-xl bg-white p-4 border border-gray-200 flex items-center gap-3">
              <span className="text-lg">{n.icon}</span>
              <span className="font-semibold text-gray-700">{n.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
