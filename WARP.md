# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Bible Study Tool is a Next.js-based application for interactive Bible study planning and visualization. The app uses React Flow for graph-based visualization of biblical passages, themes, and study notes, with Supabase for data persistence.

**Key Technologies:**
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- React Flow (graph visualization)
- TipTap (rich text editing)
- **Appwrite (self-hosted backend/database on DigitalOcean)**
- Lucide React (icons)
- Dagre (graph layouts)

## Common Development Commands

### Development
```bash
npm run dev
```
Starts the development server at http://localhost:3000 with hot-reload enabled.

### Building
```bash
npm run build
```
Creates an optimized production build. Next.js will output to `.next/` directory.

### Production Server
```bash
npm run start
```
Runs the production build locally (must run `npm run build` first).

### Linting
```bash
npm run lint
```
Runs ESLint with Next.js configuration to check code quality.

### Type Checking
```bash
npx tsc --noEmit
```
Runs TypeScript type checker without emitting files.

## Architecture

### Directory Structure

**`src/app/`** - Next.js App Router pages and layouts
- `page.tsx` - Home page (currently placeholder)
- `layout.tsx` - Root layout with font configuration
- `globals.css` - Global styles and Tailwind imports
- `study/[planId]/` - Dynamic route for individual study plans
- `api/` - API route handlers (graph operations, notes)

**`src/components/`** - React components
- `graph/nodes/` - Custom React Flow node components:
  - `PassageNode.tsx` - Biblical passage/chapter nodes
  - `ThemeNode.tsx` - Thematic concept nodes
  - `NoteNode.tsx` - User note nodes

**`src/lib/`** - Utility functions and shared logic
- `utils/` - Helper functions

**`src/data/`** - Static data and mock data
- `first-study-plan-data.ts` - Example study plan structure with 1 John data

### Data Model

The application centers around **Study Plans** containing:
- **Readings** - Scheduled Bible passages with metadata (themes, people, key verses)
- **Graph Nodes** - Visual elements representing books, passages, themes, people, and notes
- **Graph Edges** - Relationships between nodes (contains, theme_connection, authored, about)

**Node Types:**
1. `book` - Biblical book (e.g., "1 John")
2. `passage` - Chapter or section
3. `theme` - Theological/topical concept
4. `person` - Biblical figure
5. `note` - User-created study note

### Component Architecture

**Graph Visualization:**
- Built on React Flow for interactive node-edge graphs
- Custom node components styled with Tailwind
- Each node type has distinct visual styling (colors, icons)
- Handles for connecting relationships between entities

**Styling Approach:**
- Tailwind CSS 4 with PostCSS
- Component-level styling with utility classes
- Dark mode support via Tailwind classes
- Custom color schemes per node type for visual hierarchy

### Path Aliases

The project uses TypeScript path aliases:
- `@/*` maps to `./src/*`

Example: `import { Component } from '@/components/Component'`

## Development Patterns

### React Flow Nodes

All custom node components follow this pattern:
```typescript
'use client';
import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

export const CustomNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div className="...">
      <Handle type="target" position={Position.Top} />
      {/* Node content */}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});
```

**Key Points:**
- Always use `'use client'` directive for React Flow components
- Wrap in `React.memo()` for performance
- Include both target and source handles
- Use `selected` prop for conditional styling
- Set `displayName` for better debugging

### Data Structure Conventions

**Graph Node Schema:**
```typescript
{
  id: string;           // Unique identifier with prefix (e.g., 'passage-1john-1')
  type: string;         // Node type (book, passage, theme, person, note)
  data: {
    label: string;      // Display name
    // Type-specific fields
  };
  position: { x: number; y: number };
}
```

**Graph Edge Schema:**
```typescript
{
  id: string;           // Unique identifier
  source: string;       // Source node ID
  target: string;       // Target node ID
  type: string;         // Relationship type
  animated?: boolean;   // Optional animation
  label?: string;       // Optional edge label
}
```

### Styling Conventions

