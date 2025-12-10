import React, { useEffect, useRef, useState } from "react";

// Dropdown based navigation replacing multiple tabs.
// Props: value ('all'|'input'|'process'|'output'), onChange(next), onToggleSearch()
const LeftMainNavigationNode = ({ value, onChange, onToggleSearch }) => {
  const options = [
    { key: "all", label: "All Node" },
    { key: "input", label: "Input Node" },
    { key: "process", label: "Process Node" },
    { key: "output", label: "Output Node" },
  ];
  const current = options.find((o) => o.key === value) || options[0];
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (open && menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="w-full px-6 pt-2 pb-2 relative">
      <div className="flex items-center justify-between gap-3">
        {/* Dropdown trigger */}
        <div className="relative" ref={menuRef}>
            <button
              onClick={() => setOpen((o) => !o)}
              className="px-4 py-2 text-sm font-medium rounded-xl bg-gray-50 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)] text-black flex items-center gap-2 hover:bg-white"
            >
              <span>{current.label}</span>
              <svg className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
            </button>
            {open && (
              <div className="absolute z-10 mt-2 w-44 rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden">
                {options.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => { onChange?.(opt.key); setOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${value === opt.key ? 'font-semibold text-indigo-600' : 'text-gray-600'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
        </div>
        {/* Search icon button on right */}
        <button
          onClick={onToggleSearch}
          className="h-10 w-10 flex items-center justify-center rounded-xl shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)] bg-gray-50 hover:bg-white text-gray-600"
          title="Search Nodes"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default LeftMainNavigationNode;
