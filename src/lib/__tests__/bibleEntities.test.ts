import { describe, it, expect } from 'vitest';
import { findPeopleInText, findPlacesInText } from '../bibleEntities';

describe('findPeopleInText', () => {
  it('finds a single person by name', () => {
    const result = findPeopleInText('Abraham went to the land');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Abraham');
  });

  it('finds multiple people', () => {
    const result = findPeopleInText('Moses and Aaron led the people');
    const names = result.map((p) => p.name);
    expect(names).toContain('Moses');
    expect(names).toContain('Aaron');
  });

  it('finds person by alias', () => {
    const result = findPeopleInText('Abram journeyed to Egypt');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Abraham');
  });

  it('deduplicates when name and alias both appear', () => {
    const result = findPeopleInText('Jesus Christ is the Messiah and Savior');
    const jesusResults = result.filter((p) => p.name === 'Jesus');
    expect(jesusResults).toHaveLength(1);
  });

  it('respects word boundaries - "Marksman" should NOT match "Mark"', () => {
    const result = findPeopleInText('The marksman shot well');
    const names = result.map((p) => p.name);
    expect(names).not.toContain('Mark');
  });

  it('returns empty array for empty text', () => {
    expect(findPeopleInText('')).toEqual([]);
  });

  it('returns empty array for text with no entities', () => {
    expect(findPeopleInText('The weather is nice today')).toEqual([]);
  });

  it('finds people case-insensitively', () => {
    const result = findPeopleInText('MOSES spoke to the people');
    expect(result.map((p) => p.name)).toContain('Moses');
  });

  it('finds multi-word names like "John the Baptist"', () => {
    const result = findPeopleInText('John the Baptist preached in the wilderness');
    const names = result.map((p) => p.name);
    expect(names).toContain('John the Baptist');
  });

  it('finds Pontius Pilate by alias "Pilate"', () => {
    const result = findPeopleInText('Pilate washed his hands');
    expect(result.map((p) => p.name)).toContain('Pontius Pilate');
  });

  it('"Lord" alone does NOT match Jesus (removed as too generic)', () => {
    const result = findPeopleInText('The Lord is my shepherd');
    const names = result.map((p) => p.name);
    expect(names).not.toContain('Jesus');
  });

  it('"Simon" alone does NOT match Peter, but "Simon Peter" does', () => {
    const onlySimon = findPeopleInText('Simon was a common name');
    expect(onlySimon.map((p) => p.name)).not.toContain('Peter');

    const simonPeter = findPeopleInText('Simon Peter followed Jesus');
    expect(simonPeter.map((p) => p.name)).toContain('Peter');
  });

  it('"Israel" does NOT match Jacob (removed as ambiguous)', () => {
    const result = findPeopleInText('The nation of Israel was strong');
    const names = result.map((p) => p.name);
    expect(names).not.toContain('Jacob');
  });

  it('returns empty for text shorter than 3 characters', () => {
    expect(findPeopleInText('Jo')).toEqual([]);
    expect(findPeopleInText('AB')).toEqual([]);
  });
});

describe('findPlacesInText', () => {
  it('finds a single place', () => {
    const result = findPlacesInText('They traveled to Jerusalem');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Jerusalem');
  });

  it('finds multiple places', () => {
    const result = findPlacesInText('From Jerusalem to Bethlehem');
    const names = result.map((p) => p.name);
    expect(names).toContain('Jerusalem');
    expect(names).toContain('Bethlehem');
  });

  it('finds place by alias', () => {
    const result = findPlacesInText('The city of Zion');
    expect(result.map((p) => p.name)).toContain('Jerusalem');
  });

  it('respects word boundaries', () => {
    const result = findPlacesInText('The roman empire');
    // "roman" should not match "Rome" since \brome\b won't match "roman"
    const names = result.map((p) => p.name);
    expect(names).not.toContain('Rome');
  });

  it('returns empty array for empty text', () => {
    expect(findPlacesInText('')).toEqual([]);
  });

  it('returns empty array for text with no places', () => {
    expect(findPlacesInText('The weather is nice today')).toEqual([]);
  });

  it('deduplicates when name and alias both appear', () => {
    const result = findPlacesInText('From Jerusalem, the city of Zion');
    const jerusalemResults = result.filter((p) => p.name === 'Jerusalem');
    expect(jerusalemResults).toHaveLength(1);
  });

  it('"Israel" matches as a place, not as a person alias', () => {
    const places = findPlacesInText('The land of Israel');
    expect(places.map((p) => p.name)).toContain('Israel');
  });

  it('returns empty for text shorter than 3 characters', () => {
    expect(findPlacesInText('AB')).toEqual([]);
  });
});
