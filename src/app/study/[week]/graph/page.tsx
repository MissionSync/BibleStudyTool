'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { KnowledgeGraph } from '@/components/graph/KnowledgeGraph';
import { getStudyWeek } from '@/data/studyPlan';
import type { Node, Edge } from 'reactflow';

// Sample data generator for demonstration
function generateSampleGraphData(weekNumber: number): { nodes: Node[], edges: Edge[] } {
  const week = getStudyWeek(weekNumber);

  if (!week) {
    return { nodes: [], edges: [] };
  }

  // Create book node
  const bookNode: Node = {
    id: 'book-1',
    type: 'book',
    position: { x: 400, y: 50 },
    data: {
      label: week.title,
      description: week.description,
      author: 'Apostle John',
      date: '90-95 AD',
    },
  };

  // Create theme nodes
  const themes = [
    { id: 'theme-love', label: 'Love', color: '#ec4899', position: { x: 100, y: 200 } },
    { id: 'theme-light', label: 'Light', color: '#fbbf24', position: { x: 250, y: 180 } },
    { id: 'theme-fellowship', label: 'Fellowship', color: '#3b82f6', position: { x: 400, y: 160 } },
    { id: 'theme-truth', label: 'Truth', color: '#06b6d4', position: { x: 550, y: 180 } },
    { id: 'theme-sin', label: 'Sin', color: '#ef4444', position: { x: 700, y: 200 } },
  ];

  const themeNodes: Node[] = themes.map(theme => ({
    id: theme.id,
    type: 'theme',
    position: theme.position,
    data: {
      label: theme.label,
      color: theme.color,
      verseCount: Math.floor(Math.random() * 20) + 5,
    },
  }));

  // Create passage nodes
  const passages = [
    { id: 'passage-1', label: '1 John 1', desc: 'Walking in Light', position: { x: 150, y: 350 } },
    { id: 'passage-2', label: '1 John 2', desc: 'Knowing God', position: { x: 300, y: 380 } },
    { id: 'passage-3', label: '1 John 3', desc: 'Children of God', position: { x: 450, y: 360 } },
    { id: 'passage-4', label: '1 John 4', desc: 'God is Love', position: { x: 600, y: 380 } },
  ];

  const passageNodes: Node[] = passages.map(passage => ({
    id: passage.id,
    type: 'passage',
    position: passage.position,
    data: {
      label: passage.label,
      description: passage.desc,
      chapter: passage.label.split(' ')[1],
      verses: '1-10',
    },
  }));

  // Create person nodes
  const personNodes: Node[] = [
    {
      id: 'person-john',
      type: 'person',
      position: { x: 200, y: 520 },
      data: {
        label: 'John the Apostle',
        role: 'Author',
        description: 'The beloved disciple',
      },
    },
    {
      id: 'person-jesus',
      type: 'person',
      position: { x: 500, y: 540 },
      data: {
        label: 'Jesus Christ',
        role: 'Central Figure',
        description: 'The Son of God',
      },
    },
  ];

  // Create edges
  const edges: Edge[] = [
    // Book contains passages
    { id: 'e1', source: 'book-1', target: 'passage-1', type: 'contains' },
    { id: 'e2', source: 'book-1', target: 'passage-2', type: 'contains' },
    { id: 'e3', source: 'book-1', target: 'passage-3', type: 'contains' },
    { id: 'e4', source: 'book-1', target: 'passage-4', type: 'contains' },

    // Passages connected to themes
    { id: 'e5', source: 'passage-1', target: 'theme-light', type: 'theme_connection' },
    { id: 'e6', source: 'passage-1', target: 'theme-fellowship', type: 'theme_connection' },
    { id: 'e7', source: 'passage-2', target: 'theme-truth', type: 'theme_connection' },
    { id: 'e8', source: 'passage-3', target: 'theme-love', type: 'theme_connection' },
    { id: 'e9', source: 'passage-3', target: 'theme-sin', type: 'theme_connection' },
    { id: 'e10', source: 'passage-4', target: 'theme-love', type: 'theme_connection' },

    // Person relationships
    { id: 'e11', source: 'person-john', target: 'book-1', type: 'authored' },
    { id: 'e12', source: 'passage-4', target: 'person-jesus', type: 'about' },
    { id: 'e13', source: 'theme-love', target: 'person-jesus', type: 'about' },

    // Cross-references between passages
    { id: 'e14', source: 'passage-1', target: 'passage-4', type: 'cross_reference' },
    { id: 'e15', source: 'passage-2', target: 'passage-3', type: 'cross_reference' },
  ];

  return {
    nodes: [bookNode, ...themeNodes, ...passageNodes, ...personNodes],
    edges,
  };
}

interface PageProps {
  params: Promise<{ week: string }>;
}

export default function GraphPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const weekNumber = parseInt(resolvedParams.week);
  const week = getStudyWeek(weekNumber);

  const [graphData, setGraphData] = useState<{ nodes: Node[], edges: Edge[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    setLoading(true);

    // Generate sample data
    const data = generateSampleGraphData(weekNumber);

    // Simulate async load
    setTimeout(() => {
      setGraphData(data);
      setLoading(false);
    }, 500);
  }, [weekNumber]);

  if (!week) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Week Not Found
          </h1>
          <Link
            href="/study"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Back to Study Plan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/study/${weekNumber}`}
                className="flex items-center text-blue-600 dark:text-blue-400 hover:underline"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Week {weekNumber}: {week.title}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {week.description || week.reading}
                </p>
              </div>
            </div>

            <Link
              href="/study"
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            >
              All Weeks →
            </Link>
          </div>
        </div>
      </header>

      {/* Graph Container */}
      <div className="flex-1 relative">
        {loading || !graphData ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300">Loading knowledge graph...</p>
            </div>
          </div>
        ) : (
          <KnowledgeGraph
            initialNodes={graphData.nodes}
            initialEdges={graphData.edges}
            studyPlanId={weekNumber.toString()}
            onNodeClick={(node) => {
              console.log('Node clicked:', node);
            }}
            onNodeDoubleClick={(node) => {
              console.log('Node double-clicked:', node);
            }}
          />
        )}
      </div>

      {/* Info Footer */}
      <div className="bg-blue-50 dark:bg-gray-800 border-t border-blue-200 dark:border-gray-700 px-4 py-3">
        <p className="text-sm text-blue-900 dark:text-blue-200 text-center">
          💡 <strong>Tip:</strong> Click nodes to see details • Double-click to expand relationships •
          Use filters to focus on specific content types
        </p>
      </div>
    </div>
  );
}
