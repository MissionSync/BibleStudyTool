# Bible Study Knowledge Graph Implementation Plan

## Overview

This plan extends your Bible study app with advanced note-taking and knowledge graph visualization to help users discover connections between passages, themes, and insights.

## Architecture Decision

### Best Approach: Hybrid Graph System

**Recommended Solution:**

- **PostgreSQL** for core data storage (already using Supabase)
- **Neo4j-style graph relations** modeled in PostgreSQL
- **React Flow** for frontend visualization (modern, performant, React-native)
- **Graph algorithms** in application layer

**Why this approach:**

- ✅ No additional database infrastructure needed
- ✅ Leverages existing Supabase setup
- ✅ PostgreSQL has excellent JSON support for flexible node attributes
- ✅ Can scale to Neo4j later if needed without frontend changes
- ✅ React Flow provides beautiful, interactive graphs

## Key Features

### 1. Smart Note-Taking

- **Rich text editor** with markdown support
- **Verse linking** - automatically detect Bible references
- **Tagging system** - themes, topics, people, places
- **Cross-references** - link notes to other notes
- **Auto-suggestions** - AI-powered theme detection

### 2. Knowledge Graph Visualization

- **Interactive graph** - zoom, pan, filter nodes
- **Node types:**
  - 📖 Passages (Bible references)
  - 📝 Notes (user insights)
  - 🏷️ Themes (salvation, faith, love, etc.)
  - 👤 People (Jesus, Paul, disciples)
  - 📍 Places (Jerusalem, Ephesus, etc.)
  - 📚 Books (John, Romans, etc.)

- **Edge types:**
  - References (note → passage)
  - Relates to (passage → passage)
  - Mentions (note → person/place)
  - Theme connection (note → theme)
  - Cross-reference (note → note)

### 3. Discovery Features

- **Path finding** - show connections between any two nodes
- **Theme clustering** - group related notes by theme
- **Timeline view** - chronological study progression
- **Strength indicators** - frequently connected concepts
- **Suggested connections** - AI-recommended links

## Technical Stack

### New Dependencies

```json
{
  "reactflow": "^11.10.0",
  "react-markdown": "^9.0.0",
  "remark-gfm": "^4.0.0",
  "tiptap": "^2.1.0", // Rich text editor
  "@tiptap/react": "^2.1.0",
  "@tiptap/starter-kit": "^2.1.0",
  "dagre": "^0.8.5", // Graph layout algorithm
  "fuse.js": "^7.0.0" // Fuzzy search
}
```

## Database Schema Extensions

### New Tables

#### notes (Enhanced)

```sql
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL, -- Rich text/markdown
  content_plain TEXT NOT NULL, -- For search
  bible_references TEXT[] DEFAULT '{}', -- Array of references
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_archived BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_bible_refs ON notes USING GIN(bible_references);
CREATE INDEX idx_notes_tags ON notes USING GIN(tags);
CREATE INDEX idx_notes_content_search ON notes USING GIN(to_tsvector('english', content_plain));
```

#### graph_nodes

```sql
CREATE TYPE node_type AS ENUM (
  'passage',
  'note', 
  'theme',
  'person',
  'place',
  'book'
);

CREATE TABLE graph_nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  node_type node_type NOT NULL,
  reference_id UUID, -- Links to notes.id if node_type='note'
  label TEXT NOT NULL, -- Display name
  description TEXT,
  metadata JSONB DEFAULT '{}', -- Flexible attributes
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, node_type, label)
);

CREATE INDEX idx_nodes_user_type ON graph_nodes(user_id, node_type);
CREATE INDEX idx_nodes_ref ON graph_nodes(reference_id);
```

#### graph_edges

```sql
CREATE TYPE edge_type AS ENUM (
  'references',
  'relates_to',
  'mentions',
  'theme_connection',
  'cross_reference',
  'parallel_passage'
);

CREATE TABLE graph_edges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  source_node_id UUID REFERENCES graph_nodes(id) ON DELETE CASCADE,
  target_node_id UUID REFERENCES graph_nodes(id) ON DELETE CASCADE,
  edge_type edge_type NOT NULL,
  weight FLOAT DEFAULT 1.0, -- Connection strength
  created_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  
  UNIQUE(source_node_id, target_node_id, edge_type)
);

CREATE INDEX idx_edges_source ON graph_edges(source_node_id);
CREATE INDEX idx_edges_target ON graph_edges(target_node_id);
CREATE INDEX idx_edges_user ON graph_edges(user_id);
```

#### themes (Predefined themes + user custom)

```sql
CREATE TABLE themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT, -- Hex color for visualization
  is_system BOOLEAN DEFAULT FALSE, -- System vs user-created
  user_id UUID REFERENCES users(id), -- NULL for system themes
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(name, user_id)
);

-- Insert common biblical themes
INSERT INTO themes (name, description, color, is_system) VALUES
  ('Salvation', 'God''s redemptive work', '#FF6B6B', TRUE),
  ('Faith', 'Trust and belief in God', '#4ECDC4', TRUE),
  ('Love', 'Divine and brotherly love', '#FF8C94', TRUE),
  ('Prayer', 'Communication with God', '#A8E6CF', TRUE),
  ('Holy Spirit', 'Work and presence of the Spirit', '#FFD93D', TRUE),
  ('Grace', 'Unmerited favor of God', '#95E1D3', TRUE),
  ('Obedience', 'Following God''s commands', '#F38181', TRUE),
  ('Prophecy', 'Foretelling and forth-telling', '#AA96DA', TRUE),
  ('Kingdom of God', 'God''s reign and rule', '#6BCF7F', TRUE),
  ('Discipleship', 'Following Jesus', '#FF9A76', TRUE);
```

