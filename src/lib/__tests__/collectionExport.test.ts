import { readFileSync } from 'fs';
import { describe, expect, it, vi } from 'vitest';
import { Query } from 'node-appwrite';
import {
  EXPORT_COLLECTIONS,
  archiveFileName,
  exportCollections,
  pageCollectionDocuments,
  type DocumentLister,
  type ExportDocument,
} from '../collectionExport';

describe('pageCollectionDocuments', () => {
  it('follows cursor pages until a short page', async () => {
    const listPage = vi.fn(async (queries: string[]) => {
      if (queries.length === 1) {
        return { documents: [{ $id: 'a' }, { $id: 'b' }] };
      }
      return { documents: [{ $id: 'c' }] };
    });

    const documents = await pageCollectionDocuments(listPage, 2);

    expect(documents.map((doc) => doc.$id)).toEqual(['a', 'b', 'c']);
    expect(listPage).toHaveBeenCalledTimes(2);
    expect(listPage.mock.calls[1][0]).toContain(Query.cursorAfter('b'));
  });

  it('stops when the cursor does not advance', async () => {
    const listPage = vi.fn(async () => ({ documents: [{ $id: 'same' }, { $id: 'same' }] }));
    await expect(pageCollectionDocuments(listPage, 2)).rejects.toThrow(/did not advance/);
  });
});

describe('exportCollections', () => {
  it('pages every study collection and only lists documents', async () => {
    const calls: Array<{ collectionId: string; queries?: string[] }> = [];
    const databases: DocumentLister = {
      listDocuments: async (databaseId, collectionId, queries) => {
        calls.push({ collectionId, queries });
        expect(databaseId).toBe('bible_study');
        const documents: ExportDocument[] = collectionId === 'notes'
          ? [{ $id: 'note-1', title: 'Sample' }]
          : [];
        return { documents };
      },
    };

    const archive = await exportCollections({
      databases,
      databaseId: 'bible_study',
      exportedAt: '2026-10-05T08:31:00.000Z',
    });

    expect(calls.map((call) => call.collectionId)).toEqual([...EXPORT_COLLECTIONS]);
    expect(Object.keys(databases)).toEqual(['listDocuments']);
    expect(archive.readOnly).toBe(true);
    expect(archive.counts.notes).toBe(1);
    expect(archive.counts.feedback_responses).toBe(0);
    expect(archive.collections.notes[0].title).toBe('Sample');
  });
});

describe('archiveFileName', () => {
  it('builds a timestamped json name', () => {
    expect(archiveFileName(new Date('2026-10-05T08:31:00.000Z'))).toBe(
      'bible-study-export-2026-10-05T08-31-00-000Z.json',
    );
  });
});

describe('export script', () => {
  it('does not call document write methods', () => {
    const source = readFileSync(
      new URL('../../scripts/exportCollections.ts', import.meta.url),
      'utf8',
    );
    expect(source).not.toMatch(/deleteDocument|updateDocument|createDocument|deleteCollection/);
  });
});
