import { ID, Query, type Models } from 'appwrite';
import { databases, DATABASE_ID, COLLECTIONS } from '../appwrite';

export type EdgeType = 'references' | 'theme_connection' | 'mentions' | 'cross_ref';

export interface GraphEdge extends Models.Document {
  userId: string;
  sourceNodeId: string;
  targetNodeId: string;
  edgeTyp: EdgeType;
  weight: number;
}

export interface CreateGraphEdgeData {
  userId: string;
  sourceNodeId: string;
  targetNodeId: string;
  edgeTyp: EdgeType;
  weight?: number;
}

export interface UpdateGraphEdgeData {
  weight?: number;
}

/**
 * Create a new graph edge
 */
export async function createGraphEdge(data: CreateGraphEdgeData): Promise<GraphEdge> {
  const edgeData = {
    userId: data.userId,
    sourceNodeId: data.sourceNodeId,
    targetNodeId: data.targetNodeId,
    edgeTyp: data.edgeTyp,
    weight: data.weight || 1.0,
  };

  return databases.createDocument<GraphEdge>(
    DATABASE_ID,
    COLLECTIONS.GRAPH_EDGES,
    ID.unique(),
    edgeData
  );
}

/**
 * Get a single graph edge by ID
 */
export async function getGraphEdge(edgeId: string): Promise<GraphEdge> {
  return databases.getDocument<GraphEdge>(
    DATABASE_ID,
    COLLECTIONS.GRAPH_EDGES,
    edgeId
  );
}

/**
 * Get all graph edges for a user
 */
export async function getUserGraphEdges(userId: string): Promise<GraphEdge[]> {
  const response = await databases.listDocuments<GraphEdge>(
    DATABASE_ID,
    COLLECTIONS.GRAPH_EDGES,
    [Query.equal('userId', userId)]
  );

  return response.documents;
}

/**
 * Get edges connected to a specific node
 */
export async function getNodeEdges(userId: string, nodeId: string): Promise<GraphEdge[]> {
  // Get edges where the node is either source or target
  const [sourceEdges, targetEdges] = await Promise.all([
    databases.listDocuments<GraphEdge>(
      DATABASE_ID,
      COLLECTIONS.GRAPH_EDGES,
      [
        Query.equal('userId', userId),
        Query.equal('sourceNodeId', nodeId),
      ]
    ),
    databases.listDocuments<GraphEdge>(
      DATABASE_ID,
      COLLECTIONS.GRAPH_EDGES,
      [
        Query.equal('userId', userId),
        Query.equal('targetNodeId', nodeId),
      ]
    ),
  ]);

  return [...sourceEdges.documents, ...targetEdges.documents];
}

/**
 * Update a graph edge
 */
export async function updateGraphEdge(edgeId: string, data: UpdateGraphEdgeData): Promise<GraphEdge> {
  return databases.updateDocument<GraphEdge>(
    DATABASE_ID,
    COLLECTIONS.GRAPH_EDGES,
    edgeId,
    data
  );
}

/**
 * Delete a graph edge
 */
export async function deleteGraphEdge(edgeId: string): Promise<void> {
  await databases.deleteDocument(
    DATABASE_ID,
    COLLECTIONS.GRAPH_EDGES,
    edgeId
  );
}

/**
 * Check if an edge already exists between two nodes
 */
export async function edgeExists(
  userId: string,
  sourceNodeId: string,
  targetNodeId: string
): Promise<boolean> {
  const response = await databases.listDocuments<GraphEdge>(
    DATABASE_ID,
    COLLECTIONS.GRAPH_EDGES,
    [
      Query.equal('userId', userId),
      Query.equal('sourceNodeId', sourceNodeId),
      Query.equal('targetNodeId', targetNodeId),
    ]
  );

  return response.documents.length > 0;
}
