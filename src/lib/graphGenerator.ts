/**
 * Graph Generator
 * Generates knowledge graph nodes and edges from user's notes
 */

import { Query } from 'appwrite';
import { databases, DATABASE_ID, COLLECTIONS } from './appwrite';
import { extractBookName } from './bibleParser';
import { findPeopleInText, findPlacesInText } from './bibleEntities';
import {
  createGraphNode,
  getUserGraphNodes,
  type GraphNode,
  type NodeType,
} from './appwrite/graphNodes';
import {
  createGraphEdge,
  edgeExists,
  type GraphEdge,
  type EdgeType,
} from './appwrite/graphEdges';
import { type Note } from './appwrite/notes';

/**
 * Find an existing node by type and referenceId
 */
async function findNodeByReference(
  userId: string,
  nodeType: NodeType,
  referenceId: string
): Promise<GraphNode | null> {
  try {
    const response = await databases.listDocuments<GraphNode>(
      DATABASE_ID,
      COLLECTIONS.GRAPH_NODES,
      [
        Query.equal('userId', userId),
        Query.equal('nodeType', nodeType),
        Query.equal('referenceId', referenceId),
        Query.limit(1),
      ]
    );

    if (response.documents.length > 0) {
      return response.documents[0];
    }
    return null;
  } catch (error) {
    console.error('Error finding node:', error);
    return null;
  }
}

/**
 * Create or get existing node
 */
async function createOrGetNode(
  userId: string,
  nodeType: NodeType,
  label: string,
  referenceId: string,
  description?: string
): Promise<GraphNode> {
  // Check if node already exists
  const existing = await findNodeByReference(userId, nodeType, referenceId);
  if (existing) {
    return existing;
  }

  // Create new node
  return await createGraphNode({
    userId,
    nodeType,
    label,
    referenceId,
    description,
  });
}

/**
 * Create edge if it doesn't exist
 */
async function createEdgeIfNotExists(
  userId: string,
  sourceNodeId: string,
  targetNodeId: string,
  edgeType: EdgeType
): Promise<GraphEdge | null> {
  try {
    const exists = await edgeExists(userId, sourceNodeId, targetNodeId);
    if (exists) {
      return null;
    }

    return await createGraphEdge({
      userId,
      sourceNodeId,
      targetNodeId,
      edgeTyp: edgeType,
    });
  } catch (error) {
    console.error('Error creating edge:', error);
    return null;
  }
}

/**
 * Generate graph nodes and edges for a single note
 */
