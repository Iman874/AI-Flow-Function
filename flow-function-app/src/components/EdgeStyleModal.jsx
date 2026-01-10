import React, { useState } from "react";

const EDGE_STYLES = [
  {
    key: "smooth",
    label: "Smooth (Melengkung)",
    description: "Kurva halus yang smooth",
    icon: "M 10 20 Q 20 5 30 20",
  },
  {
    key: "straight",
    label: "Straight (Lurus)",
    description: "Garis lurus langsung",
    icon: "M 10 20 L 30 20",
  },
  {
    key: "corner",
    label: "Corner (Sudut)",
    description: "Garis dengan sudut 90 derajat",
    icon: "M 10 10 L 10 30 L 30 30",
  },
  {
    key: "bezier",
    label: "Bezier (Kurva Elegan)",
    description: "Kurva bezier yang elegan",
    icon: "M 10 20 C 15 5 25 5 30 20",
  },
];

export default function EdgeStyleModal({ selectedEdge, onApply, onClose }) {
  const [selectedStyle, setSelectedStyle] = useState(selectedEdge?.data?.edgeStyle || "smooth");
  const [applyToAll, setApplyToAll] = useState(false);
  const [setAsDefault, setSetAsDefault] = useState(false);

  const handleApply = () => {
    onApply({
      edgeId: selectedEdge.id,
      style: selectedStyle,
      applyToAll,
      setAsDefault,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-2xl w-[600px] max-w-full p-8 relative">
        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold transition"
          onClick={onClose}
          title="Close"
        >
          ×
        </button>

        <h2 className="text-2xl font-bold mb-6 text-gray-900">Customize Edge Style</h2>
        <p className="text-sm text-gray-600 mb-6">Pilih style penghubung antar card</p>

        {/* Style Selection Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {EDGE_STYLES.map((style) => (
            <button
              key={style.key}
              onClick={() => setSelectedStyle(style.key)}
              className={`p-6 rounded-lg border-2 transition-all cursor-pointer ${
                selectedStyle === style.key
                  ? "border-indigo-600 bg-indigo-50 shadow-md"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              {/* SVG Preview */}
              <svg
                viewBox="0 0 40 40"
                className="w-full h-16 mb-3"
                style={{ stroke: selectedStyle === style.key ? "#4f46e5" : "#999", strokeWidth: 2, fill: "none" }}
              >
                <path d={style.icon} />
              </svg>

              <div className="text-left">
                <div className="font-semibold text-gray-900 text-sm">{style.label}</div>
                <div className="text-xs text-gray-600 mt-1">{style.description}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Options */}
        <div className="space-y-4 mb-8 p-4 bg-gray-50 rounded-lg">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={applyToAll}
              onChange={(e) => setApplyToAll(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 accent-indigo-600"
            />
            <span className="text-sm font-medium text-gray-700">
              Terapkan ke semua penghubung yang ada
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={setAsDefault}
              onChange={(e) => setSetAsDefault(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 accent-indigo-600"
            />
            <span className="text-sm font-medium text-gray-700">
              Jadikan sebagai style default untuk penghubung baru
            </span>
          </label>
        </div>

        {/* Preview Info */}
        <div className="mb-8 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>Preview:</strong> Style "{EDGE_STYLES.find(s => s.key === selectedStyle)?.label}" akan diterapkan
            {applyToAll && " ke semua penghubung"}.
            {setAsDefault && " Dan akan menjadi default untuk penghubung baru."}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
          >
            Batal
          </button>
          <button
            onClick={handleApply}
            className="px-6 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 active:scale-95 transition"
          >
            Terapkan
          </button>
        </div>
      </div>
    </div>
  );
}
