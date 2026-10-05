/**
 * Graph Generator
 * Generates knowledge graph nodes and edges from user's notes.
 * Creates only missing items. Existing documents are never deleted or rewritten.
 */

import { Query } from 'appwrite';
import { databases, DATABASE_ID, COLLECTIONS } from './appwrite';
import { extractBookName } from './bibleParser';
import { findPeopleInText, findPlacesInText } from './bibleEntities';
import {
  createGraphNode,
  getAllUserGraphNodes,
  type GraphNode,
  type NodeType,
} from './appwrite/graphNodes';
import {
  createGraphEdge,
  getAllUserGraphEdges,
  type GraphEdge,
  type EdgeType,
} from './appwrite/graphEdges';
import { type Note } from './appwrite/notes';

const NOTE_PAGE_SIZE = 100;

interface GraphCache {
  nodesByKey: Map<string, GraphNode>;
  edgeKeys: Set<string>;
}

function nodeKey(nodeType: string, referenceId: string) {
  return `${nodeType}\0${referenceId}`;
}

function edgeKey(sourceNodeId: string, targetNodeId: string) {
  return `${sourceNodeId}\0${targetNodeId}`;
}

async function loadGraphCache(userId: string): Promise<GraphCache> {
  const [nodes, edges] = await Promise.all([
    getAllUserGraphNodes(userId),
    getAllUserGraphEdges(userId),
  ]);

  const nodesByKey = new Map<string, GraphNode>();
  for (const node of nodes) {
    if (node.referenceId) {
      nodesByKey.set(nodeKey(node.nodeType, node.referenceId), node);
    }
  }

  const edgeKeys = new Set<string>();
  for (const edge of edges) {
    edgeKeys.add(edgeKey(edge.sourceNodeId, edge.targetNodeId));
  }

  return { nodesByKey, edgeKeys };
}

/**
 * Create or get existing node. Lookup is in memory for this generation pass.
 */
async function createOrGetNode(
  cache: GraphCache,
  userId: string,
  nodeType: NodeType,
  label: string,
  referenceId: string,
  description?: string
): Promise<GraphNode> {
  const existing = cache.nodesByKey.get(nodeKey(nodeType, referenceId));
  if (existing) {
    return existing;
  }

  const created = await createGraphNode({
    userId,
    nodeType,
    label,
    referenceId,
    description,
  });
  cache.nodesByKey.set(nodeKey(nodeType, referenceId), created);
  return created;
}

/**
 * Create edge if it doesn't exist. Existing edges are left untouched.
 */
async function createEdgeIfNotExists(
  cache: GraphCache,
  userId: string,
  sourceNodeId: string,
  targetNodeId: string,
  edgeType: EdgeType
): Promise<GraphEdge | null> {
  const key = edgeKey(sourceNodeId, targetNodeId);
  if (cache.edgeKeys.has(key)) {
    return null;
  }

  try {
    const created = await createGraphEdge({
      userId,
      sourceNodeId,
      targetNodeId,
      edgeTyp: edgeType,
    });
    cache.edgeKeys.add(key);
    return created;
  } catch (error) {
    console.error('Error creating edge:', error);
    return null;
  }
}

async function listAllActiveNotes(userId: string): Promise<Note[]> {
  const notes: Note[] = [];
  let cursor: string | undefined;

  while (true) {
    const queries = [
      Query.equal('userId', userId),
      Query.equal('isArchived', false),
      Query.limit(NOTE_PAGE_SIZE),
    ];
    if (cursor) {
      queries.push(Query.cursorAfter(cursor));
    }

    const response = await databases.listDocuments<Note>(
      DATABASE_ID,
      COLLECTIONS.NOTES,
      queries
    );

    notes.push(...response.documents);
    if (response.documents.length < NOTE_PAGE_SIZE) break;
    cursor = response.documents[response.documents.length - 1].$id;
  }

  return notes;
}

/**
 * Generate graph nodes and edges for a single note.
 * Loads the user's items once when a cache is not provided.
 */
