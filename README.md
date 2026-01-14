# Bible Study Tool

A Next.js-based Bible study application with interactive knowledge graph visualization, note-taking capabilities, and intelligent cross-referencing.

## Features

- **Interactive Knowledge Graph** - Visualize connections between Bible passages, themes, people, and places
- **Rich Note-Taking** - Create and organize study notes with automatic Bible reference detection
- **Smart Linking** - Automatically link notes to passages, themes, and related content
- **Study Plans** - Pre-configured study plans (starting with 1 John)
- **Visual Analytics** - See patterns and connections in your Bible study journey

## Tech Stack

- **Frontend:** Next.js 14, React, TypeScript, TailwindCSS
- **Backend:** Appwrite Cloud (managed BaaS)
- **Visualization:** React Flow, D3.js
- **Editor:** TipTap (rich text editor)
- **State Management:** Zustand

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- An Appwrite Cloud account (free tier available)

### Setup Instructions

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd BibleStudyTool
```

2.**Install dependencies**

```bash
npm install
```

3.**Set up Appwrite Cloud**

- Go to <https://cloud.appwrite.io>
- Create a free account
- Create a new project named `bible-study-tool`
- Copy your Project ID

4.**Configure environment variables**

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=<your-project-id>
```

5.**Create database collections**

In your Appwrite Cloud console, create the following collections in a database named `bible_study`:

- `notes`
- `graph_nodes`
- `graph_edges`
- `themes`

See `Deployment_Alternatives.md` for detailed schema specifications.

6.**Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Documentation

- **[Bible_Study_App_Plan.md](./Bible_Study_App_Plan.md)** - Complete implementation plan with features, timeline, and architecture
- **[Deployment_Alternatives.md](./Deployment_Alternatives.md)** - Detailed backend setup guide for Appwrite Cloud
- **[SELF_HOST_DIGITALOCEAN_GUIDE.md](./SELF_HOST_DIGITALOCEAN_GUIDE.md)** - Alternative self-hosting instructions (archived)

## Project Structure

```md
src/
├── app/                    # Next.js app directory
│   ├── study/[planId]/     # Study plan pages
│   │   └── graph/          # Knowledge graph visualization
│   └── api/                # API routes
├── components/
│   ├── graph/              # Knowledge graph components
│   │   ├── KnowledgeGraph.tsx
│   │   ├── GraphControls.tsx
│   │   └── nodes/          # Custom node types
│   └── notes/              # Note-taking components
│       ├── NoteEditor.tsx
│       └── NoteSidebar.tsx
├── lib/
│   ├── appwrite.ts         # Appwrite client configuration
│   └── appwrite/           # Appwrite service modules
│       ├── notes.ts
│       ├── graphNodes.ts
│       ├── graphEdges.ts
│       └── themes.ts
└── data/
    └── first-study-plan-data.ts  # Initial 1 John study data
```

## Database Schema

The application uses four main collections:

1. **notes** - User study notes with Bible references and tags
2. **graph_nodes** - Visual nodes (passages, themes, people, places, books)
3. **graph_edges** - Connections between nodes
4. **themes** - Predefined and custom study themes

Full schema details are in `Deployment_Alternatives.md`.

## Deployment

### Backend (Appwrite Cloud)

- Sign up at <https://cloud.appwrite.io>
- Use the free tier (75K MAU, 2GB storage)
- Follow setup guide in `Deployment_Alternatives.md`

### Frontend Options

- **Vercel** (Recommended) - `vercel deploy`
- **Netlify** - `netlify deploy`
- **Cloudflare Pages** - Connect GitHub repo

All options offer free tiers with SSL, CDN, and automatic deployments.

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Contributing

This is a personal Bible study tool project. Feel free to fork and customize for your own use.

## License

[Your chosen license]

## Acknowledgments

- Built with [Next.js](https://nextjs.org)
- Powered by [Appwrite](https://appwrite.io)
- Visualization by [React Flow](https://reactflow.dev)
- Rich text editing with [TipTap](https://tiptap.dev)
