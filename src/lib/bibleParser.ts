/**
 * Bible Reference Parser
 * Parses Bible references like "1 John 3:16" into structured data
 */

export interface ParsedReference {
  book: string;
  chapter: number;
  verseStart?: number;
  verseEnd?: number;
  original: string;
}

// Book name patterns - handles variations like "1 John", "1John", "I John", "1 Jn"
const BOOK_PATTERNS: Record<string, RegExp> = {
  // Old Testament
  'Genesis': /^(genesis|gen|ge)$/i,
  'Exodus': /^(exodus|exod|ex)$/i,
  'Leviticus': /^(leviticus|lev|le)$/i,
  'Numbers': /^(numbers|num|nu)$/i,
  'Deuteronomy': /^(deuteronomy|deut|de|dt)$/i,
  'Joshua': /^(joshua|josh|jos)$/i,
  'Judges': /^(judges|judg|jdg)$/i,
  'Ruth': /^(ruth|ru)$/i,
  '1 Samuel': /^(1\s*samuel|1\s*sam|1\s*sa|i\s*samuel)$/i,
  '2 Samuel': /^(2\s*samuel|2\s*sam|2\s*sa|ii\s*samuel)$/i,
  '1 Kings': /^(1\s*kings|1\s*ki|i\s*kings)$/i,
  '2 Kings': /^(2\s*kings|2\s*ki|ii\s*kings)$/i,
  '1 Chronicles': /^(1\s*chronicles|1\s*chron|1\s*ch|i\s*chronicles)$/i,
  '2 Chronicles': /^(2\s*chronicles|2\s*chron|2\s*ch|ii\s*chronicles)$/i,
  'Ezra': /^(ezra|ezr)$/i,
  'Nehemiah': /^(nehemiah|neh|ne)$/i,
  'Esther': /^(esther|est|es)$/i,
  'Job': /^(job|jb)$/i,
  'Psalms': /^(psalms?|ps|psa)$/i,
  'Proverbs': /^(proverbs|prov|pr)$/i,
  'Ecclesiastes': /^(ecclesiastes|eccl|ecc|ec)$/i,
  'Song of Solomon': /^(song\s*of\s*solomon|song|sos|so|ss)$/i,
  'Isaiah': /^(isaiah|isa|is)$/i,
  'Jeremiah': /^(jeremiah|jer|je)$/i,
  'Lamentations': /^(lamentations|lam|la)$/i,
  'Ezekiel': /^(ezekiel|ezek|eze|ez)$/i,
  'Daniel': /^(daniel|dan|da|dn)$/i,
  'Hosea': /^(hosea|hos|ho)$/i,
  'Joel': /^(joel|joe|jl)$/i,
  'Amos': /^(amos|am)$/i,
  'Obadiah': /^(obadiah|obad|ob)$/i,
  'Jonah': /^(jonah|jon)$/i,
  'Micah': /^(micah|mic|mi)$/i,
  'Nahum': /^(nahum|nah|na)$/i,
  'Habakkuk': /^(habakkuk|hab)$/i,
  'Zephaniah': /^(zephaniah|zeph|zep)$/i,
  'Haggai': /^(haggai|hag)$/i,
  'Zechariah': /^(zechariah|zech|zec)$/i,
  'Malachi': /^(malachi|mal)$/i,
  // New Testament
  'Matthew': /^(matthew|matt|mat|mt)$/i,
  'Mark': /^(mark|mk|mr)$/i,
  'Luke': /^(luke|lk|lu)$/i,
  'John': /^(john|jn|joh)$/i,
  'Acts': /^(acts|act|ac)$/i,
  'Romans': /^(romans|rom|ro)$/i,
  '1 Corinthians': /^(1\s*corinthians|1\s*cor|1\s*co|i\s*corinthians)$/i,
  '2 Corinthians': /^(2\s*corinthians|2\s*cor|2\s*co|ii\s*corinthians)$/i,
  'Galatians': /^(galatians|gal|ga)$/i,
  'Ephesians': /^(ephesians|eph|ep)$/i,
  'Philippians': /^(philippians|phil|php|pp)$/i,
  'Colossians': /^(colossians|col|co)$/i,
  '1 Thessalonians': /^(1\s*thessalonians|1\s*thess|1\s*th|i\s*thessalonians)$/i,
  '2 Thessalonians': /^(2\s*thessalonians|2\s*thess|2\s*th|ii\s*thessalonians)$/i,
  '1 Timothy': /^(1\s*timothy|1\s*tim|1\s*ti|i\s*timothy)$/i,
  '2 Timothy': /^(2\s*timothy|2\s*tim|2\s*ti|ii\s*timothy)$/i,
  'Titus': /^(titus|tit|ti)$/i,
  'Philemon': /^(philemon|phlm|phm)$/i,
  'Hebrews': /^(hebrews|heb|he)$/i,
  'James': /^(james|jas|ja|jm)$/i,
  '1 Peter': /^(1\s*peter|1\s*pet|1\s*pe|i\s*peter)$/i,
  '2 Peter': /^(2\s*peter|2\s*pet|2\s*pe|ii\s*peter)$/i,
  '1 John': /^(1\s*john|1\s*jn|1\s*jo|i\s*john)$/i,
  '2 John': /^(2\s*john|2\s*jn|2\s*jo|ii\s*john)$/i,
  '3 John': /^(3\s*john|3\s*jn|3\s*jo|iii\s*john)$/i,
  'Jude': /^(jude|jud|jd)$/i,
  'Revelation': /^(revelation|rev|re)$/i,
};

