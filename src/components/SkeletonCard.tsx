import React from 'react';

/** Card shimmer para modo grade */
export const SkeletonCard: React.FC = () => (
  <div className="flex flex-col items-center justify-center bg-white dark:bg-slate-800 rounded-2xl p-5 min-h-[180px] border-2 border-transparent border-b-[3px] border-b-gray-100 dark:border-b-slate-700 overflow-hidden">
    <div className="w-16 h-16 rounded-full shimmer-bg animate-shimmer mb-3" />
    <div className="h-3 w-20 rounded-full shimmer-bg animate-shimmer mb-1.5" />
    <div className="h-2 w-14 rounded-full shimmer-bg animate-shimmer opacity-60" />
  </div>
);

/** Row shimmer para modo lista */
export const SkeletonListItem: React.FC = () => (
  <div className="flex items-center gap-4 bg-white dark:bg-slate-800 rounded-2xl px-4 py-3.5 border-2 border-transparent">
    <div className="w-11 h-11 rounded-xl shimmer-bg animate-shimmer shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-3 w-36 rounded-full shimmer-bg animate-shimmer" />
      <div className="h-2 w-64 rounded-full shimmer-bg animate-shimmer opacity-60" />
    </div>
    <div className="flex gap-1 shrink-0">
      <div className="w-8 h-8 rounded-xl shimmer-bg animate-shimmer" />
      <div className="w-8 h-8 rounded-xl shimmer-bg animate-shimmer" />
    </div>
  </div>
);

/** Grade de skeletons */
export const SkeletonGrid: React.FC<{ count?: number }> = ({ count = 14 }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4">
    {Array.from({ length: count }, (_, i) => <SkeletonCard key={i} />)}
  </div>
);

/** Lista de skeletons */
export const SkeletonList: React.FC<{ count?: number }> = ({ count = 8 }) => (
  <div className="space-y-2">
    {Array.from({ length: count }, (_, i) => <SkeletonListItem key={i} />)}
  </div>
);

export default SkeletonCard;
