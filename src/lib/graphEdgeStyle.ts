/**
 * Stroke styles for study-map connections.
 * Display types come from mapEdgeType. Stored `references` is shown as `contains`,
 * and the legend calls that relationship "links to".
 */
export function getEdgeStyle(edgeType: string): {
  stroke: string;
  strokeWidth: number;
  strokeDasharray?: string;
} {
  const styles: Record<string, { stroke: string; strokeWidth: number; strokeDasharray?: string }> = {
    contains: {
      stroke: 'var(--border-medium)',
      strokeWidth: 1,
    },
    references: {
      stroke: 'var(--node-book)',
      strokeWidth: 1,
      strokeDasharray: '4,4',
    },
    theme_connection: {
      stroke: 'var(--node-theme)',
      strokeWidth: 1,
    },
    cross_reference: {
      stroke: 'var(--node-passage)',
      strokeWidth: 1,
      strokeDasharray: '3,3',
    },
    authored: {
      stroke: 'var(--node-person)',
      strokeWidth: 1,
    },
    about: {
      stroke: 'var(--node-note)',
      strokeWidth: 1,
    },
  };

  return styles[edgeType] || { stroke: 'var(--border-light)', strokeWidth: 1 };
}
