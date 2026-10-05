import { describe, it, expect, vi, beforeEach } from 'vitest';

const storedNodes: Array<{
  $id: string;
  userId: string;
  nodeType: string;
  referenceId: string;
  label: string;
  description?: string;
}> = [];
const storedEdges: Array<{
  $id: string;
  userId: string;
  sourceNodeId: string;
  targetNodeId: string;
  edgeTyp: string;
}> = [];

vi.mock('../appwrite', () => ({
  databases: {
    listDocuments: vi.fn(),
    deleteDocument: vi.fn(),
    updateDocument: vi.fn(),
  },
  DATABASE_ID: 'db',
  COLLECTIONS: {
    NOTES: 'notes',
    GRAPH_NODES: 'graph_nodes',
    GRAPH_EDGES: 'graph_edges',
  },
}));

vi.mock('../appwrite/graphNodes', () => ({
  createGraphNode: vi.fn(async (data: {
    userId: string;
    nodeType: string;
    label: string;
    referenceId?: string;
    description?: string;
  }) => {
    const node = {
      $id: `created-${data.nodeType}-${data.referenceId}`,
      userId: data.userId,
      nodeType: data.nodeType,
      referenceId: data.referenceId || '',
      label: data.label,
      description: data.description,
    };
    storedNodes.push(node);
    return node;
  }),
  getAllUserGraphNodes: vi.fn(async () => storedNodes.map((node) => ({ ...node }))),
}));

vi.mock('../appwrite/graphEdges', () => ({
  createGraphEdge: vi.fn(async (data: {
    userId: string;
    sourceNodeId: string;
    targetNodeId: string;
    edgeTyp: string;
  }) => {
    const edge = {
      $id: `edge-${storedEdges.length}`,
      userId: data.userId,
      sourceNodeId: data.sourceNodeId,
      targetNodeId: data.targetNodeId,
      edgeTyp: data.edgeTyp,
    };
    storedEdges.push(edge);
    return edge;
  }),
  getAllUserGraphEdges: vi.fn(async () => storedEdges.map((edge) => ({ ...edge }))),
  edgeExists: vi.fn(),
}));

import { databases } from '../appwrite';
import { createGraphNode, getAllUserGraphNodes } from '../appwrite/graphNodes';
import { createGraphEdge, edgeExists, getAllUserGraphEdges } from '../appwrite/graphEdges';
import { generateGraphFromNotes } from '../graphGenerator';

const listDocuments = vi.mocked(databases.listDocuments);
const createNode = vi.mocked(createGraphNode);
const createEdge = vi.mocked(createGraphEdge);

function makeNotes(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    $id: `note-${index}`,
    userId: 'user-1',
    title: `Study note ${index}`,
    content: 'Quiet afternoon study.',
    contentPlan: 'Quiet afternoon study.',
    bibleReferences: index === 120 ? ['John 1:1'] : [],
    tags: [] as string[],
    isArchived: false,
  }));
}

describe('generateGraphFromNotes', () => {
  const notes = makeNotes(150);

  beforeEach(() => {
    storedNodes.length = 0;
    storedEdges.length = 0;
    storedNodes.push({
      $id: 'existing-note-0',
      userId: 'user-1',
      nodeType: 'note',
      referenceId: 'note-0',
      label: 'Study note 0',
      description: '',
    });
    vi.clearAllMocks();

    listDocuments.mockImplementation(async (_db: string, collection: string, queries: string[] = []) => {
      if (collection !== 'notes') {
        throw new Error(`listDocuments should not run for ${collection}`);
      }
      const cursor = queries
        .map((query) => JSON.parse(query) as { method?: string; values?: string[] })
        .find((query) => query.method === 'cursorAfter');
      const afterId = cursor?.values?.[0];
      const start = afterId ? notes.findIndex((note) => note.$id === afterId) + 1 : 0;
      const page = notes.slice(start, start + 100);
      return { documents: page, total: notes.length } as unknown as Awaited<ReturnType<typeof databases.listDocuments>>;
    });
  });

  it('pages past the first 100 notes and looks up existing items in memory', async () => {
    const first = await generateGraphFromNotes('user-1');

    expect(listDocuments).toHaveBeenCalledTimes(2);
    expect(first.summary.noteCount).toBe(150);
    expect(storedNodes.some((node) => node.nodeType === 'passage' && node.referenceId === 'John 1:1')).toBe(true);
    expect(storedNodes.filter((node) => node.referenceId === 'note-0')).toHaveLength(1);
    expect(getAllUserGraphNodes).toHaveBeenCalledTimes(1);
    expect(getAllUserGraphEdges).toHaveBeenCalledTimes(1);
    expect(edgeExists).not.toHaveBeenCalled();
    expect(databases.deleteDocument).not.toHaveBeenCalled();
    expect(databases.updateDocument).not.toHaveBeenCalled();

    const createdAfterFirst = createNode.mock.calls.length;
    const edgesAfterFirst = createEdge.mock.calls.length;
    expect(createdAfterFirst).toBeGreaterThan(0);
    expect(edgesAfterFirst).toBeGreaterThan(0);

    const second = await generateGraphFromNotes('user-1');

    expect(second.summary.noteCount).toBe(150);
    expect(createNode).toHaveBeenCalledTimes(createdAfterFirst);
    expect(createEdge).toHaveBeenCalledTimes(edgesAfterFirst);
    expect(listDocuments.mock.calls.every((call) => call[1] === 'notes')).toBe(true);
  });
});
