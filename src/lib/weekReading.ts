import { normalizeBookName, parseReference } from './bibleParser';

/**
 * Split a week's reading into pieces that can be matched to study-map labels
 * and note Bible references. Splits on ";" and "and".
 * "1 and 2 Timothy" stays with the book name on both sides.
 * "2 John, 3 John" splits only when every comma piece is itself a book.
 */
export function splitWeekReading(reading: string): string[] {
  const chunks = reading.split(';').map((part) => part.trim()).filter(Boolean);
  const pieces: string[] = [];

  for (const chunk of chunks) {
    const numberedPair = chunk.match(/^(\d+)\s+and\s+(\d+)\s+(.+)$/i);
    if (numberedPair) {
      const book = numberedPair[3].trim();
      pieces.push(`${numberedPair[1]} ${book}`);
      pieces.push(`${numberedPair[2]} ${book}`);
      continue;
    }

    const commaParts = splitBookList(chunk);
    for (const part of commaParts) {
      const andParts = part.split(/\s+and\s+/i).map((item) => item.trim()).filter(Boolean);
      pieces.push(...andParts);
    }
  }

  return pieces;
}

function splitBookList(chunk: string): string[] {
  const parts = chunk.split(',').map((part) => part.trim()).filter(Boolean);
  if (parts.length <= 1) return [chunk.trim()];
  const everyPartIsABook = parts.every((part) => normalizeBookName(part) !== null);
  return everyPartIsABook ? parts : [chunk.trim()];
}

interface ReadingPiece {
  book: string | null;
  chapterStart: number | null;
  chapterEnd: number | null;
}

function parseReadingPiece(raw: string): ReadingPiece {
  const range = raw.match(/^(.+?)\s+(\d+)\s*[-–]\s*(\d+)$/);
  if (range) {
    return {
      book: normalizeBookName(range[1].trim()),
      chapterStart: Number(range[2]),
      chapterEnd: Number(range[3]),
    };
  }
  return {
    book: normalizeBookName(raw),
    chapterStart: null,
    chapterEnd: null,
  };
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * A bare book name matches a whole-book reading ("Galatians", "1 John").
 * A chapter range ("John 1-7") matches that book only when the text names a
 * chapter inside the range, so later chapters stay out of the week.
 */
export function textMatchesReadingPiece(text: string, pieceRaw: string): boolean {
  const piece = parseReadingPiece(pieceRaw);
  const trimmed = text.trim();
  if (!trimmed) return false;

  if (!piece.book) {
    return pieceRaw.trim().length >= 3 && trimmed.toLowerCase().includes(pieceRaw.trim().toLowerCase());
  }

  const reference = parseReference(trimmed);
  if (reference) {
    if (reference.book !== piece.book) return false;
    if (piece.chapterStart == null || piece.chapterEnd == null) return true;
    return reference.chapter >= piece.chapterStart && reference.chapter <= piece.chapterEnd;
  }

  const bookOnly = normalizeBookName(trimmed);
  if (bookOnly) {
    if (bookOnly !== piece.book) return false;
    return piece.chapterStart == null;
  }

  return textMentionsPiece(trimmed, piece);
}

function textMentionsPiece(text: string, piece: ReadingPiece): boolean {
  if (!piece.book) return false;
  const pattern = new RegExp(
    `(?:^|[^A-Za-z0-9])${escapeRegExp(piece.book)}(?:\\s+(\\d+))?(?![A-Za-z])`,
    'ig',
  );
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    const index = match.index ?? 0;
    const before = text.slice(Math.max(0, index - 3), index);
    if (/\d\s*$/.test(before) && !/^\d/.test(piece.book)) {
      continue;
    }
    const chapter = match[1] ? Number(match[1]) : null;
    if (chapter == null) {
      if (piece.chapterStart == null) return true;
      continue;
    }
    if (piece.chapterStart == null || piece.chapterEnd == null) return true;
    if (chapter >= piece.chapterStart && chapter <= piece.chapterEnd) return true;
  }
  return false;
}

export interface WeekMapItem {
  id: string;
  type?: string;
  label?: string;
  reference?: string;
  bibleReferences?: string[];
}

export interface WeekMapLink {
  source: string;
  target: string;
}

function itemTexts(item: WeekMapItem): string[] {
  const texts: string[] = [];
  if (item.label) texts.push(item.label);
  if (item.reference) texts.push(item.reference);
  if (Array.isArray(item.bibleReferences)) texts.push(...item.bibleReferences);
  return texts;
}

/**
 * Items whose labels or Bible references match the week's reading, plus the
 * items connected to those matches. View-only: nothing is deleted.
 */
export function selectWeekItemIds(
  items: WeekMapItem[],
  links: WeekMapLink[],
  reading: string,
): Set<string> {
  const pieces = splitWeekReading(reading);
  if (pieces.length === 0) return new Set();

  const matches = (item: WeekMapItem) =>
    itemTexts(item).some((text) => pieces.some((piece) => textMatchesReadingPiece(text, piece)));

  const direct = new Set<string>();
  for (const item of items) {
    if (matches(item)) direct.add(item.id);
  }

  const adjacency = new Map<string, string[]>();
  for (const link of links) {
    if (!adjacency.has(link.source)) adjacency.set(link.source, []);
    if (!adjacency.has(link.target)) adjacency.set(link.target, []);
    adjacency.get(link.source)!.push(link.target);
    adjacency.get(link.target)!.push(link.source);
  }

  for (const item of items) {
    if (item.type !== 'note' || direct.has(item.id)) continue;
    const neighbors = adjacency.get(item.id) || [];
    if (neighbors.some((id) => direct.has(id))) direct.add(item.id);
  }

  const kept = new Set(direct);
  for (const id of direct) {
    for (const neighbor of adjacency.get(id) || []) {
      kept.add(neighbor);
    }
  }
  return kept;
}
