import { Query } from 'node-appwrite';

/** Collections copied by the read-only export. Order is the archive order. */
export const EXPORT_COLLECTIONS = [
  'notes',
  'graph_nodes',
  'graph_edges',
  'themes',
  'prayers',
  'feedback_responses',
] as const;

export type ExportCollectionId = (typeof EXPORT_COLLECTIONS)[number];

export const EXPORT_PAGE_SIZE = 100;

export interface ExportDocument {
  $id: string;
  [key: string]: unknown;
}

export interface DocumentLister {
  listDocuments(
    databaseId: string,
    collectionId: string,
    queries?: string[],
  ): Promise<{ documents: ExportDocument[] }>;
}

export interface CollectionArchive {
  exportedAt: string;
  databaseId: string;
  readOnly: true;
  counts: Record<string, number>;
  /** Collection ids that were not created yet. They are omitted from counts. */
  missing: string[];
  collections: Record<string, ExportDocument[]>;
}

/**
 * True only for a missing collection. Other 404s, including a missing document, stay failures.
 */
export function isMissingCollectionError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const record = error as { code?: unknown; type?: unknown; message?: unknown };
  if (record.code !== 404) return false;
  if (record.type === 'collection_not_found') return true;
  const message = typeof record.message === 'string' ? record.message : '';
  return /collection/i.test(message) && /not found/i.test(message);
}

/**
 * Follow Appwrite cursor pages until a short page. Calls the lister only.
 */
export async function pageCollectionDocuments(
  listPage: (queries: string[]) => Promise<{ documents: ExportDocument[] }>,
  pageSize = EXPORT_PAGE_SIZE,
): Promise<ExportDocument[]> {
  if (pageSize < 1) {
    throw new Error('pageSize must be at least 1');
  }

  const documents: ExportDocument[] = [];
  let cursor: string | undefined;

  for (;;) {
    const queries = [Query.limit(pageSize)];
    if (cursor) queries.push(Query.cursorAfter(cursor));

    const page = await listPage(queries);
    documents.push(...page.documents);

    if (page.documents.length < pageSize) break;

    const lastId = page.documents[page.documents.length - 1]?.$id;
    if (!lastId || lastId === cursor) {
      throw new Error('Collection page did not advance');
    }
    cursor = lastId;
  }

  return documents;
}

/**
 * Build a JSON archive by listing each collection. No writes to Appwrite.
 */
export async function exportCollections(options: {
  databases: DocumentLister;
  databaseId: string;
  exportedAt: string;
  collections?: readonly string[];
  pageSize?: number;
}): Promise<CollectionArchive> {
  const collectionIds = options.collections ?? EXPORT_COLLECTIONS;
  const collections: Record<string, ExportDocument[]> = {};
  const missing: string[] = [];

  for (const collectionId of collectionIds) {
    try {
      collections[collectionId] = await pageCollectionDocuments(
        (queries) => options.databases.listDocuments(options.databaseId, collectionId, queries),
        options.pageSize,
      );
    } catch (error) {
      if (!isMissingCollectionError(error)) throw error;
      missing.push(collectionId);
    }
  }

  const counts = Object.fromEntries(
    Object.entries(collections).map(([collectionId, docs]) => [collectionId, docs.length]),
  );

  return {
    exportedAt: options.exportedAt,
    databaseId: options.databaseId,
    readOnly: true,
    counts,
    missing,
    collections,
  };
}

/** Filename-safe UTC stamp, for example bible-study-export-2026-10-05T08-31-00-000Z.json */
export function archiveFileName(exportedAt: Date): string {
  const stamp = exportedAt.toISOString().replace(/[:.]/g, '-');
  return `bible-study-export-${stamp}.json`;
}
