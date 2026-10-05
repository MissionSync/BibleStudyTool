# Bible Study Tool

A Next.js-based Bible study application with interactive knowledge graph visualization, note-taking capabilities, and intelligent cross-referencing.

## Features

- **Interactive Knowledge Graph** - Visualize connections between Bible passages, themes, people, and places
- **Rich Note-Taking** - Create and organize study notes with automatic Bible reference detection
- **Smart Linking** - Automatically link notes to passages, themes, and related content
- **Study Plans** - Pre-configured study plans (starting with 1 John)
- **Visual Analytics** - See patterns and connections in your Bible study journey

## Tech Stack

- **App:** Next.js, React, TypeScript, TailwindCSS, hosted as an Appwrite SSR Site
- **Data and auth:** the same Appwrite project as the site
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

The Next.js app and its data live in one Appwrite project. Notes, the study map, auth, and the website are that same project, hosted as an Appwrite Site with server-side rendering.

In the Appwrite console, create a Site from this repository:

- Framework: Next.js
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `./.next`
- Rendering: server-side rendering

Set the public variables from `.env.example` (`NEXT_PUBLIC_APPWRITE_ENDPOINT`, `NEXT_PUBLIC_APPWRITE_PROJECT_ID`, `NEXT_PUBLIC_APPWRITE_DATABASE_ID`) to this project. Add the site hostname as a Web platform so login cookies match the site.

Server routes read the ephemeral Appwrite Sites key from the `x-appwrite-key` request header. For local `npm run dev`, they fall back to `APPWRITE_API_KEY` in `.env.local`. Do not commit that key. On the site, grant the dynamic key users read, databases read and write, and messages write.

Collection schema details are in `Deployment_Alternatives.md`.

### Read-only collection export

`npm run export:collections` pages `notes`, `graph_nodes`, `graph_edges`, `themes`, `prayers`, and `feedback_responses` into a timestamped JSON file under `backups/`. It only lists documents. It does not create, update, or delete anything. If `feedback_responses` has not been created yet, that id is recorded as missing and the rest of the archive, including notes, is still written. Restore a downloaded archive into a new empty project before treating it as a proven copy. Do not import it into the live project. Auth users are not part of this export.

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

MIT

## Acknowledgments

- Built with [Next.js](https://nextjs.org)
- Powered by [Appwrite](https://appwrite.io)
- Visualization by [React Flow](https://reactflow.dev)
- Rich text editing with [TipTap](https://tiptap.dev)
