# Bible Study Knowledge Graph - Quick Start Guide

## 📚 What You're Building

A powerful knowledge graph system that transforms Bible study notes into an **interactive, visual network** showing connections between:

- 📖 Bible passages
- 📝 Personal insights and notes  
- 🏷️ Theological themes
- 👤 Biblical people
- 📍 Places

**Example:** When you create a note about "God's love" in 1 John 4:8, the system automatically:

1. Creates a note node in the graph
2. Links it to the "1 John 4" passage node
3. Connects it to the "Love" theme node
4. Shows relationships to other notes about love
5. Visualizes how this insight connects to your entire study

## 🎯 Best Implementation Approach

### Recommended Tech Stack

- **Database:** PostgreSQL (via Supabase) - you already have it!
- **Graph Library:** React Flow - modern, performant, React-native
- **Note Editor:** TipTap - rich text with great extensibility
- **State Management:** Zustand or React Query for caching

### Why This Approach?

✅ **No new infrastructure** - works with existing Supabase setup
✅ **Scales well** - can handle thousands of notes/connections
✅ **Easy to start** - can build MVP in 2-3 weeks
✅ **Future-proof** - can migrate to Neo4j later if needed
✅ **Great UX** - React Flow provides beautiful, smooth interactions

## 🚀 Implementation Timeline

### Week 1: Foundation (Backend)

**Days 1-3: Database Setup**

- Run SQL migrations for notes, graph_nodes, graph_edges tables
- Add indexes for performance
- Populate system themes
- Test with sample data

**Days 4-7: API Development**

- Build `/api/notes` endpoints (CRUD)
- Build `/api/graph/nodes` and `/api/graph/edges`
- Implement auto-linking logic
- Test with Postman

**Deliverable:** Working backend that creates graph structure from notes

### Week 2: Visualization

**Days 8-10: Setup**

- Install dependencies (React Flow, TipTap, etc.)
- Set up component structure
- Create custom node components

**Days 11-14: Graph Component**

- Build main KnowledgeGraph component
- Implement filtering and search
- Add graph controls
- Create node details panel

**Deliverable:** Working graph visualization that displays data

### Week 3: Note Editor
**Days 15-18: Editor**
- Build rich text note editor with TipTap
- Add Bible reference auto-detection
- Implement tagging system
- Connect to API

**Days 19-21: Integration**
- Connect note creation to graph updates
- Test full workflow
- Add loading states and error handling

**Deliverable:** Complete note-taking → graph pipeline

### Week 4: Polish & Advanced Features
**Days 22-24: Path Finding**
- Implement shortest path algorithm
- Add "Find Connection" feature
- Show connection strength indicators

**Days 25-28: Final Polish**
- Mobile responsiveness
- Keyboard shortcuts
- Tutorial tooltips
- Performance optimization

**Deliverable:** Production-ready feature

## 📁 File Structure

```
src/
├── app/
│   ├── study/
│   │   └── [planId]/
│   │       ├── page.tsx                    # Study plan overview
│   │       └── graph/
│   │           └── page.tsx                # Knowledge graph page
│   │
│   └── api/
│       ├── notes/
│       │   └── route.ts                    # Note CRUD
│       ├── graph/
│       │   ├── nodes/route.ts              # Graph data
│       │   └── analyze/route.ts            # Path finding, etc.
│       └── themes/
│           └── route.ts                    # Theme management
│
├── components/
│   ├── graph/
│   │   ├── KnowledgeGraph.tsx              # Main graph component
│   │   ├── GraphControls.tsx               # Filter/search controls
│   │   ├── GraphStats.tsx                  # Statistics display
│   │   ├── NodeDetailsPanel.tsx            # Selected node info
│   │   └── nodes/
│   │       ├── NoteNode.tsx                # Note visualization
│   │       ├── PassageNode.tsx             # Bible passage
│   │       ├── ThemeNode.tsx               # Theme
│   │       ├── PersonNode.tsx              # Person
│   │       └── BookNode.tsx                # Bible book
│   │
│   └── notes/
│       ├── NoteEditor.tsx                  # Rich text editor
│       ├── NoteSidebar.tsx                 # Notes list
│       └── BibleReferenceSelector.tsx      # Reference picker
│
├── lib/
│   ├── supabase.ts                         # Supabase client
│   └── utils/
│       ├── bibleReferences.ts              # Reference parsing
│       ├── graphAlgorithms.ts              # Path finding, etc.
│       └── noteProcessing.ts               # Auto-linking logic
│
└── data/
    └── first-study-plan-data.ts            # 1 John template
```

## 💡 Key Implementation Details

### 1. Note Creation Flow

```typescript
async function createNoteWithGraph(noteData: NoteInput) {
  // 1. Create note
  const note = await createNote(noteData);
  
  // 2. Create graph node for note
  const noteNode = await createGraphNode({
    type: 'note',
    referenceId: note.id,
    label: noteData.title,
  });
  
  // 3. Process Bible references
  for (const ref of noteData.references) {
    const passageNode = await findOrCreatePassageNode(ref);
    await createEdge(noteNode.id, passageNode.id, 'references');
  }
  
  // 4. Process tags/themes
  for (const tag of noteData.tags) {
    const themeNode = await findOrCreateThemeNode(tag);
    await createEdge(noteNode.id, themeNode.id, 'theme_connection');
  }
  
  return note;
}
```

