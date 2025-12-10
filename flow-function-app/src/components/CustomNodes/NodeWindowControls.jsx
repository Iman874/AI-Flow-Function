import React from 'react';

// Window-style controls: minimize (underscore) / restore (overlapping squares)
// Props: collapsed:boolean, onToggle:()=>void
const NodeWindowControls = ({ collapsed, onToggle }) => {
  return (
    <div className="absolute top-1 right-2 flex items-center gap-2 select-none">
      <button
        onClick={(e) => { e.stopPropagation(); onToggle?.(); }}
        title={collapsed ? 'Restore' : 'Minimize'}
        className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 active:scale-95 transition text-gray-700 bg-white shadow border border-gray-300"
      >
        {collapsed ? (
          // restore (overlapping squares)
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <rect x="8" y="8" width="10" height="10" />
            <path d="M6 16V6h10" />
          </svg>
        ) : (
          // minimize underscore
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <line x1="6" y1="18" x2="18" y2="18" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default NodeWindowControls;
