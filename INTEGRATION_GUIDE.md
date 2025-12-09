# Complete Integration Example: Knowledge Graph for 1 John Study

## Page Integration Example

### app/study/[planId]/graph/page.tsx
```typescript
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { KnowledgeGraph } from '@/components/graph/KnowledgeGraph';
import { NoteEditor } from '@/components/notes/NoteEditor';
import { 
  initialGraphNodes, 
  initialGraphEdges,
  notesGraphNodes,
  notesGraphEdges 
} from '@/data/first-study-plan-data';

export default function StudyGraphPage() {
  const params = useParams();
  const planId = params.planId as string;
  
  const [nodes, setNodes] = useState(initialGraphNodes);
  const [edges, setEdges] = useState(initialGraphEdges);
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);

  // Load user's graph data
  useEffect(() => {
    loadGraphData();
  }, [planId]);

  const loadGraphData = async () => {
    const response = await fetch(`/api/graph/nodes?userId=user123&planId=${planId}`);
    const data = await response.json();
    
    // Merge with initial template
    setNodes([...initialGraphNodes, ...data.nodes]);
    setEdges([...initialGraphEdges, ...data.edges]);
  };

  const handleSaveNote = async (noteData) => {
    const response = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'user123', // Replace with actual user ID
        ...noteData,
      }),
    });

    const { note, graphNode } = await response.json();
    
    // Reload graph to show new note
    loadGraphData();
    setShowNoteEditor(false);
  };

  const handleNodeDoubleClick = (node) => {
    if (node.type === 'note') {
      // Open note for editing
      setSelectedNode(node);
      setShowNoteEditor(true);
    } else if (node.type === 'passage') {
      // Navigate to passage reading
      window.location.href = `/study/${planId}/read?passage=${node.data.label}`;
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Study Graph</h1>
          <p className="text-sm text-gray-600">
            Visualize connections in your Bible study
          </p>
        </div>
        <button
          onClick={() => setShowNoteEditor(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          + New Note
        </button>
      </header>

      {/* Graph Visualization */}
      <div className="flex-1">
        <KnowledgeGraph
          initialNodes={nodes}
          initialEdges={edges}
          onNodeDoubleClick={handleNodeDoubleClick}
          studyPlanId={planId}
        />
      </div>

      {/* Note Editor Modal */}
      {showNoteEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl">
            <NoteEditor
              onSave={handleSaveNote}
              onCancel={() => setShowNoteEditor(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
```

## Step-by-Step Implementation Guide

### Week 1: Database & Backend Setup

#### Day 1-2: Database Schema
```sql
-- Run these migrations in Supabase SQL Editor

-- 1. Create notes table
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  content_plain TEXT NOT NULL,
  bible_references TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_archived BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_bible_refs ON notes USING GIN(bible_references);
CREATE INDEX idx_notes_tags ON notes USING GIN(tags);

-- 2. Create graph tables
CREATE TYPE node_type AS ENUM ('passage', 'note', 'theme', 'person', 'place', 'book');
CREATE TYPE edge_type AS ENUM ('references', 'relates_to', 'mentions', 'theme_connection', 'cross_reference');

CREATE TABLE graph_nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  node_type node_type NOT NULL,
  reference_id UUID,
  label TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, node_type, label)
);

CREATE TABLE graph_edges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  source_node_id UUID REFERENCES graph_nodes(id) ON DELETE CASCADE,
  target_node_id UUID REFERENCES graph_nodes(id) ON DELETE CASCADE,
  edge_type edge_type NOT NULL,
  weight FLOAT DEFAULT 1.0,
  created_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  UNIQUE(source_node_id, target_node_id, edge_type)
);

-- 3. Create themes table
CREATE TABLE themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  is_system BOOLEAN DEFAULT FALSE,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(name, user_id)
);

-- Insert system themes
INSERT INTO themes (name, description, color, is_system) VALUES
  ('Love', 'Divine and brotherly love', '#FF8C94', TRUE),
  ('Faith', 'Trust in God', '#4ECDC4', TRUE),
  ('Grace', 'Unmerited favor', '#95E1D3', TRUE),
  ('Prayer', 'Communication with God', '#A8E6CF', TRUE),
  ('Salvation', 'God''s redemptive work', '#FF6B6B', TRUE);
```

#### Day 3-4: API Routes
1. Copy the API routes from `api-routes.ts`
2. Test endpoints with Postman/Thunder Client:
   - POST /api/notes - Create note
   - GET /api/notes?userId=xxx - Fetch notes
   - GET /api/graph/nodes?userId=xxx - Get graph data

