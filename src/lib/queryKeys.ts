export const queryKeys = {
  notes: {
    list: (userId: string) => ['notes', 'list', userId] as const,
  },
  graph: {
    full: (userId: string) => ['graph', 'full', userId] as const,
  },
  themes: {
    list: () => ['themes', 'list'] as const,
  },
};
