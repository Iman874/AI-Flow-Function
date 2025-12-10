import React from "react";
import Sidebar from "./components/Sidebar";
import FlowCanvas from "./components/FlowCanvas";

const App = () => {
  return (
    <div className="flex h-screen w-screen bg-neutral-800">
      <Sidebar />
      <div className="flex-1 bg-stone-300">
        <FlowCanvas />
      </div>
    </div>
  );
};

export default App;
