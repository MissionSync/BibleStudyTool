import { describe, it, expect, vi } from 'vitest';

vi.mock('../appwrite', () => ({
  databases: {},
  DATABASE_ID: 'test',
  COLLECTIONS: { THEMES: 'themes' },
}));

import {
  mapEdgeType,
  calculateNodePositions,
  calculateNodePositionsManual,
  calculateNodePositionsRadial,
  applyLayoutPreservingSaved,
  type SimpleNode,
  type SimpleEdge,
} from '../graphTransform';

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

describe('calculateNodePositionsManual', () => {
  it('returns positions for all nodes', () => {
    const nodes: SimpleNode[] = [
      { $id: '1', nodeType: 'note' },
      { $id: '2', nodeType: 'book' },
      { $id: '3', nodeType: 'passage' },
    ];
    const positions = calculateNodePositionsManual(nodes);
    expect(positions.size).toBe(3);
  });

  it('groups nodes by type into different y-layers', () => {
    const nodes: SimpleNode[] = [
      { $id: '1', nodeType: 'note' },
      { $id: '2', nodeType: 'book' },
      { $id: '3', nodeType: 'person' },
    ];
    const positions = calculateNodePositionsManual(nodes);
    const noteY = positions.get('1')!.y;
    const bookY = positions.get('2')!.y;
    const personY = positions.get('3')!.y;

    expect(noteY).toBeLessThan(bookY);
    expect(bookY).toBeLessThan(personY);
  });

  it('handles empty input', () => {
    const positions = calculateNodePositionsManual([]);
    expect(positions.size).toBe(0);
  });

  it('handles unknown node types', () => {
    const nodes: SimpleNode[] = [
      { $id: '1', nodeType: 'custom_type' },
      { $id: '2', nodeType: 'another_type' },
    ];
    const positions = calculateNodePositionsManual(nodes);
    expect(positions.size).toBe(2);
    expect(positions.get('1')).toBeDefined();
    expect(positions.get('2')).toBeDefined();
  });

  it('positions all valid types', () => {
    const types = ['note', 'book', 'passage', 'theme', 'person', 'place'];
    const nodes: SimpleNode[] = types.map((t, i) => ({ $id: String(i), nodeType: t }));
    const positions = calculateNodePositionsManual(nodes);
    expect(positions.size).toBe(6);
    for (const node of nodes) {
      const pos = positions.get(node.$id)!;
      expect(typeof pos.x).toBe('number');
      expect(typeof pos.y).toBe('number');
    }
  });
});

describe('calculateNodePositions (with Dagre)', () => {
  it('falls back to manual layout when no edges provided', () => {
    const nodes: SimpleNode[] = [
      { $id: '1', nodeType: 'note' },
      { $id: '2', nodeType: 'book' },
    ];
    const positions = calculateNodePositions(nodes);
    expect(positions.size).toBe(2);
  });

  it('uses Dagre layout when edges are provided', () => {
    const nodes: SimpleNode[] = [
      { $id: 'a', nodeType: 'note' },
      { $id: 'b', nodeType: 'passage' },
      { $id: 'c', nodeType: 'theme' },
    ];
    const edges: SimpleEdge[] = [
      { source: 'a', target: 'b' },
      { source: 'b', target: 'c' },
    ];
    const positions = calculateNodePositions(nodes, edges);
    expect(positions.size).toBe(3);
    // With edges a->b->c, Dagre should produce a top-to-bottom hierarchy
    const aY = positions.get('a')!.y;
    const bY = positions.get('b')!.y;
    const cY = positions.get('c')!.y;
    expect(aY).toBeLessThan(bY);
    expect(bY).toBeLessThan(cY);
  });

  it('handles edges referencing non-existent nodes gracefully', () => {
    const nodes: SimpleNode[] = [
      { $id: '1', nodeType: 'note' },
      { $id: '2', nodeType: 'book' },
    ];
    const edges: SimpleEdge[] = [
      { source: '1', target: '2' },
      { source: '1', target: 'nonexistent' },
    ];
    const positions = calculateNodePositions(nodes, edges);
    expect(positions.size).toBe(2);
  });

  it('handles empty edges array (falls back to manual)', () => {
    const nodes: SimpleNode[] = [
      { $id: '1', nodeType: 'note' },
    ];
    const positions = calculateNodePositions(nodes, []);
    expect(positions.size).toBe(1);
  });
});

describe('applyLayoutPreservingSaved', () => {
  const items = [
    { id: 'saved', nodeType: 'note', position: { x: 12, y: 34 } },
    { id: 'free', nodeType: 'book', position: { x: 3, y: 4 } },
  ];

  it('keeps a saved position and moves items without one', () => {
    const next = applyLayoutPreservingSaved(items, [], 'type', new Set(['saved']));
    expect(next.find((item) => item.id === 'saved')!.position).toEqual({ x: 12, y: 34 });

    const manual = calculateNodePositionsManual([{ $id: 'free', nodeType: 'book' }]);
    const free = next.find((item) => item.id === 'free')!;
    expect(free.position).toEqual(manual.get('free'));
    expect(free.position).not.toEqual({ x: 3, y: 4 });
  });

  it('does not run a new layout when every item already has a saved position', () => {
    const saved = new Set(['saved', 'free']);
    const next = applyLayoutPreservingSaved(
      items,
      [{ source: 'saved', target: 'free' }],
      'connections',
      saved,
    );
    expect(next).toBe(items);
  });

  it('places unsaved items in a circle', () => {
    const next = applyLayoutPreservingSaved(items, [], 'circle', new Set(['saved']));
    const circle = calculateNodePositionsRadial([
      { $id: 'saved', nodeType: 'note' },
      { $id: 'free', nodeType: 'book' },
    ]);
    expect(next.find((item) => item.id === 'saved')!.position).toEqual({ x: 12, y: 34 });
    expect(next.find((item) => item.id === 'free')!.position).toEqual(circle.get('free'));
  });
});
