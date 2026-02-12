import type { Node, Edge } from 'reactflow';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportGraphAsJSON(nodes: Node[], edges: Edge[]) {
  const data = {
    nodes: nodes.map((n) => ({
      id: n.id,
      type: n.type,
      label: n.data.label,
      description: n.data.description,
    })),
    edges: edges.map((e) => ({
      source: e.source,
      target: e.target,
      type: e.type,
    })),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  downloadBlob(blob, 'graph-export.json');
}

export function exportGraphAsCSV(nodes: Node[], edges: Edge[]) {
  const lines: string[] = [];

  // Nodes section
  lines.push('# Nodes');
  lines.push('id,type,label,description');
  for (const n of nodes) {
    const desc = (n.data.description || '').replace(/"/g, '""');
    const label = (n.data.label || '').replace(/"/g, '""');
    lines.push(`"${n.id}","${n.type || ''}","${label}","${desc}"`);
  }

  lines.push('');

  // Edges section
  lines.push('# Edges');
  lines.push('source,target,type');
  for (const e of edges) {
    lines.push(`"${e.source}","${e.target}","${e.type || ''}"`);
  }

  const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
  downloadBlob(blob, 'graph-export.csv');
}
