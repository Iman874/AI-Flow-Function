# AI Flow Function - Copilot Instructions

## Project Overview
**AI Flow Function** is a visual flowchart editor that converts flowchart diagrams into pseudocode and executable code across multiple languages (Python, JavaScript, Java, C++, C, C#). Built with React, Vite, ReactFlow, and Tailwind CSS.

### Core Architecture Pattern
```
Visual Flowchart → ReactFlow Graph (nodes + edges) → Pseudocode → Target Language Code
```

## Key Architecture Components

### 1. **ReactFlow Canvas System** (`src/components/FlowCanvas.jsx`)
- **Central state manager** for nodes and edges using `useNodesState` and `useEdgesState`
- **Node types registry**: Maps 11 custom node types to React components
  ```jsx
  const nodeTypes = {
    variable, if, else, namefunction, parameter, process, 
    condition, loop, return, input, output
  };
  ```
- **Edge validation**: `validateConnection(params, nodes)` enforces semantic rules before connections allowed
- **Connection rules** in `src/components/Rules Nodes/` - each rule file validates specific node behaviors

### 2. **Conversion Pipeline**
Three key conversion utilities in `src/utils/`:

| Function | Purpose | Input | Output |
|----------|---------|-------|--------|
| `generatePseudo()` | Flow → Pseudocode | nodes[], edges[] | Pseudocode string |
| `generateCode()` | Pseudocode → Lang | pseudo string, lang | Executable code |
| `pseudoToFlow()` | Reverse: Pseudo → Flow | pseudocode string | nodes[], edges[] |

**Example flow**:
```javascript
// Flow traversal: Start from namefunction node, follow edges to build pseudocode
generatePseudo(nodes, edges)
  → "FUNCTION myFunc\nDECLARE x\nREAD x\nPRINT x\nRETURN x"

generateCode("python", nodes, edges)
  → "def myFunc():\n  x = input()\n  print(x)\n  return x"
```

### 3. **Custom Node System** (`src/components/CustomNodes/`)
Each node extends ReactFlow's Handle system with semantic validation:

- **Input/Output Nodes**: Gateway for READ/PRINT statements
- **Variable Node**: Supports scalar/array types with dimension tracking
  - Validates identifier names: `/^[a-zA-Z_][a-zA-Z0-9_]*$/`
  - Syncs `name` ↔ `varName` fields bidirectionally
- **Control Flow**: If/Else/Loop nodes define pseudocode structure
- **NameFunction Node**: Required entry point - only one per flow

### 4. **Validation Rules System** (`src/components/Rules Nodes/`)
**Pattern**: Each rule file exports a function `(params, nodes) => boolean`
- Imported and executed in sequence by `validateConnection()`
- Current rules: 9 node types with validation logic
- Example (namefunction.rules.js):
  ```javascript
  // NameFunction can only accept variable node inputs
  if (targetNode?.type === 'namefunction' && targetHandle === 'varInput') {
    return sourceNode?.type === 'variable';
  }
  ```

### 5. **Code Generation** (`src/utils/generateCode/`)
Language transpilers convert pseudocode tokens to target syntax:
```javascript
// Pattern: Split on keywords, map to language-specific syntax
python.js:  IF → "if condition:" | RETURN → "return value"
javascript.js: IF → "if (condition) {" | RETURN → "return value;"
```

## Developer Workflows

### Build & Development
```bash
npm run dev       # Start Vite dev server (HMR enabled)
npm run build     # Production build
npm run lint      # ESLint check (no formatting rules applied yet)
npm run preview   # Preview production build locally
```

### Adding a New Node Type
1. Create component: `src/components/CustomNodes/YourNode.jsx`
   - Import `Handle`, `Position` from reactflow
   - Accept `{id, data, selected}` props
   - Export with `useReactFlow()` for state updates
2. Register in `FlowCanvas.jsx`: Add to `nodeTypes` object
3. Add validation rule: `src/components/Rules Nodes/your.rules.js`
4. Import rule in `src/components/Rules Nodes/index.js`
5. Add to sidebar: `src/components/sidebar/nodesList.js`

### Adding a New Language Generator
1. Create file: `src/utils/generateCode/language.js`
   - Export default function: `(pseudoString) => targetCode`
   - Split on pseudocode keywords, map to syntax
2. Import in `src/utils/generateCode/index.js`
3. Add language option to `LANGUAGES` in `GenerateCodeModal.jsx`

### Customizing Edge Styles
**Feature**: Click any edge to open style modal with 4 options (smooth, straight, corner, bezier)
- **Implementation**: `src/hooks/useEdgeStyle.js` manages state + localStorage persistence
- **Components**: `EdgeStyleModal.jsx` provides UI, `FlowCanvas.jsx` handles onEdgeClick
- **Workflow**:
  1. User clicks edge → `onEdgeClick` triggered
  2. Modal opens with style previews
  3. User selects style + options (apply to all, set as default)
  4. `handleEdgeStyleApply()` updates edge(s) + localStorage if default selected
- **Key methods**:
  - `getEdgeProperties(style)` - Returns edge type, animated, and style properties
  - `applyEdgeStyle(edges, edgeId, style)` - Update single edge
  - `applyEdgeStyleToAll(edges, style)` - Update all edges at once
- **Default storage**: localStorage key `"ai-flow-default-edge-style"` persists user preference

## Project Conventions & Patterns

### **Pseudocode Format**
Standard keywords (uppercase) for cross-language consistency:
- `FUNCTION name` - function declaration
- `READ varname` - input statement
- `PRINT varname` - output statement
- `DECLARE varname` - variable declaration
- `IF condition` - conditional branch
- `ELSE` - else branch
- `LOOP (label)` - loop structure
- `RETURN value` - return statement
- `PROCESS` - generic processing step
- `PARAM name` - parameter declaration

### **Node Data Structure**
All nodes store config in `data` property:
```javascript
{
  id: "node-123",
  type: "variable",
  position: {x: 100, y: 200},
  data: {
    name: "count",           // identifier
    varType: "var|array",    // type
    arraySize: 10,           // if array
    arrayDims: 1,            // dimensions
    collapsed: false         // UI state
  }
}
```

### **Edge Data Structure**
Edges now support custom styling:
```javascript
{
  id: "edge-1-2",
  source: "node-1",
  target: "node-2",
  type: "smoothstep",        // smooth|straight|step|default (bezier)
  animated: true,
  style: {
    stroke: "#555",          // color, changes to #8b5cf6 for varInput
    strokeWidth: 2
  },
  data: {
    edgeStyle: "smooth"      // Key for user preference
  }
}
```

### **State Management**
- Uses ReactFlow hooks (`useNodesState`, `useEdgesState`) - not Redux
- Node data updates flow through `setNodes()` callbacks
- Bidirectional sync for linked fields (e.g., `name` ↔ `varName`)

### **UI Framework**
- Tailwind CSS for styling (config: `tailwind.config.js`)
- No component library - custom styled with inline Tailwind classes
- Colors: neutral-800 (sidebar bg), stone-300 (canvas), indigo accents

### **Identifier Validation**
Applied consistently in Variables and Parameters:
```regex
^[a-zA-Z_][a-zA-Z0-9_]*$  // Matches valid language identifiers
```

## Critical Integration Points

1. **FlowCanvas** ↔ **Rules System**: Connection validation happens at `onConnect` handler
2. **Sidebar drag** ↔ **Canvas drop**: Uses `dataTransfer` API with `"application/reactflow"` type
3. **GenerateCodeModal** ↔ **Generators**: Calls `generatePseudo()` then `generateCode()` sequentially
4. **Node components** ↔ **FlowCanvas state**: Reads/writes via `useReactFlow().setNodes()`

## Common Tasks & Examples

### Debug pseudocode generation
```javascript
// In FlowCanvas or GenerateCodeModal
const pseudoArr = generatePseudo(nodes, edges);
console.log(pseudoArr); // Check array contents
```

### Fix connection validation
Edit relevant rule in `src/components/Rules Nodes/` and test in `validateConnection(params, nodes)`

### Extend pseudocode keywords
1. Add keyword mapping in language transpiler (e.g., `python.js`)
2. Add case in `nodeToPseudo()` function
3. Add parsing logic in `pseudoToFlow.js` if reverse conversion needed

## Testing & Quality
- ESLint config: `eslint.config.js` (minimal rules, React plugin enabled)
- No unit test framework currently - manual testing via dev server
- Recommendation: Add test cases when adding validation rules or language generators