export async function generateGraphForNote(note: Note): Promise<{
  noteNode: GraphNode;
  passageNodes: GraphNode[];
  bookNodes: GraphNode[];
  themeNodes: GraphNode[];
  personNodes: GraphNode[];
  placeNodes: GraphNode[];
  edges: GraphEdge[];
}> {
  const userId = note.userId;
  const edges: GraphEdge[] = [];
  const passageNodes: GraphNode[] = [];
  const bookNodes: GraphNode[] = [];
  const themeNodes: GraphNode[] = [];
  const personNodes: GraphNode[] = [];
  const placeNodes: GraphNode[] = [];

  // 1. Create note node
  const noteNode = await createOrGetNode(
    userId,
    'note',
    note.title,
    note.$id,
    note.contentPlan?.substring(0, 200) || note.content?.substring(0, 200)
  );

  // 2. Process Bible references
  const bibleReferences = note.bibleReferences || [];
  const processedBooks = new Set<string>();
  const processedPassages = new Set<string>();
  const processedThemes = new Set<string>();
  const processedPeople = new Set<string>();
  const processedPlaces = new Set<string>();

  for (const ref of bibleReferences) {
    if (processedPassages.has(ref)) continue;
    processedPassages.add(ref);

    // Create passage node
    const passageNode = await createOrGetNode(
      userId,
      'passage',
      ref,
      ref,
      `Bible passage: ${ref}`
    );
    passageNodes.push(passageNode);

    // Create edge: note -> passage (references)
    const noteToPassageEdge = await createEdgeIfNotExists(
      userId,
      noteNode.$id,
      passageNode.$id,
      'references'
    );
    if (noteToPassageEdge) edges.push(noteToPassageEdge);

    // Extract book name and create book node
    const bookName = extractBookName(ref);
    if (bookName && !processedBooks.has(bookName)) {
      processedBooks.add(bookName);

      const bookNode = await createOrGetNode(
        userId,
        'book',
        bookName,
        bookName,
        `Bible book: ${bookName}`
      );
      bookNodes.push(bookNode);

      // Create edge: passage -> book (references)
      const passageToBookEdge = await createEdgeIfNotExists(
        userId,
        passageNode.$id,
        bookNode.$id,
        'references'
      );
      if (passageToBookEdge) edges.push(passageToBookEdge);
    }
  }

  // 3. Process tags as themes
  const tags = note.tags || [];
  for (const tag of tags) {
    const tagKey = tag.toLowerCase();
    if (processedThemes.has(tagKey)) continue;
    processedThemes.add(tagKey);

    const themeNode = await createOrGetNode(
      userId,
      'theme',
      tag,
      tag.toLowerCase(),
      `Theme: ${tag}`
    );
    themeNodes.push(themeNode);

    // Create edge: note -> theme (theme_connection)
    const noteToThemeEdge = await createEdgeIfNotExists(
      userId,
      noteNode.$id,
      themeNode.$id,
      'theme_connection'
    );
    if (noteToThemeEdge) edges.push(noteToThemeEdge);
  }

  // 4. Detect and process people mentioned in content
  const noteText = `${note.title} ${note.contentPlan || note.content || ''}`;
  const detectedPeople = findPeopleInText(noteText);

  for (const person of detectedPeople) {
    const personKey = person.name.toLowerCase();
    if (processedPeople.has(personKey)) continue;
    processedPeople.add(personKey);

    const personNode = await createOrGetNode(
      userId,
      'person',
      person.name,
      person.name.toLowerCase(),
      person.role ? `${person.role}` : `Bible figure: ${person.name}`
    );
    personNodes.push(personNode);

    // Create edge: note -> person (mentions)
    const noteToPersonEdge = await createEdgeIfNotExists(
      userId,
      noteNode.$id,
      personNode.$id,
      'mentions'
    );
    if (noteToPersonEdge) edges.push(noteToPersonEdge);
  }

  // 5. Detect and process places mentioned in content
  const detectedPlaces = findPlacesInText(noteText);

  for (const place of detectedPlaces) {
    const placeKey = place.name.toLowerCase();
    if (processedPlaces.has(placeKey)) continue;
    processedPlaces.add(placeKey);

    const placeNode = await createOrGetNode(
      userId,
      'place',
      place.name,
      place.name.toLowerCase(),
      place.region ? `Region: ${place.region}` : `Bible place: ${place.name}`
    );
    placeNodes.push(placeNode);

    // Create edge: note -> place (mentions)
    const noteToPlaceEdge = await createEdgeIfNotExists(
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
 * Generate full graph from all user's notes
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
  // Fetch all user's notes
  const notesResponse = await databases.listDocuments<Note>(
    DATABASE_ID,
    COLLECTIONS.NOTES,
    [
      Query.equal('userId', userId),
      Query.equal('isArchived', false),
      Query.limit(100),
    ]
  );

  const notes = notesResponse.documents;
  const allNodes: GraphNode[] = [];
  const allEdges: GraphEdge[] = [];

  const noteNodes: GraphNode[] = [];
  const passageNodes: GraphNode[] = [];
  const bookNodes: GraphNode[] = [];
  const themeNodes: GraphNode[] = [];
  const personNodes: GraphNode[] = [];
  const placeNodes: GraphNode[] = [];

  // Process each note
  for (const note of notes) {
    const result = await generateGraphForNote(note);

    noteNodes.push(result.noteNode);
    passageNodes.push(...result.passageNodes);
    bookNodes.push(...result.bookNodes);
    themeNodes.push(...result.themeNodes);
    personNodes.push(...result.personNodes);
    placeNodes.push(...result.placeNodes);
    allEdges.push(...result.edges);
  }

  // Deduplicate nodes by ID
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
