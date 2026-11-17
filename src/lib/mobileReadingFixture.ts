import type { Note } from '@/lib/appwrite/notes';

/** Development-only token for /share screenshots. Longer than the route minimum. */
export const MOBILE_PREVIEW_SHARE_TOKEN = 'preview-mobile-note';

export interface SharedNoteFixture {
  title: string;
  content: string;
  bibleReferences: string[];
  tags: string[];
  createdAt: string;
}

const LONG_TITLE =
  'When the morning stars sang together: a meditation on Job 38 and the long obedience of paying attention';

const NOTE_HTML = [
  '<p>Where were you when I laid the foundation of the earth? Tell me, if you have understanding. Who determined its measurements? Surely you know.</p>',
  '<p>This paragraph is the body of the note. On a phone it should sit at a comfortable size, with a line height you can follow and enough contrast that the sentence does not dissolve into the page. John 3:16 still belongs in the margin of the heart.</p>',
  '<p>The verse chips above include a reference with no spaces, SongofSolomon2:10-13WithoutSpaces, so a narrow screen has to wrap the chip instead of growing the page sideways.</p>',
].join('');

const NOTE_PLAIN = NOTE_HTML.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

export const mobilePreviewSharedNote: SharedNoteFixture = {
  title: LONG_TITLE,
  content: NOTE_HTML,
  bibleReferences: [
    'Job 38:4-7',
    'John 3:16',
    '1 Thessalonians 5:16-18',
    'SongofSolomon2:10-13WithoutSpaces',
  ],
  tags: ['creation', 'attention', 'steadfast-love-that-runs-longer-than-the-line'],
  createdAt: '2024-03-15T12:00:00.000Z',
};

function fixtureDocument(id: string, createdAt: string): Pick<
  Note,
  '$id' | '$collectionId' | '$databaseId' | '$createdAt' | '$updatedAt' | '$permissions' | '$sequence'
> {
  return {
    $id: id,
    $collectionId: 'notes',
    $databaseId: 'fixture',
    $createdAt: createdAt,
    $updatedAt: createdAt,
    $permissions: [],
    $sequence: 0,
  };
}

export const mobilePreviewNotes: Note[] = [
  {
    ...fixtureDocument('fixture-note-long', mobilePreviewSharedNote.createdAt),
    title: LONG_TITLE,
    content: NOTE_HTML,
    contentPlan: NOTE_PLAIN,
    userId: 'fixture-user',
    bibleReferences: mobilePreviewSharedNote.bibleReferences,
    tags: mobilePreviewSharedNote.tags,
    isArchived: false,
    shareToken: MOBILE_PREVIEW_SHARE_TOKEN,
  },
  {
    ...fixtureDocument('fixture-note-short', '2024-06-02T15:30:00.000Z'),
    title: 'Psalm 23 beside still water',
    content: '<p>He leads me beside still waters. He restores my soul.</p>',
    contentPlan: 'He leads me beside still waters. He restores my soul.',
    userId: 'fixture-user',
    bibleReferences: ['Psalm 23:1-3'],
    tags: ['trust'],
    isArchived: false,
    shareToken: null,
  },
  {
    ...fixtureDocument('fixture-note-archived', '2023-11-01T08:00:00.000Z'),
    title: 'Archived: notes on the vine and the branches',
    content: '<p>Abide in me, and I in you.</p>',
    contentPlan: 'Abide in me, and I in you. An archived note kept so the archived tab can be checked.',
    userId: 'fixture-user',
    bibleReferences: ['John 15:4-5'],
    tags: ['abide'],
    isArchived: true,
    shareToken: null,
  },
];

/** Real share tokens still go to Appwrite. This preview exists only in development. */
export function fixtureSharedNote(
  token: string,
  nodeEnv: string | undefined,
): SharedNoteFixture | null {
  if (nodeEnv !== 'development') return null;
  if (token !== MOBILE_PREVIEW_SHARE_TOKEN) return null;
  return mobilePreviewSharedNote;
}

/** Notes list preview. Production never treats the query as a fixture. */
export function isDevMobileFixture(
  nodeEnv: string | undefined,
  search: string,
): boolean {
  if (nodeEnv !== 'development') return false;
  return new URLSearchParams(search).get('fixture') === '1';
}