/**
 * Normalize a book name to its standard form
 */
export function normalizeBookName(bookInput: string): string | null {
  const trimmed = bookInput.trim();

  for (const [standardName, pattern] of Object.entries(BOOK_PATTERNS)) {
    if (pattern.test(trimmed)) {
      return standardName;
    }
  }

  return null;
}

/**
 * Parse a Bible reference string into structured data
 * Examples: "1 John 3:16", "Genesis 1:1-3", "Psalm 23"
 */
export function parseReference(ref: string): ParsedReference | null {
  const trimmed = ref.trim();

  // Pattern: Book Chapter:Verse or Book Chapter:Verse-Verse or Book Chapter
  // Handles: "1 John 3:16", "Genesis 1:1-3", "Psalm 23", "1John3:16"
  const pattern = /^(\d?\s*[A-Za-z]+(?:\s+of\s+[A-Za-z]+)?)\s*(\d+)(?::(\d+)(?:-(\d+))?)?$/i;

  const match = trimmed.match(pattern);
  if (!match) {
    return null;
  }

  const [, bookPart, chapterStr, verseStartStr, verseEndStr] = match;

  const book = normalizeBookName(bookPart);
  if (!book) {
    return null;
  }

  const chapter = parseInt(chapterStr, 10);
  const verseStart = verseStartStr ? parseInt(verseStartStr, 10) : undefined;
  const verseEnd = verseEndStr ? parseInt(verseEndStr, 10) : undefined;

  return {
    book,
    chapter,
    verseStart,
    verseEnd,
    original: trimmed,
  };
}

/**
 * Extract just the book name from a reference
 */
export function extractBookName(ref: string): string | null {
  const parsed = parseReference(ref);
  return parsed ? parsed.book : null;
}

/**
 * Format a parsed reference back to a standard string
 */
export function formatReference(parsed: ParsedReference): string {
  let result = `${parsed.book} ${parsed.chapter}`;

  if (parsed.verseStart !== undefined) {
    result += `:${parsed.verseStart}`;
    if (parsed.verseEnd !== undefined) {
      result += `-${parsed.verseEnd}`;
    }
  }

  return result;
}

/**
 * Check if a string looks like a Bible reference
 */
export function isBibleReference(str: string): boolean {
  return parseReference(str) !== null;
}