export async function generateGraphForNote(
  note: Note,
  cache?: GraphCache,
): Promise<{
  noteNode: GraphNode;
  passageNodes: GraphNode[];
  bookNodes: GraphNode[];
  themeNodes: GraphNode[];
  personNodes: GraphNode[];
  placeNodes: GraphNode[];
  edges: GraphEdge[];
}> {
  const userId = note.userId;
  const graphCache = cache ?? await loadGraphCache(userId);
  const edges: GraphEdge[] = [];
  const passageNodes: GraphNode[] = [];
  const bookNodes: GraphNode[] = [];
  const themeNodes: GraphNode[] = [];
  const personNodes: GraphNode[] = [];
  const placeNodes: GraphNode[] = [];

  const noteNode = await createOrGetNode(
    graphCache,
    userId,
    'note',
    note.title,
    note.$id,
    note.contentPlan?.substring(0, 200) || note.content?.substring(0, 200)
  );

  const bibleReferences = note.bibleReferences || [];
  const processedBooks = new Set<string>();
  const processedPassages = new Set<string>();
  const processedThemes = new Set<string>();
  const processedPeople = new Set<string>();
  const processedPlaces = new Set<string>();

  for (const ref of bibleReferences) {
    if (processedPassages.has(ref)) continue;
    processedPassages.add(ref);

    const passageNode = await createOrGetNode(
      graphCache,
      userId,
      'passage',
      ref,
      ref,
      `Bible passage: ${ref}`
    );
    passageNodes.push(passageNode);

    const noteToPassageEdge = await createEdgeIfNotExists(
      graphCache,
      userId,
      noteNode.$id,
      passageNode.$id,
      'references'
    );
    if (noteToPassageEdge) edges.push(noteToPassageEdge);

    const bookName = extractBookName(ref);
    if (bookName && !processedBooks.has(bookName)) {
      processedBooks.add(bookName);

      const bookNode = await createOrGetNode(
        graphCache,
        userId,
        'book',
        bookName,
        bookName,
        `Bible book: ${bookName}`
      );
      bookNodes.push(bookNode);

      const passageToBookEdge = await createEdgeIfNotExists(
        graphCache,
        userId,
        passageNode.$id,
        bookNode.$id,
        'references'
      );
      if (passageToBookEdge) edges.push(passageToBookEdge);
    }
  }

  const tags = note.tags || [];
  for (const tag of tags) {
    const tagKey = tag.toLowerCase();
    if (processedThemes.has(tagKey)) continue;
    processedThemes.add(tagKey);

    const themeNode = await createOrGetNode(
      graphCache,
      userId,
      'theme',
      tag,
      tag.toLowerCase(),
      `Theme: ${tag}`
    );
    themeNodes.push(themeNode);

    const noteToThemeEdge = await createEdgeIfNotExists(
      graphCache,
      userId,
      noteNode.$id,
      themeNode.$id,
      'theme_connection'
    );
    if (noteToThemeEdge) edges.push(noteToThemeEdge);
  }

  const noteText = `${note.title} ${note.contentPlan || note.content || ''}`;
  const detectedPeople = findPeopleInText(noteText);

  for (const person of detectedPeople) {
    const personKey = person.name.toLowerCase();
    if (processedPeople.has(personKey)) continue;
    processedPeople.add(personKey);

    const personNode = await createOrGetNode(
      graphCache,
      userId,
      'person',
      person.name,
      person.name.toLowerCase(),
      person.role ? `${person.role}` : `Bible figure: ${person.name}`
    );
    personNodes.push(personNode);

    const noteToPersonEdge = await createEdgeIfNotExists(
      graphCache,
      userId,
      noteNode.$id,
      personNode.$id,
      'mentions'
    );
    if (noteToPersonEdge) edges.push(noteToPersonEdge);
  }

  const detectedPlaces = findPlacesInText(noteText);

  for (const place of detectedPlaces) {
    const placeKey = place.name.toLowerCase();
    if (processedPlaces.has(placeKey)) continue;
    processedPlaces.add(placeKey);

    const placeNode = await createOrGetNode(
      graphCache,
      userId,
      'place',
      place.name,
      place.name.toLowerCase(),
      place.region ? `Region: ${place.region}` : `Bible place: ${place.name}`
    );
    placeNodes.push(placeNode);

    const noteToPlaceEdge = await createEdgeIfNotExists(
      graphCache,
      userId,
      noteNode.$id,
      placeNode.$id,
      'mentions'
    );
    if (noteToPlaceEdge) edges.push(noteToPlaceEdge);
  }

  return {
    noteNode,
    passageNodes,
    bookNodes,
    themeNodes,
    personNodes,
    placeNodes,
    edges,
  };
}

/**
 * Generate full graph from all user's notes, including notes past the first page.
 */
export async function generateGraphFromNotes(userId: string): Promise<{
  nodes: GraphNode[];
  edges: GraphEdge[];
  summary: {
    noteCount: number;
    passageCount: number;
    bookCount: number;
    themeCount: number;
    personCount: number;
    placeCount: number;
    edgeCount: number;
  };
}> {
  const notes = await listAllActiveNotes(userId);
  const cache = await loadGraphCache(userId);
  const allNodes: GraphNode[] = [];
  const allEdges: GraphEdge[] = [];

  const noteNodes: GraphNode[] = [];
  const passageNodes: GraphNode[] = [];
  const bookNodes: GraphNode[] = [];
  const themeNodes: GraphNode[] = [];
  const personNodes: GraphNode[] = [];
  const placeNodes: GraphNode[] = [];

  for (const note of notes) {
    const result = await generateGraphForNote(note, cache);

    noteNodes.push(result.noteNode);
    passageNodes.push(...result.passageNodes);
    bookNodes.push(...result.bookNodes);
    themeNodes.push(...result.themeNodes);
    personNodes.push(...result.personNodes);
    placeNodes.push(...result.placeNodes);
    allEdges.push(...result.edges);
  }

  const nodeMap = new Map<string, GraphNode>();
  [...noteNodes, ...passageNodes, ...bookNodes, ...themeNodes, ...personNodes, ...placeNodes].forEach(node => {
    nodeMap.set(node.$id, node);
  });
  allNodes.push(...nodeMap.values());

  return {
    nodes: allNodes,
    edges: allEdges,
    summary: {
      noteCount: noteNodes.length,
      passageCount: new Set(passageNodes.map(n => n.referenceId)).size,
      bookCount: new Set(bookNodes.map(n => n.referenceId)).size,
      themeCount: new Set(themeNodes.map(n => n.referenceId)).size,
      personCount: new Set(personNodes.map(n => n.referenceId)).size,
      placeCount: new Set(placeNodes.map(n => n.referenceId)).size,
      edgeCount: allEdges.length,
    },
  };
}

/**
 * Check if user has any notes
 */
export async function userHasNotes(userId: string): Promise<boolean> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.NOTES,
      [
        Query.equal('userId', userId),
        Query.limit(1),
      ]
    );
    return response.documents.length > 0;
  } catch (error) {
    console.error('Error checking notes:', error);
    return false;
  }
}

/**
 * Get count of user's notes
 */
export async function getUserNotesCount(userId: string): Promise<number> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.NOTES,
      [
        Query.equal('userId', userId),
        Query.equal('isArchived', false),
      ]
    );
    return response.total;
  } catch (error) {
    console.error('Error getting notes count:', error);
    return 0;
  }
}
