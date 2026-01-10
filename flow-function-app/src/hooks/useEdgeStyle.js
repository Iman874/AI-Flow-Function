import { useCallback, useState, useEffect } from "react";

const DEFAULT_EDGE_STYLE_KEY = "ai-flow-default-edge-style";

// Mapping dari edgeStyle key ke ReactFlow edge type
const EDGE_TYPE_MAP = {
  smooth: "smoothstep",      // curved
  straight: "straight",      // lurus
  corner: "step",            // sudut 90 derajat
  bezier: "default",         // bezier curve
};

// Mapping dari edgeStyle key ke stroke properties
const EDGE_STROKE_MAP = {
  smooth: {
    strokeWidth: 2,
    stroke: "#555",
  },
  straight: {
    strokeWidth: 2,
    stroke: "#555",
  },
  corner: {
    strokeWidth: 2,
    stroke: "#555",
  },
  bezier: {
    strokeWidth: 2,
    stroke: "#555",
  },
};

export function useEdgeStyle() {
  const [defaultStyle, setDefaultStyle] = useState("corner");

  // Load default style dari localStorage saat mount
  useEffect(() => {
    const saved = localStorage.getItem(DEFAULT_EDGE_STYLE_KEY);
    if (saved && EDGE_TYPE_MAP[saved]) {
      setDefaultStyle(saved);
    }
  }, []);

  // Get edge properties berdasarkan style
  const getEdgeProperties = useCallback((style = defaultStyle) => {
    const edgeType = EDGE_TYPE_MAP[style] || "smoothstep";
    const strokeProps = EDGE_STROKE_MAP[style] || EDGE_STROKE_MAP.smooth;

    return {
      type: edgeType,
      animated: true,
      style: strokeProps,
      data: {
        edgeStyle: style,
      },
    };
  }, [defaultStyle]);

  // Set default style dan save ke localStorage
  const setDefaultEdgeStyle = useCallback((style) => {
    if (EDGE_TYPE_MAP[style]) {
      setDefaultStyle(style);
      localStorage.setItem(DEFAULT_EDGE_STYLE_KEY, style);
    }
  }, []);

  // Apply style ke single edge
  const applyEdgeStyle = useCallback((edges, edgeId, style) => {
    const edgeProps = getEdgeProperties(style);
    return edges.map((edge) =>
      edge.id === edgeId
        ? {
            ...edge,
            ...edgeProps,
          }
        : edge
    );
  }, [getEdgeProperties]);

  // Apply style ke semua edges
  const applyEdgeStyleToAll = useCallback((edges, style) => {
    const edgeProps = getEdgeProperties(style);
    return edges.map((edge) => ({
      ...edge,
      ...edgeProps,
    }));
  }, [getEdgeProperties]);

  return {
    defaultStyle,
    setDefaultEdgeStyle,
    getEdgeProperties,
    applyEdgeStyle,
    applyEdgeStyleToAll,
    EDGE_TYPE_MAP,
  };
}
