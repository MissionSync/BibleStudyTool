import { ID, Query, type Models } from 'appwrite';
import { databases, DATABASE_ID, COLLECTIONS } from '../appwrite';

export type NodeType = 'book' | 'passage' | 'theme' | 'person' | 'place' | 'note';

export interface GraphNode extends Models.Document {
  userId: string;
  nodeType: NodeType;
  referenceId?: string;
  label: string;
  description?: string;
  metadata?: string; // JSON string
}

export type NodeMetadata = Record<string, string | number | boolean | null>;

export interface CreateGraphNodeData {
  userId: string;
  nodeType: NodeType;
  label: string;
  referenceId?: string;
  description?: string;
  metadata?: NodeMetadata;
}

export interface UpdateGraphNodeData {
  label?: string;
  description?: string;
  metadata?: NodeMetadata;
}

/**
 * Create a new graph node
 */
export async function createGraphNode(data: CreateGraphNodeData): Promise<GraphNode> {
  const nodeData = {
    userId: data.userId,
    nodeType: data.nodeType,
    label: data.label,
    referenceId: data.referenceId || '',
    description: data.description || '',
    metadata: data.metadata ? JSON.stringify(data.metadata) : '',
  };

  return databases.createDocument<GraphNode>(
    DATABASE_ID,
    COLLECTIONS.GRAPH_NODES,
    ID.unique(),
    nodeData
  );
}

/**
 * Get a single graph node by ID
 */
export async function getGraphNode(nodeId: string): Promise<GraphNode> {
  return databases.getDocument<GraphNode>(
    DATABASE_ID,
    COLLECTIONS.GRAPH_NODES,
    nodeId
  );
}

/**
 * Get all graph nodes for a user
 */
export async function getUserGraphNodes(userId: string, nodeType?: NodeType): Promise<GraphNode[]> {
  const queries = [Query.equal('userId', userId)];

  if (nodeType) {
    queries.push(Query.equal('nodeType', nodeType));
  }

  const response = await databases.listDocuments<GraphNode>(
    DATABASE_ID,
    COLLECTIONS.GRAPH_NODES,
    queries
  );

  return response.documents;
}

/**
 * Update a graph node
 */
export async function updateGraphNode(nodeId: string, data: UpdateGraphNodeData): Promise<GraphNode> {
  const updateData: Partial<{ label: string; description: string; metadata: string }> = {};

  if (data.label !== undefined) updateData.label = data.label;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.metadata !== undefined) updateData.metadata = JSON.stringify(data.metadata);

  return databases.updateDocument<GraphNode>(
    DATABASE_ID,
    COLLECTIONS.GRAPH_NODES,
    nodeId,
    updateData
  );
}

/**
 * Delete a graph node
 */
export async function deleteGraphNode(nodeId: string): Promise<void> {
  await databases.deleteDocument(
    DATABASE_ID,
    COLLECTIONS.GRAPH_NODES,
    nodeId
  );
}

/**
 * Parse metadata JSON string
 */
export function parseNodeMetadata(node: GraphNode): NodeMetadata | null {
  if (!node.metadata) return null;

  try {
    return JSON.parse(node.metadata);
  } catch {
    return null;
  }
}
