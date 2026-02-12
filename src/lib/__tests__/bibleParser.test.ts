import { describe, it, expect } from 'vitest';
import {
  normalizeBookName,
  parseReference,
  extractBookName,
  formatReference,
  isBibleReference,
} from '../bibleParser';

describe('normalizeBookName', () => {
  it('returns standard name for full book name', () => {
    expect(normalizeBookName('Genesis')).toBe('Genesis');
    expect(normalizeBookName('Revelation')).toBe('Revelation');
  });

  it('normalizes common abbreviations', () => {
    expect(normalizeBookName('Gen')).toBe('Genesis');
    expect(normalizeBookName('Ex')).toBe('Exodus');
    expect(normalizeBookName('Mt')).toBe('Matthew');
    expect(normalizeBookName('Rev')).toBe('Revelation');
  });

  it('normalizes short abbreviations', () => {
    expect(normalizeBookName('Jn')).toBe('John');
    expect(normalizeBookName('Mk')).toBe('Mark');
    expect(normalizeBookName('Lk')).toBe('Luke');
    expect(normalizeBookName('Ps')).toBe('Psalms');
  });

  it('handles numbered books', () => {
    expect(normalizeBookName('1 John')).toBe('1 John');
    expect(normalizeBookName('2 Samuel')).toBe('2 Samuel');
    expect(normalizeBookName('1 Cor')).toBe('1 Corinthians');
  });

  it('handles Roman numeral prefixes', () => {
    expect(normalizeBookName('I Samuel')).toBe('1 Samuel');
    expect(normalizeBookName('II Samuel')).toBe('2 Samuel');
    expect(normalizeBookName('I John')).toBe('1 John');
  });

  it('is case insensitive', () => {
    expect(normalizeBookName('genesis')).toBe('Genesis');
    expect(normalizeBookName('GENESIS')).toBe('Genesis');
    expect(normalizeBookName('gEn')).toBe('Genesis');
  });

  it('returns null for invalid input', () => {
    expect(normalizeBookName('')).toBe(null);
    expect(normalizeBookName('NotABook')).toBe(null);
    expect(normalizeBookName('Hello')).toBe(null);
  });

  it('trims whitespace', () => {
    expect(normalizeBookName('  Gen  ')).toBe('Genesis');
  });

  it('normalizes Song of Solomon', () => {
    expect(normalizeBookName('Song of Solomon')).toBe('Song of Solomon');
    expect(normalizeBookName('Song')).toBe('Song of Solomon');
    expect(normalizeBookName('SOS')).toBe('Song of Solomon');
  });
});

describe('parseReference', () => {
  it('parses full reference with book, chapter, and verse', () => {
    const result = parseReference('1 John 3:16');
    expect(result).toEqual({
      book: '1 John',
      chapter: 3,
      verseStart: 16,
      verseEnd: undefined,
      original: '1 John 3:16',
    });
  });

  it('parses chapter-only reference', () => {
    const result = parseReference('Psalm 23');
    expect(result).toEqual({
      book: 'Psalms',
      chapter: 23,
      verseStart: undefined,
      verseEnd: undefined,
      original: 'Psalm 23',
    });
  });

  it('parses verse range', () => {
    const result = parseReference('Genesis 1:1-3');
    expect(result).toEqual({
      book: 'Genesis',
      chapter: 1,
      verseStart: 1,
      verseEnd: 3,
      original: 'Genesis 1:1-3',
    });
  });

  it('parses reference without spaces in numbered books', () => {
    const result = parseReference('1John3:16');
    expect(result).toEqual({
      book: '1 John',
      chapter: 3,
      verseStart: 16,
      verseEnd: undefined,
      original: '1John3:16',
    });
  });

  it('parses abbreviation-based references', () => {
    const result = parseReference('Gen 1:1');
    expect(result).toEqual({
      book: 'Genesis',
      chapter: 1,
      verseStart: 1,
      verseEnd: undefined,
      original: 'Gen 1:1',
    });
  });

  it('returns null for invalid strings', () => {
    expect(parseReference('')).toBe(null);
    expect(parseReference('Hello World')).toBe(null);
    expect(parseReference('Not a reference')).toBe(null);
  });

  it('trims whitespace', () => {
    const result = parseReference('  John 3:16  ');
    expect(result).not.toBe(null);
    expect(result!.book).toBe('John');
  });
});

describe('extractBookName', () => {
  it('extracts book name from a full reference', () => {
    expect(extractBookName('John 3:16')).toBe('John');
    expect(extractBookName('1 John 3:16')).toBe('1 John');
    expect(extractBookName('Genesis 1:1-3')).toBe('Genesis');
  });

  it('returns null for invalid references', () => {
    expect(extractBookName('Hello')).toBe(null);
    expect(extractBookName('')).toBe(null);
  });
});

describe('formatReference', () => {
  it('formats reference with book and chapter only', () => {
    expect(formatReference({ book: 'Psalms', chapter: 23, original: '' })).toBe('Psalms 23');
  });

  it('formats reference with verse', () => {
    expect(formatReference({ book: 'John', chapter: 3, verseStart: 16, original: '' })).toBe('John 3:16');
  });

  it('formats reference with verse range', () => {
    expect(formatReference({ book: 'Genesis', chapter: 1, verseStart: 1, verseEnd: 3, original: '' })).toBe('Genesis 1:1-3');
  });

  it('round-trips correctly through parse and format', () => {
    const original = 'Genesis 1:1-3';
    const parsed = parseReference(original)!;
    expect(formatReference(parsed)).toBe(original);
  });
});

describe('isBibleReference', () => {
  it('returns true for valid references', () => {
    expect(isBibleReference('John 3:16')).toBe(true);
    expect(isBibleReference('Genesis 1')).toBe(true);
    expect(isBibleReference('1 John 2:1-5')).toBe(true);
    expect(isBibleReference('Ps 23')).toBe(true);
  });

  it('returns false for non-references', () => {
    expect(isBibleReference('')).toBe(false);
    expect(isBibleReference('Hello World')).toBe(false);
    expect(isBibleReference('random text 123')).toBe(false);
  });
});
