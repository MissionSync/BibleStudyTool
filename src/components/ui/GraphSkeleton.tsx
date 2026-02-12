'use client';

import { Skeleton } from './Skeleton';

export function GraphSkeleton() {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{ backgroundColor: 'var(--bg-secondary)' }}
    >
      <div style={{ width: '80%', maxWidth: '600px' }}>
        {/* Simulated graph nodes */}
        <div className="flex justify-center gap-8 mb-8">
          <Skeleton width="120px" height="48px" />
          <Skeleton width="120px" height="48px" />
        </div>
        <div className="flex justify-center gap-12 mb-8">
          <Skeleton width="100px" height="40px" />
          <Skeleton width="100px" height="40px" />
          <Skeleton width="100px" height="40px" />
        </div>
        <div className="flex justify-center gap-8">
          <Skeleton width="110px" height="44px" />
          <Skeleton width="110px" height="44px" />
        </div>
      </div>
    </div>
  );
}
