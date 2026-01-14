# Supporting Graph Components - Quick Reference

## Overview

These three components work together with the main `KnowledgeGraph` component to provide a complete graph visualization experience.

## 1. GraphControls.tsx

**Purpose:** Provides filtering, search, and layout controls for the knowledge graph.

**Location:** `src/components/graph/GraphControls.tsx`

### Features:
- **Search Input** - Find nodes by name/label
- **Node Type Filters** - Show/hide different node types:
  - Books (blue)
  - Passages (emerald)
  - Notes (amber)
  - Themes (purple)
  - People (rose)
  - Places (cyan)
- **Layout Selection** - Choose graph layout algorithm:
  - Force Directed (default)
  - Hierarchical
  - Radial
- **Reset Button** - Clear all filters and search

### Props:
```typescript
interface GraphControlsProps {
  filteredNodeTypes: Set<string>;
  onFilterChange: (nodeType: string, enabled: boolean) => void;
  layoutAlgorithm: 'force' | 'hierarchical' | 'radial';
  onLayoutChange: (layout: 'force' | 'hierarchical' | 'radial') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}
```

### Usage Example:
```typescript
<GraphControls
  filteredNodeTypes={filteredNodeTypes}
  onFilterChange={handleFilterChange}
  layoutAlgorithm={layoutAlgorithm}
  onLayoutChange={setLayoutAlgorithm}
  searchQuery={searchQuery}
  onSearchChange={setSearchQuery}
/>
```

### Styling:
- Fixed width: 256px (w-64)
- White background with rounded borders
- Hover effects on checkboxes
- Icon indicators for each section

---

## 2. GraphStats.tsx

**Purpose:** Displays real-time statistics about the knowledge graph.

**Location:** `src/components/graph/GraphStats.tsx`

### Features:
- **Overview Cards** - Total nodes and edges count
- **Visibility Tracker** - Shows currently visible vs total
- **Node Breakdown** - Count of each node type
- **Insights** - Highlights most common node type

### Props:
```typescript
interface GraphStatsProps {
  stats: {
    totalNodes: number;
    totalEdges: number;
    nodeTypeCounts: Record<string, number>;
    edgeTypeCounts: Record<string, number>;
    visibleNodes: number;
    visibleEdges: number;
  };
}
```

### Usage Example:
```typescript
<GraphStats stats={{
  totalNodes: 15,
  totalEdges: 20,
  nodeTypeCounts: { 
    book: 1, 
    passage: 5, 
    theme: 5, 
    person: 2, 
    note: 2 
  },
  edgeTypeCounts: { 
    contains: 5, 
    theme_connection: 10, 
    references: 5 
  },
  visibleNodes: 15,
  visibleEdges: 20,
}} />
```

### Visual Design:
- Blue cards for nodes
- Purple cards for edges
- Gray background for visibility stats
- Gradient card for insights
- Icons for each section

---

## 3. NodeDetailsPanel.tsx

**Purpose:** Displays detailed information about a selected graph node.

**Location:** `src/components/graph/NodeDetailsPanel.tsx`

### Features:
- **Dynamic Content** - Shows different info based on node type
- **Color-Coded Header** - Matches node type colors
- **Node-Specific Details:**
  - **Notes:** Preview, tags, reference count
  - **Passages:** Reference, summary
  - **Themes:** Description, verse count
  - **People:** Description, role
  - **Books:** Description, author, date
- **Action Buttons:**
  - Edit Note (for note nodes)
  - Read Passage (for passage nodes)
  - View Connections (all nodes)

### Props:
```typescript
interface NodeDetailsPanelProps {
  node: Node;
  onClose: () => void;
  studyPlanId?: string;
}
```

### Usage Example:
```typescript
{selectedNode && (
  <NodeDetailsPanel
    node={selectedNode}
    onClose={() => setSelectedNode(null)}
    studyPlanId={planId}
  />
)}
```

### Styling:
- Fixed position on right side
- 384px width (w-96)
- Full height with shadow
- Color-coded header based on node type
- Scrollable content area
- Fixed action buttons at bottom

---

## Integration with KnowledgeGraph Component