- Use semantic color coding:
  - Emerald/green - Passages
  - Amber/yellow - Notes
  - Purple - Themes (with custom colors via data.color)
- Consistent spacing: `px-4 py-3` for node padding
- Border width: `border-2` for nodes
- Shadow hierarchy: `shadow-md` default, `shadow-lg` on hover
- Selected state: Darker border color or ring effect

## Backend: Self-Hosted Appwrite

**Important:** This project uses self-hosted Appwrite on DigitalOcean, NOT Supabase.

### Setup Instructions
Refer to `SELF_HOST_DIGITALOCEAN_GUIDE.md` for complete setup instructions.

### Environment Variables

The project uses `.env.local` for configuration:
```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=http://YOUR-DROPLET-IP/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id

# For development/type generation only (don't commit)
APPWRITE_ENDPOINT=http://YOUR-DROPLET-IP/v1
APPWRITE_PROJECT_ID=your-project-id
APPWRITE_API_KEY=your-api-key
```

### Appwrite Client Setup

```typescript
// lib/appwrite.ts
import { Client, Databases, Account } from 'appwrite';

const client = new Client();

client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

export const databases = new Databases(client);
export const account = new Account(client);
export { client };
```

## Testing

No test framework is currently configured. When adding tests, consider:
- Jest + React Testing Library for component tests
- Playwright or Cypress for e2e tests

## Deployment

This project is optimized for Vercel deployment (see README.md for details). Alternative deployment options include:
- Docker containerization
- Other Node.js hosting platforms

## Knowledge Graph Implementation Status

### ✅ Completed Components

**Frontend Components (All Built):**
- ✅ 5 Custom Node Components:
  - `NoteNode.tsx` - User study notes
  - `PassageNode.tsx` - Bible passages
  - `ThemeNode.tsx` - Theological themes
  - `PersonNode.tsx` - Biblical people
  - `BookNode.tsx` - Bible books
- ✅ Rich Text Editor:
  - `NoteEditor.tsx` - TipTap-based editor with Bible reference auto-detection
- ✅ Graph UI Components:
  - `KnowledgeGraph.tsx` - Main React Flow canvas
  - `GraphControls.tsx` - Filtering and search
  - `GraphStats.tsx` - Statistics display
  - `NodeDetailsPanel.tsx` - Selected node details
- ✅ Initial Data:
  - `first-study-plan-data.ts` - Pre-configured 1 John study plan

**Documentation:**
- ✅ `README_KNOWLEDGE_GRAPH.md` - Project overview
- ✅ `IMPLEMENTATION_STATUS.md` - Current status and checklist
- ✅ `QUICK_START.md` - Quick reference
- ✅ `KNOWLEDGE_GRAPH_IMPLEMENTATION.md` - Technical specification
- ✅ `INTEGRATION_GUIDE.md` - Step-by-step implementation
- ✅ `BEST_PRACTICES.md` - Architecture and optimization
- ✅ `SUPPORTING_COMPONENTS_GUIDE.md` - Component reference
- ✅ `SELF_HOST_DIGITALOCEAN_GUIDE.md` - Backend setup guide

### 🚧 Remaining Tasks

#### Task 1: Setup Self-Hosted Appwrite Backend
**Priority:** HIGH  
**Time:** 30-45 minutes  
**Reference:** `SELF_HOST_DIGITALOCEAN_GUIDE.md`

1. Create DigitalOcean droplet ($12/month, 2GB RAM)
2. Install Docker and Docker Compose
3. Install Appwrite using official installer
4. Create admin account and project
5. Create database collections:
   - `notes` - User study notes
   - `graph_nodes` - Graph visualization nodes
   - `graph_edges` - Node relationships
   - `themes` - Predefined and custom themes
6. Configure permissions for each collection
7. Generate API keys
8. Add environment variables to `.env.local`

**Deliverable:** Working Appwrite backend accessible at `http://YOUR-DROPLET-IP`