## API Routes Structure

### `/api/notes`

- GET: Fetch user notes with filtering
- POST: Create new note with auto-linking
- PUT: Update note and rebuild connections
- DELETE: Remove note and graph nodes

### `/api/graph/nodes`

- GET: Fetch graph nodes for visualization
- POST: Create custom node (theme, person, place)
- PUT: Update node properties
- DELETE: Remove node

### `/api/graph/edges`

- GET: Fetch connections between nodes
- POST: Create manual connection
- DELETE: Remove connection

### `/api/graph/analyze`

- POST: Find paths between nodes
- POST: Cluster by theme
- POST: Suggest connections
- GET: Graph statistics

## Frontend Components Structure

### `/components/notes/`

#### `NoteEditor.tsx`

- Rich text editing with TipTap
- Bible reference detection
- Tag input with autocomplete
- Save/update/delete actions

#### `NoteSidebar.tsx`

- List of all notes
- Search and filter
- Tag filtering
- Sort by date/relevance

#### `BibleReferenceSelector.tsx`

- Searchable Bible book/chapter/verse
- Visual passage selector
- Quick access to common references

### `/components/graph/`

#### `KnowledgeGraph.tsx`

- Main React Flow canvas
- Custom node renderers
- Edge styling by type
- Zoom/pan controls
- Mini-map

#### `GraphControls.tsx`

- Layout algorithm selector (force, hierarchical, radial)
- Filter by node type
- Search nodes
- Toggle physics simulation

#### `NodeDetailsPanel.tsx`

- Selected node information
- Quick edit capabilities
- Related nodes list
- Navigation shortcuts

#### `GraphStats.tsx`

- Total nodes/edges count
- Most connected themes
- Study coverage visualization
- Timeline view

### `/app/study/[planId]/graph`

- Knowledge graph page for specific reading plan
- Integration with notes and progress
- Plan-specific graph filtering

## Implementation Phases

### Phase 1: Enhanced Note-Taking (Week 1-2)

1. Install dependencies (TipTap, React Markdown)
2. Create database schema extensions
3. Build NoteEditor component with rich text
4. Implement Bible reference detection
5. Add tagging system
6. Create notes API routes

### Phase 2: Graph Data Structure (Week 2-3)

1. Implement graph_nodes and graph_edges tables
2. Create auto-linking logic for notes
3. Build graph creation from notes
4. Implement themes system
5. Add API routes for graph operations

### Phase 3: Graph Visualization (Week 3-4)

1. Install React Flow
2. Build KnowledgeGraph component
3. Create custom node components
4. Implement edge styling
5. Add graph controls and filters
6. Build node details panel

### Phase 4: Discovery Features (Week 4-5)

1. Implement path finding algorithm
2. Build theme clustering
3. Create suggestion engine
4. Add graph statistics
5. Build timeline view
6. Polish UI/UX

## Example: First Study Plan Integration

For "1 John" (first reading):

### Auto-Generated Nodes

- **Book Node**: "1 John"
- **Theme Nodes**: "Love", "Fellowship", "Truth", "Sin", "Eternal Life"
- **Person Nodes**: "John", "Jesus Christ", "Antichrist"

### User Note Creates

1. Note: "God is light - 1 John 1:5"
   - Links to: 1 John 1:5 (passage)
   - Tagged: "Nature of God", "Light", "Truth"
   - Auto-connects to theme: "Truth"

2. Note: "Walking in fellowship - 1:7"
   - Links to: 1 John 1:7
   - Tagged: "Fellowship", "Community"
   - Cross-references previous note
   - Connects to theme: "Fellowship"

### Graph Visualization

```md
[1 John] ─────references────→ [God is light]
    │                              │
    └──────chapter───→ [1:5]      │
                         │          │
                    quotes          │
                         │          │
                         └──────────┘
                         
[God is light] ──theme──→ [Truth]
       │
       └───cross-ref───→ [Walking in fellowship]
                              │
                         theme
                              ↓
                         [Fellowship]
```

## Performance Optimization

### Caching Strategy

- Cache frequently accessed graph data
- Incremental updates on note changes
- Lazy load graph nodes (paginated)
- Debounce search and filters

### Query Optimization

- Use materialized views for complex queries
- Index all foreign keys
- Batch graph operations
- Use connection pooling

### Frontend Optimization

- Virtualize large graphs (render visible nodes only)
- Use React Flow's built-in optimizations
- Memoize expensive calculations
- Lazy load node details

## Mobile Considerations

### Responsive Graph View

- Simplified graph on mobile
- Touch gestures for zoom/pan
- Bottom sheet for node details
- Swipeable node cards

### Progressive Enhancement

- List view fallback
- Text-based connections
- Simple tagging interface

## Future Enhancements

1. **AI Integration**
   - GPT-4 for theme extraction
   - Automatic cross-referencing
   - Study question generation
   - Personalized insights

2. **Collaborative Features**
   - Share graph views
   - Group study graphs
   - Comment on connections
   - Merge community insights

3. **Advanced Visualizations**
   - 3D graph view
   - Timeline animation
   - Heat maps for study focus
   - Parallel coordinates for themes

4. **Export Capabilities**
   - Export as PDF
   - Graph images
   - Study notes document
   - JSON data export

## Success Metrics

- Average notes per user per week
- Graph connections created
- Time spent in graph view
- Feature usage analytics
- User feedback on discovery features
