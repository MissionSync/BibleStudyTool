# Knowledge Graph Architecture & Best Practices

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Interface Layer                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐ │
│  │  Study Dashboard │  │  Knowledge Graph │  │  Note Editor  │ │
│  │                  │  │   Visualization  │  │               │ │
│  │  - Progress      │  │  - React Flow    │  │  - TipTap     │ │
│  │  - Reading Plan  │  │  - Custom Nodes  │  │  - Auto-link  │ │
│  │  - Quick Notes   │  │  - Filters       │  │  - Tags       │ │
│  └──────────────────┘  └──────────────────┘  └───────────────┘ │
│                                                                   │
└───────────────────────────┬───────────────────────────────────┬─┘
                            │                                   │
┌───────────────────────────▼───────────────────────────────────▼─┐
│                      Application Layer                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Note API    │  │  Graph API   │  │  Analysis API        │  │
│  │              │  │              │  │                      │  │
│  │  - CRUD      │  │  - Nodes     │  │  - Path Finding      │  │
│  │  - Auto-link │  │  - Edges     │  │  - Clustering        │  │
│  │  - Search    │  │  - Relations │  │  - Statistics        │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│                                                                   │
└───────────────────────────┬───────────────────────────────────┬─┘
                            │                                   │
┌───────────────────────────▼───────────────────────────────────▼─┐
│                       Data Layer (Supabase)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌───────────┐ │
│  │   Notes    │  │Graph Nodes │  │Graph Edges │  │  Themes   │ │
│  │            │  │            │  │            │  │           │ │
│  │  - title   │  │  - type    │  │  - source  │  │  - name   │ │
│  │  - content │  │  - label   │  │  - target  │  │  - color  │ │
│  │  - tags[]  │  │  - data    │  │  - type    │  │  - system │ │
│  │  - refs[]  │  │  - ref_id  │  │  - weight  │  │           │ │
│  └────────────┘  └────────────┘  └────────────┘  └───────────┘ │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow: Creating a Note

```
User Creates Note
       │
       ▼
┌──────────────────────────────────────────────────────┐
│ 1. NoteEditor Component                              │
│    - User types content                              │
│    - Bible references auto-detected                  │
│    - Tags added                                      │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│ 2. POST /api/notes                                   │
│    - Validate input                                  │
│    - Create note record                              │
│    - Extract plain text                              │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│ 3. Auto-Linking Logic                                │
│    a. Create graph_node for note                     │
│    b. For each Bible reference:                      │
│       - Find or create passage node                  │
│       - Create edge: note → passage                  │
│    c. For each tag:                                  │
│       - Find or create theme node                    │
│       - Create edge: note → theme                    │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│ 4. Graph Updates                                     │
│    - New nodes appear in visualization               │
│    - Edges connect note to related content           │
│    - User sees connections immediately               │
└──────────────────────────────────────────────────────┘
```

## Best Practices & Recommendations

### 1. Start Simple, Scale Gradually

**Phase 1 (Weeks 1-2):** Basic note-taking
- Text editor with markdown
- Manual Bible reference linking
- Simple tag system
- No graph visualization yet

**Phase 2 (Weeks 3-4):** Add graph structure
- Create graph nodes/edges in database
- Build connections behind the scenes
- Don't show graph to users yet

**Phase 3 (Weeks 5-6):** Introduce visualization
- Add React Flow
- Show basic graph with filtering
- Let users explore connections

**Phase 4 (Weeks 7+):** Advanced features
- Path finding
- Theme clustering
- AI suggestions
- Timeline view

### 2. Optimize for Performance

**Database Indexes**
```sql
-- Essential indexes
CREATE INDEX idx_notes_user_tags ON notes USING GIN(tags);
CREATE INDEX idx_notes_bible_refs ON notes USING GIN(bible_references);
CREATE INDEX idx_graph_nodes_user_type ON graph_nodes(user_id, node_type);
CREATE INDEX idx_graph_edges_source ON graph_edges(source_node_id);
CREATE INDEX idx_graph_edges_target ON graph_edges(target_node_id);

-- For full-text search
CREATE INDEX idx_notes_content_fts ON notes 
  USING GIN(to_tsvector('english', content_plain));
```