#### Day 5-7: Initial Data Population
```typescript
// scripts/populate-first-study.ts
import { createClient } from '@supabase/supabase-js';

async function populateFirstStudy(userId: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1. Create book node
  const { data: bookNode } = await supabase
    .from('graph_nodes')
    .insert({
      user_id: userId,
      node_type: 'book',
      label: '1 John',
      description: 'Letter of love and fellowship',
      metadata: {
        author: 'John the Apostle',
        date: '90-95 AD'
      }
    })
    .select()
    .single();

  // 2. Create chapter nodes
  for (let i = 1; i <= 5; i++) {
    await supabase.from('graph_nodes').insert({
      user_id: userId,
      node_type: 'passage',
      label: `1 John ${i}`,
      metadata: { reference: `1 John ${i}` }
    });
  }

  // 3. Create theme nodes from system themes
  const { data: themes } = await supabase
    .from('themes')
    .select('*')
    .eq('is_system', true);

  for (const theme of themes || []) {
    await supabase.from('graph_nodes').insert({
      user_id: userId,
      node_type: 'theme',
      label: theme.name,
      metadata: { color: theme.color, themeId: theme.id }
    });
  }

  console.log('First study populated!');
}
```

### Week 2: Frontend Components

#### Day 8-10: Install Dependencies
```bash
npm install reactflow@11.10.0
npm install @tiptap/react @tiptap/starter-kit
npm install react-markdown remark-gfm
npm install lucide-react
npm install dagre
```

#### Day 11-12: Build Custom Nodes
1. Copy code from `CustomNodes.tsx`
2. Create each node component in `components/graph/nodes/`
3. Test rendering with sample data

#### Day 13-14: Build Main Graph Component
1. Copy `KnowledgeGraph.tsx`
2. Implement graph controls
3. Test with first study data

### Week 3: Note Editor & Integration

#### Day 15-17: Note Editor
1. Copy `NoteEditor.tsx`
2. Implement rich text editing
3. Add Bible reference detection
4. Test save/update functionality

#### Day 18-19: Graph Integration
1. Connect note creation to graph updates
2. Implement auto-linking logic
3. Test edge creation

#### Day 20-21: Polish & Testing
1. Fix bugs
2. Improve styling
3. Test full workflow

### Week 4: Advanced Features

#### Day 22-23: Path Finding
```typescript
// utils/graphAlgorithms.ts
export function findShortestPath(
  nodes: Node[],
  edges: Edge[],
  startId: string,
  endId: string
): string[] {
  // Build adjacency list
  const graph = new Map<string, string[]>();
  edges.forEach(edge => {
    if (!graph.has(edge.source)) graph.set(edge.source, []);
    graph.get(edge.source)!.push(edge.target);
  });

  // BFS
  const queue: string[][] = [[startId]];
  const visited = new Set([startId]);

  while (queue.length > 0) {
    const path = queue.shift()!;
    const current = path[path.length - 1];

    if (current === endId) return path;

    for (const neighbor of graph.get(current) || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([...path, neighbor]);
      }
    }
  }

  return [];
}
```

#### Day 24-25: Theme Clustering
```typescript
export function clusterByTheme(nodes: Node[], edges: Edge[], themeId: string) {
  // Find all nodes connected to theme
  const connected = new Set<string>();
  
  edges.forEach(edge => {
    if (edge.target === themeId) {
      connected.add(edge.source);
    }
  });

  return nodes.filter(node => connected.has(node.id));
}
```

#### Day 26-28: UI Polish
- Add animations
- Improve mobile responsiveness
- Add keyboard shortcuts
- Implement search

## Testing Checklist

### Backend Tests
- [ ] Create note via API
- [ ] Note creates graph node
- [ ] Bible references create passage nodes
- [ ] Tags create theme connections
- [ ] Update note updates graph
- [ ] Delete note removes graph nodes

### Frontend Tests
- [ ] Graph renders correctly
- [ ] Nodes are clickable
- [ ] Filters work
- [ ] Search works
- [ ] Note editor opens
- [ ] Rich text formatting works
- [ ] Bible reference detection works
- [ ] Tags can be added/removed
- [ ] Note saves and updates graph

### Integration Tests
- [ ] Create note from 1 John reading
- [ ] Note appears in graph
- [ ] Click note in graph opens editor
- [ ] Edit note updates graph
- [ ] Filter by theme shows related notes
- [ ] Search finds notes by content

## Performance Optimization

### Database Queries
```typescript
// Use this for efficient graph loading
export async function loadGraphWithRelations(userId: string, planId: string) {
  // Single query with joins
  const { data } = await supabase
    .from('graph_nodes')
    .select(`
      *,
      source_edges:graph_edges!source_node_id(*),
      target_edges:graph_edges!target_node_id(*)
    `)
    .eq('user_id', userId);

  return data;
}
```

### Frontend Caching
```typescript
// Use React Query for caching
import { useQuery } from '@tanstack/react-query';

export function useGraphData(userId: string, planId: string) {
  return useQuery({
    queryKey: ['graph', userId, planId],
    queryFn: () => fetchGraphData(userId, planId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

## Deployment Checklist

- [ ] Environment variables set
- [ ] Database migrations run
- [ ] System themes populated
- [ ] First study template created
- [ ] API routes tested
- [ ] Frontend components built
- [ ] Graph renders on production
- [ ] Mobile responsive
- [ ] Performance acceptable (<3s load)
