import { describe, it, expect } from 'vitest';
import { splitWeekReading, textMatchesReadingPiece, selectWeekItemIds } from '../weekReading';

describe('splitWeekReading', () => {
  it('splits on semicolons', () => {
    expect(splitWeekReading('Galatians; Philemon')).toEqual(['Galatians', 'Philemon']);
  });

  it('keeps the book name on both sides of "1 and 2"', () => {
    expect(splitWeekReading('1 and 2 Timothy')).toEqual(['1 Timothy', '2 Timothy']);
  });

  it('leaves a chapter range as one piece', () => {
    expect(splitWeekReading('John 1-7')).toEqual(['John 1-7']);
  });

  it('splits a semicolon list and comma-separated books', () => {
    expect(splitWeekReading('Titus; 2 John, 3 John')).toEqual(['Titus', '2 John', '3 John']);
  });
});

describe('textMatchesReadingPiece', () => {
  it('matches a verse inside a chapter range', () => {
    expect(textMatchesReadingPiece('John 3:16', 'John 1-7')).toBe(true);
    expect(textMatchesReadingPiece('John 20:1', 'John 1-7')).toBe(false);
  });

  it('does not treat 1 John as the gospel of John', () => {
    expect(textMatchesReadingPiece('1 John 1:5', '1 John')).toBe(true);
    expect(textMatchesReadingPiece('1 John 1:5', 'John 1-7')).toBe(false);
    expect(textMatchesReadingPiece('John', '1 John')).toBe(false);
  });

  it('matches a note reference and a book label', () => {
    expect(textMatchesReadingPiece('Galatians 2:20', 'Galatians')).toBe(true);
    expect(textMatchesReadingPiece('Galatians', 'Galatians')).toBe(true);
  });
});

describe('selectWeekItemIds', () => {
  const items = [
    { id: 'note1', type: 'note', label: 'Morning thoughts', bibleReferences: ['John 3:16'] },
    { id: 'pass1', type: 'passage', label: 'John 3:16' },
    { id: 'book1', type: 'book', label: 'John' },
    { id: 'theme1', type: 'theme', label: 'Light' },
    { id: 'pass2', type: 'passage', label: 'Romans 8:1' },
    { id: 'note2', type: 'note', label: 'Romans notes', bibleReferences: ['Romans 8:1'] },
  ];
  const links = [
    { source: 'note1', target: 'pass1' },
    { source: 'pass1', target: 'book1' },
    { source: 'note1', target: 'theme1' },
    { source: 'note2', target: 'pass2' },
  ];

  it('keeps the week matches and the items connected to them', () => {
    const ids = selectWeekItemIds(items, links, 'John 1-7');
    expect(ids.has('note1')).toBe(true);
    expect(ids.has('pass1')).toBe(true);
    expect(ids.has('book1')).toBe(true);
    expect(ids.has('theme1')).toBe(true);
    expect(ids.has('note2')).toBe(false);
    expect(ids.has('pass2')).toBe(false);
  });

  it('can include a note from a connected verse label alone', () => {
    const ids = selectWeekItemIds(
      items.map((item) => item.id === 'note1' ? { ...item, bibleReferences: undefined } : item),
      links,
      'John 1-7',
    );
    expect(ids.has('note1')).toBe(true);
    expect(ids.has('theme1')).toBe(true);
    expect(ids.has('note2')).toBe(false);
  });
});