**Caching Strategy**
```typescript
// Use SWR or React Query for data fetching
import useSWR from 'swr';

export function useGraphData(userId: string) {
  const { data, error, mutate } = useSWR(
    `/api/graph/nodes?userId=${userId}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  );

  return { data, error, reload: mutate };
}
```

**Lazy Loading**
```typescript
// Only load visible nodes in viewport
export function useVisibleNodes(allNodes: Node[], viewport: Viewport) {
  return useMemo(() => {
    return allNodes.filter(node => {
      return isInViewport(node.position, viewport);
    });
  }, [allNodes, viewport]);
}
```

### 3. User Experience Guidelines

**Progressive Disclosure**
- Start with empty graph (less overwhelming)
- Add tutorial tooltips
- Provide pre-made templates
- Show examples from sample data

**Visual Design**
- Use consistent colors for node types
- Make edges subtle (don't overwhelm)
- Highlight on hover/select
- Use minimap for orientation

**Mobile Optimization**
- Simplified graph view on mobile
- Touch-friendly controls
- Bottom sheet for details
- List view fallback

### 4. Bible Reference Handling

**Normalization**
```typescript
export function normalizeReference(ref: string): string {
  // Standardize format
  // "1 john 3:16" → "1 John 3:16"
  // "john 3.16" → "John 3:16"
  
  return ref
    .split(' ')
    .map((word, i) => {
      if (i === 0 && /^\d/.test(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ')
    .replace('.', ':');
}
```

**Book Abbreviations**
```typescript
const BOOK_ABBREVIATIONS: Record<string, string> = {
  'jn': 'John',
  '1jn': '1 John',
  'gen': 'Genesis',
  'matt': 'Matthew',
  'rom': 'Romans',
  // ... etc
};
```

### 5. Security Considerations

**Row Level Security (RLS)**
```sql
-- Enable RLS on all tables
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE graph_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE graph_edges ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own notes"
  ON notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes"
  ON notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

**Input Sanitization**
```typescript
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeContent(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'blockquote'],
    ALLOWED_ATTR: []
  });
}
```

### 6. Testing Strategy

**Unit Tests**
```typescript
// utils/bibleReferences.test.ts
describe('Bible Reference Detection', () => {
  test('detects single reference', () => {
    const text = "According to John 3:16...";
    const refs = detectBibleReferences(text);
    expect(refs).toContain('John 3:16');
  });

  test('detects multiple references', () => {
    const text = "Compare Romans 5:8 with 1 John 4:10";
    const refs = detectBibleReferences(text);
    expect(refs).toHaveLength(2);
  });
});
```

**Integration Tests**
```typescript
describe('Note to Graph Pipeline', () => {
  test('creates graph nodes when note is saved', async () => {
    const note = await createNote({
      title: 'Test',
      content: 'From John 3:16',
      tags: ['salvation']
    });

    const nodes = await getGraphNodes();
    expect(nodes).toContainEqual(
      expect.objectContaining({ type: 'note', reference_id: note.id })
    );
  });
});
```

### 7. Accessibility

**Keyboard Navigation**
```typescript
// Enable keyboard shortcuts in graph
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'f' && e.metaKey) {
      // Cmd+F: Focus search
      searchInputRef.current?.focus();
    } else if (e.key === 'n' && e.metaKey) {
      // Cmd+N: New note
      setShowNoteEditor(true);
    }
  };

  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);
```

**ARIA Labels**
```tsx
<button
  aria-label="Create new note"
  aria-describedby="new-note-description"
>
  <Plus className="w-4 h-4" />
</button>
```

## Common Pitfalls to Avoid

### ❌ Don't:
1. **Create too many nodes initially** - Start with book/chapter level, not verse level
2. **Show full graph at once** - It's overwhelming; use filters
3. **Make edges bidirectional by default** - Be intentional about direction
4. **Forget to clean up deleted nodes** - Use CASCADE in foreign keys
5. **Store verse text in database** - Use external Bible API
6. **Make graph read-only** - Allow users to create custom connections
7. **Ignore mobile users** - 40%+ will use mobile

### ✅ Do:
1. **Start with templates** - Pre-populate common structures
2. **Use progressive disclosure** - Show complexity gradually
3. **Implement good search** - Users need to find things quickly
4. **Cache aggressively** - Graph data doesn't change often
5. **Provide tutorials** - Knowledge graphs are new to many users
6. **Allow export** - Users want to share their insights
7. **Add undo/redo** - Make experimentation safe

## Future Enhancements Roadmap

### 6 Months
- [ ] Basic knowledge graph with notes
- [ ] Theme-based clustering
- [ ] Search and filtering
- [ ] Mobile responsive

### 12 Months
- [ ] AI-powered suggestions
- [ ] Collaborative graphs
- [ ] Timeline visualization
- [ ] Advanced analytics

### 18 Months
- [ ] 3D graph visualization
- [ ] Real-time collaboration
- [ ] Public graph sharing
- [ ] Graph templates marketplace

## Success Metrics

**Engagement Metrics**
- Notes created per user per week: Target 3-5
- Graph views per session: Target 2-3
- Connections created manually: Target 1-2
- Time spent in graph view: Target 3-5 min

**Technical Metrics**
- Graph load time: < 2 seconds
- Note save time: < 500ms
- Search response time: < 200ms
- Mobile performance score: > 90

**User Satisfaction**
- Feature usage rate: > 40%
- User rating: > 4.5/5
- Feature retention: > 60% after 30 days