### 2. Graph Visualization Setup
```typescript
// Example usage in a page
export default function StudyGraphPage() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  
  useEffect(() => {
    loadGraphData();
  }, []);
  
  async function loadGraphData() {
    const response = await fetch('/api/graph/nodes?userId=xxx');
    const { nodes, edges } = await response.json();
    
    // Transform for React Flow
    setNodes(nodes.map(n => ({
      id: n.id,
      type: n.node_type,
      data: n.metadata,
      position: calculatePosition(n),
    })));
    
    setEdges(edges.map(e => ({
      id: e.id,
      source: e.source_node_id,
      target: e.target_node_id,
      type: e.edge_type,
    })));
  }
  
  return (
    <KnowledgeGraph 
      initialNodes={nodes}
      initialEdges={edges}
    />
  );
}
```

### 3. Bible Reference Auto-Detection
```typescript
function detectBibleReferences(text: string): string[] {
  const patterns = [
    // Book Chapter:Verse (e.g., "John 3:16")
    /\b(?:1|2|3)?\s*[A-Z][a-z]+\s+\d+:\d+(?:-\d+)?\b/g,
  ];
  
  const matches: string[] = [];
  patterns.forEach(pattern => {
    const found = text.match(pattern);
    if (found) matches.push(...found);
  });
  
  return Array.from(new Set(matches)); // Remove duplicates
}

// Usage in editor
editor.on('update', () => {
  const content = editor.getText();
  const refs = detectBibleReferences(content);
  setDetectedReferences(refs);
});
```

## 🎨 First Study Plan Integration

The **1 John** study (first in your 38-week plan) comes pre-configured with:

**Pre-populated Nodes:**
- Book: "1 John"
- Chapters: 1 John 1-5
- Themes: Love, Light, Fellowship, Sin, Eternal Life
- People: John, Jesus Christ

**Example User Journey:**
1. User starts "1 John" study
2. Opens graph view - sees pre-populated structure
3. Creates note: "God is light - 1 John 1:5"
4. System auto-detects reference to 1 John 1:5
5. Note appears in graph, connected to:
   - 1 John 1 passage
   - "Light" theme
   - Book of 1 John
6. User can now:
   - See all notes about "light"
   - Find connections between love and light themes
   - Track study progression visually

## 📊 Database Schema Quick Reference

### Core Tables
```sql
notes
  ├── id (UUID)
  ├── user_id (UUID)
  ├── title (TEXT)
  ├── content (TEXT - HTML)
  ├── content_plain (TEXT - for search)
  ├── bible_references (TEXT[] - array)
  └── tags (TEXT[] - array)

graph_nodes
  ├── id (UUID)
  ├── user_id (UUID)
  ├── node_type (ENUM: note, passage, theme, person, place, book)
  ├── reference_id (UUID - links to notes.id if type='note')
  ├── label (TEXT - display name)
  └── metadata (JSONB - flexible attributes)

graph_edges
  ├── id (UUID)
  ├── user_id (UUID)
  ├── source_node_id (UUID)
  ├── target_node_id (UUID)
  ├── edge_type (ENUM: references, relates_to, theme_connection, etc.)
  └── weight (FLOAT - connection strength)

themes
  ├── id (UUID)
  ├── name (TEXT)
  ├── color (TEXT - hex)
  └── is_system (BOOLEAN)
```

## 🔧 Quick Commands

### Install Dependencies
```bash
npm install reactflow@11.10.0 @tiptap/react @tiptap/starter-kit
npm install lucide-react dagre fuse.js
```

### Run Database Migrations
```sql
-- In Supabase SQL Editor
-- Copy from KNOWLEDGE_GRAPH_IMPLEMENTATION.md
-- Section: "Database Schema Extensions"
```

### Start Development
```bash
npm run dev
# Navigate to /study/1/graph
```

### Test API
```bash
# Create a note
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "title": "Test Note",
    "content": "Testing 1 John 3:16",
    "tags": ["love"],
    "references": ["1 John 3:16"]
  }'

# Fetch graph data
curl http://localhost:3000/api/graph/nodes?userId=user-123
```

## 📖 Document Guide

1. **KNOWLEDGE_GRAPH_IMPLEMENTATION.md**
   - Complete technical specification
   - Database schema
   - API routes
   - Component structure

2. **first-study-plan-data.ts**
   - Example data for 1 John
   - Pre-configured nodes and edges
   - Sample user notes

3. **components/** (Various .tsx files)
   - Ready-to-use React components
   - Custom node renderers
   - Graph controls and stats

4. **api-routes.ts**
   - Complete API implementation
   - Auto-linking logic
   - Graph algorithms

5. **INTEGRATION_GUIDE.md**
   - Week-by-week implementation plan
   - Testing checklist
   - Performance optimization

6. **BEST_PRACTICES.md**
   - Architecture diagrams
   - Security recommendations
   - Common pitfalls to avoid
   - Future enhancements

## 🎓 Next Steps

1. **Read KNOWLEDGE_GRAPH_IMPLEMENTATION.md** for full technical details
2. **Review first-study-plan-data.ts** to understand data structure
3. **Follow INTEGRATION_GUIDE.md** week-by-week plan
4. **Reference BEST_PRACTICES.md** during development

## 🤝 Support

If you need help:

1. Check existing documentation
2. Review code examples
3. Test with sample data from first-study-plan-data.ts
4. Iterate and refine based on user feedback

## 🎉 Success Criteria

You'll know it's working when:

- [ ] User creates note with Bible reference
- [ ] Note appears automatically in graph
- [ ] Clicking note in graph opens editor
- [ ] Filtering by theme shows related notes
- [ ] Graph is smooth and responsive
- [ ] Mobile experience is good

**Remember:** Start simple! Build the MVP first, then add advanced features based on user feedback.

Good luck building an amazing Bible study tool! 🚀📖
