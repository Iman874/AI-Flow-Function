import React, { useState } from "react";
import { generatePseudo } from "../utils/generatePseudo";
import { generateCode } from "../utils/generateCode";

const LANGUAGES = [
  { key: "pseudo", label: "Pseudo" },
  { key: "python", label: "Python" },
  { key: "cpp", label: "C++" },
  { key: "c", label: "C" },
  { key: "csharp", label: "C#" },
  { key: "java", label: "Java" },
  { key: "javascript", label: "JavaScript" },
];

export default function GenerateCodeModal({ nodes, edges, onClose }) {
  const [lang, setLang] = useState("pseudo");
  const pseudoArr = generatePseudo(nodes, edges);
  const pseudo = Array.isArray(pseudoArr) ? pseudoArr.join("\n") : String(pseudoArr);
  const code = lang === "pseudo" ? pseudo : generateCode(lang, nodes, edges);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-2xl w-[600px] max-w-full p-6 relative">
        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl font-bold"
          onClick={onClose}
          title="Close"
        >
          ×
        </button>
        <h2 className="text-lg font-bold mb-4 text-center">Generated Code</h2>
        {/* Pseudocode/code box */}
        <div className="relative mb-4">
          <pre className="bg-gray-100 rounded-md p-4 text-sm font-mono whitespace-pre overflow-x-auto min-h-[120px]">
            {code}
          </pre>
          <button
            className="absolute top-2 right-2 px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 text-xs shadow"
            onClick={handleCopy}
            title="Copy code"
          >
            Copy
          </button>
        </div>
        {/* Language selector */}
        <div className="flex flex-wrap gap-2 justify-center mb-2">
          {LANGUAGES.map(l => (
            <button
              key={l.key}
              className={`px-3 py-1 rounded border text-sm font-medium transition ${lang === l.key ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white text-gray-700 border-gray-300 hover:bg-indigo-50'}`}
              onClick={() => setLang(l.key)}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
