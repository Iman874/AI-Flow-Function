import React from "react";

const Toolbar = () => {
  const tools = ["Cursor", "Line", ""];

  return (
    <div className="h-24 bg-gray-200 flex justify-center items-center gap-6 border-t border-gray-300 shadow-inner">
      {tools.map((tool, i) => (
        <div
          key={i}
          className="w-24 h-16 bg-gray-300 flex items-center justify-center rounded-md font-medium cursor-pointer hover:bg-gray-400 transition"
        >
          {tool || ""}
        </div>
      ))}
    </div>
  );
};

export default Toolbar;
