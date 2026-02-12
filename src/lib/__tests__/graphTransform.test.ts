import { describe, it, expect, vi } from 'vitest';

vi.mock('../appwrite', () => ({
  databases: {},
  DATABASE_ID: 'test',
  COLLECTIONS: { THEMES: 'themes' },
}));

import { mapEdgeType, calculateNodePositions, type SimpleNode } from '../graphTransform';

describe('mapEdgeType', () => {
  it('maps known edge types', () => {
    expect(mapEdgeType('references')).toBe('contains');
    expect(mapEdgeType('theme_connection')).toBe('theme_connection');
    expect(mapEdgeType('mentions')).toBe('authored');
    expect(mapEdgeType('cross_ref')).toBe('cross_reference');
  });

  it('passes through unknown edge types', () => {
    expect(mapEdgeType('custom_type')).toBe('custom_type');
    expect(mapEdgeType('unknown')).toBe('unknown');
  });
});

describe('calculateNodePositions', () => {
  it('returns positions for all nodes', () => {
    const nodes: SimpleNode[] = [
      { $id: '1', nodeType: 'note' },
      { $id: '2', nodeType: 'book' },
      { $id: '3', nodeType: 'passage' },
    ];
    const positions = calculateNodePositions(nodes);
    expect(positions.size).toBe(3);
    expect(positions.has('1')).toBe(true);
    expect(positions.has('2')).toBe(true);
    expect(positions.has('3')).toBe(true);
  });

  it('groups nodes by type into different y-layers', () => {
    const nodes: SimpleNode[] = [
      { $id: '1', nodeType: 'note' },
      { $id: '2', nodeType: 'book' },
      { $id: '3', nodeType: 'person' },
    ];
    const positions = calculateNodePositions(nodes);
    const noteY = positions.get('1')!.y;
    const bookY = positions.get('2')!.y;
    const personY = positions.get('3')!.y;

    // note layer is above book layer, book is above person
    expect(noteY).toBeLessThan(bookY);
    expect(bookY).toBeLessThan(personY);
  });

  it('handles empty input', () => {
    const positions = calculateNodePositions([]);
    expect(positions.size).toBe(0);
  });

  it('handles unknown node types', () => {
    const nodes: SimpleNode[] = [
      { $id: '1', nodeType: 'custom_type' },
      { $id: '2', nodeType: 'another_type' },
    ];
    const positions = calculateNodePositions(nodes);
    expect(positions.size).toBe(2);
    expect(positions.get('1')).toBeDefined();
    expect(positions.get('2')).toBeDefined();
  });

  it('positions all valid types', () => {
    const types = ['note', 'book', 'passage', 'theme', 'person', 'place'];
    const nodes: SimpleNode[] = types.map((t, i) => ({ $id: String(i), nodeType: t }));
    const positions = calculateNodePositions(nodes);
    expect(positions.size).toBe(6);
    for (const node of nodes) {
      const pos = positions.get(node.$id)!;
      expect(typeof pos.x).toBe('number');
      expect(typeof pos.y).toBe('number');
    }
  });
});
