'use client';

import { Skeleton } from './Skeleton';

export function NoteCardSkeleton() {
  return (
    <div
      className="py-5"
      style={{ borderBottom: '1px solid var(--border-light)' }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Title */}
          <Skeleton width="60%" height="1.25rem" className="mb-3" />
          {/* Content lines */}
          <Skeleton width="100%" height="0.875rem" className="mb-2" />
          <Skeleton width="80%" height="0.875rem" className="mb-3" />
          {/* Tags row */}
          <div className="flex gap-2">
            <Skeleton width="4rem" height="1.25rem" />
            <Skeleton width="3rem" height="1.25rem" />
            <Skeleton width="5rem" height="1.25rem" />
          </div>
        </div>
        {/* Action buttons */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <Skeleton width="2.5rem" height="0.875rem" />
          <Skeleton width="3rem" height="0.875rem" />
        </div>
      </div>
    </div>
  );
}