All three components are designed to be used within the main `KnowledgeGraph.tsx` component:

```typescript
export function KnowledgeGraph({
  initialNodes,
  initialEdges,
  onNodeClick,
  onNodeDoubleClick,
  studyPlanId,
}: KnowledgeGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [filteredNodeTypes, setFilteredNodeTypes] = useState<Set<string>>(
    new Set(['book', 'passage', 'note', 'theme', 'person', 'place'])
  );
  const [layoutAlgorithm, setLayoutAlgorithm] = useState<'force' | 'hierarchical' | 'radial'>('force');
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate stats
  const stats = useMemo(() => {
    // ... calculate statistics
  }, [nodes, edges]);

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={visibleNodes}
        edges={visibleEdges}
        // ... other props
      >
        <Background />
        <Controls />
        <MiniMap />
        
        {/* Left Panel - Controls */}
        <Panel position="top-left" className="bg-white rounded-lg shadow-lg p-4 m-4">
          <GraphControls
            filteredNodeTypes={filteredNodeTypes}
            onFilterChange={handleFilterChange}
            layoutAlgorithm={layoutAlgorithm}
            onLayoutChange={setLayoutAlgorithm}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </Panel>

        {/* Right Panel - Stats */}
        <Panel position="top-right" className="bg-white rounded-lg shadow-lg p-4 m-4">
          <GraphStats stats={stats} />
        </Panel>
      </ReactFlow>

      {/* Details Panel (overlay) */}
      {selectedNode && (
        <NodeDetailsPanel
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
          studyPlanId={studyPlanId}
        />
      )}
    </div>
  );
}
```

---

## Component Responsibilities

| Component | Responsibility | Position | Size |
|-----------|---------------|----------|------|
| GraphControls | User input for filtering/search | Top-left | 256px wide |
| GraphStats | Display metrics | Top-right | 256px wide |
| NodeDetailsPanel | Show selected node info | Right side | 384px wide |

---

## Styling Consistency

All components follow the same design system:

- **Colors:** Match node type colors (blue, emerald, amber, purple, rose, cyan)
- **Spacing:** Consistent padding (p-4) and gaps (gap-2, gap-4)
- **Typography:** 
  - Headers: font-semibold
  - Labels: text-sm text-gray-600
  - Values: text-sm text-gray-900
- **Borders:** rounded-lg with shadow-lg
- **Icons:** Lucide React icons at 16px (w-4 h-4)

---

## Testing Tips

### GraphControls
```typescript
// Test that filtering works
onFilterChange('note', false); // Should hide all notes
onFilterChange('note', true);  // Should show notes again

// Test search
onSearchChange('John'); // Should filter to nodes containing "John"
onSearchChange('');     // Should show all nodes
```

### GraphStats
```typescript
// Stats should update automatically when nodes/edges change
// Check that counts are accurate
// Verify visibility tracker shows filtered vs total
```

### NodeDetailsPanel
```typescript
// Test with different node types
setSelectedNode(noteNode);    // Should show note-specific fields
setSelectedNode(passageNode); // Should show passage-specific fields

// Test closing
onClose(); // Should hide panel
```

---

## Next Steps

After implementing these components:

1. **Copy KnowledgeGraph.tsx** from `/tmp/bible_study_new_files/`
2. **Import supporting components** in KnowledgeGraph.tsx
3. **Test in isolation** - Create a simple page to render each component
4. **Integrate** - Use all components together in study graph page
5. **Style refinements** - Adjust spacing/colors as needed

---

## Quick Reference: File Locations

```
src/components/graph/
├── GraphControls.tsx        ✅ Created
├── GraphStats.tsx           ✅ Created
├── NodeDetailsPanel.tsx     ✅ Created
├── KnowledgeGraph.tsx       ⏳ To copy from files.zip
└── nodes/
    ├── NoteNode.tsx         ✅ Created
    ├── PassageNode.tsx      ✅ Created
    ├── ThemeNode.tsx        ✅ Created
    ├── PersonNode.tsx       ✅ Created
    └── BookNode.tsx         ✅ Created
```

All three supporting components are now ready to use! 🎉
