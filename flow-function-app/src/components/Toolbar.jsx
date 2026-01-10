import React, { useState } from "react";
import LogViewer from "./LogViewer";

const Toolbar = () => {
  const tools = ["Cursor", "Line", ""];
  const [showLogger, setShowLogger] = useState(false);

  return (
    <>
      <div className="h-24 bg-gray-200 flex justify-center items-center gap-6 border-t border-gray-300 shadow-inner">
        {tools.map((tool, i) => (
          <div
            key={i}
            className="w-24 h-16 bg-gray-300 flex items-center justify-center rounded-md font-medium cursor-pointer hover:bg-gray-400 transition"
          >
            {tool || ""}
          </div>
        ))}
        <button
          onClick={() => setShowLogger(!showLogger)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition"
          title="Open Flow Logger"
        >
          📊 Logs
        </button>
      </div>
      <LogViewer isOpen={showLogger} onClose={() => setShowLogger(false)} />
    </>
  );
};

export default Toolbar;