#### Task 2: Create Appwrite Integration Layer
**Priority:** HIGH  
**Time:** 45 minutes  
**Dependencies:** Task 1 complete

1. Create `src/lib/appwrite.ts` - Client configuration
2. Create `src/lib/appwrite/`:
   - `notes.ts` - Note CRUD operations
   - `graphNodes.ts` - Graph node operations
   - `graphEdges.ts` - Edge operations
   - `themes.ts` - Theme operations
3. Implement auto-linking logic:
   - Parse Bible references from note content
   - Create/find passage nodes
   - Create edges between notes and passages
   - Link tags to theme nodes

**Key Functions:**
```typescript
// lib/appwrite/notes.ts
export async function createNoteWithGraph({
  userId,
  title,
  content,
  tags,
  references
}: NoteInput) {
  // 1. Create note document
  // 2. Create graph node
  // 3. Parse and link Bible references
  // 4. Link to theme nodes based on tags
  // 5. Return note with graph data
}
```

**Deliverable:** Appwrite integration functions ready for use

#### Task 3: Create Study Graph Page
**Priority:** HIGH  
**Time:** 30 minutes  
**Dependencies:** Tasks 1-2 complete  
**Reference:** `INTEGRATION_GUIDE.md`

1. Create `src/app/study/[planId]/graph/page.tsx`
2. Load initial graph from `first-study-plan-data.ts`
3. Fetch user's graph data from Appwrite
4. Integrate `KnowledgeGraph` component
5. Add "+ New Note" button that opens `NoteEditor`
6. Handle note save → graph update flow
7. Implement node interactions (click, double-click)

**User Flow:**
```
User clicks "+ New Note"
  → NoteEditor modal opens
  → User types note with Bible references
  → Auto-detection highlights references
  → User saves note
  → API creates note + graph nodes + edges
  → Graph refreshes showing new connections
```

**Deliverable:** Working study graph page at `/study/1/graph`

#### Task 4: Testing & Refinement
**Priority:** MEDIUM  
**Time:** 1-2 hours  
**Dependencies:** Tasks 1-3 complete

1. Test full workflow:
   - Create note with Bible references
   - Verify auto-detection works
   - Check graph updates correctly
   - Test filtering by node type
   - Test search functionality
   - Verify node details panel
2. Test edge cases:
   - Empty notes
   - Notes without references
   - Multiple references to same passage
   - Invalid Bible references
3. Performance testing:
   - Graph with 50+ nodes
   - Rapid note creation
   - Filter toggling
4. Mobile responsiveness
5. Error handling and loading states

**Deliverable:** Polished, tested feature ready for users

### Quick Commands for Each Task

**Task 1 - Backend Setup:**
```bash
# On DigitalOcean droplet
ssh root@YOUR-DROPLET-IP
apt update && apt upgrade -y
curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh
mkdir appwrite && cd appwrite
docker run -it --rm --volume /var/run/docker.sock:/var/run/docker.sock \
  --volume "$(pwd)"/appwrite:/usr/src/code/appwrite:rw \
  --entrypoint="install" appwrite/appwrite:1.5.7
```

**Task 2 - Integration:**
```bash
# Local machine
npm install appwrite
# Create lib/appwrite.ts and related files
```

**Task 3 - Page Creation:**
```bash
# Create study graph page
mkdir -p src/app/study/\[planId\]/graph
# Copy template from INTEGRATION_GUIDE.md
```

**Task 4 - Testing:**
```bash
npm run dev
# Navigate to http://localhost:3000/study/1/graph
# Test all features
```

## Notes for AI Development

- **Backend:** Self-hosted Appwrite on DigitalOcean (NOT Supabase)
- **Frontend:** All components built and ready
- **Next Steps:** Backend setup → Integration → Page creation → Testing
- **Focus:** Data persistence with Appwrite, graph auto-linking, smooth UX
- **Cost:** $12/month for self-hosted solution vs $25/month for Supabase Pro
- All documentation is comprehensive - refer to specific guides for detailed instructions
