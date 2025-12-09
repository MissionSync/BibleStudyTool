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
- Supabase (backend/database)
- Lucide React (icons)

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

## Environment Setup

The project uses `.env*` files for configuration (gitignored by default). Expected variables likely include:
- Supabase connection details
- API keys for external services (if any)

## Testing

No test framework is currently configured. When adding tests, consider:
- Jest + React Testing Library for component tests
- Playwright or Cypress for e2e tests

## Deployment

This project is optimized for Vercel deployment (see README.md for details). Alternative deployment options include:
- Docker containerization
- Other Node.js hosting platforms

## Notes for AI Development

- The project is in early development (mostly scaffold with example data)
- API routes in `src/app/api/` are directory structures only - no implementation yet
- Supabase is declared as a dependency but integration is not yet implemented
- The graph visualization system is the core feature being built
- Focus development on graph interactivity, data persistence via Supabase, and study plan management features
