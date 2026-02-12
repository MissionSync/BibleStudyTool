'use client';

import { useCallback, useRef } from 'react';
import type { Node } from 'reactflow';

function storageKey(userId: string) {
  return `graphPositions:${userId}`;
}

export function getSavedPositions(userId: string): Record<string, { x: number; y: number }> {
  try {
    const stored = localStorage.getItem(storageKey(userId));
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }
  return {};
}

export function clearPositions(userId: string) {
  try {
    localStorage.removeItem(storageKey(userId));
  } catch {
    // Ignore storage errors
  }
}

export function useGraphPositions(userId: string | undefined) {
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const savePositions = useCallback((nodes: Node[]) => {
    if (!userId) return;

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      const positions: Record<string, { x: number; y: number }> = {};
      for (const node of nodes) {
        positions[node.id] = { x: node.position.x, y: node.position.y };
      }
      try {
        localStorage.setItem(storageKey(userId), JSON.stringify(positions));
      } catch {
        // Ignore storage errors
      }
    }, 500);
  }, [userId]);

  return { savePositions };
}
