import React from 'react';

interface SkeletonLoaderProps {
    isDarkMode?: boolean;
    type?: 'dashboard' | 'list' | 'detail' | 'default';
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ isDarkMode = false, type = 'default' }) => {
    const shimmerClass = isDarkMode
        ? 'bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800'
        : 'bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200';

    const baseClass = isDarkMode ? 'bg-slate-800' : 'bg-slate-200';

    const Shimmer = ({ className, style }: { className: string; style?: React.CSSProperties }) => (
        <div
            className={`${className} ${shimmerClass} rounded-[20px] animate-pulse`}
            style={{ backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', ...style }}
        />
    );

    if (type === 'dashboard') {
        return (
            <div className="space-y-6 animate-in fade-in duration-300">
                {/* Stat Cards Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className={`p-6 rounded-[24px] ${baseClass} animate-pulse`}
                            style={{ animationDelay: `${i * 100}ms` }}
                        >
                            <Shimmer className="h-4 w-24 mb-4" />
                            <Shimmer className="h-10 w-20 mb-2" />
                            <Shimmer className="h-3 w-32" />
                        </div>
                    ))}
                </div>

                {/* Charts Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[1, 2].map((i) => (
                        <div
                            key={i}
                            className={`p-8 rounded-[32px] ${baseClass} animate-pulse h-80`}
                            style={{ animationDelay: `${(i + 4) * 100}ms` }}
                        >
                            <Shimmer className="h-6 w-40 mb-6" />
                            <div className="flex items-end justify-between h-48 pt-8">
                                {[1, 2, 3, 4, 5, 6].map((j) => (
                                    <Shimmer
                                        key={j}
                                        className={`w-8 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-300'}`}
                                        style={{ height: `${30 + Math.random() * 70}%` } as any}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (type === 'list') {
        return (
            <div className="space-y-4 animate-in fade-in duration-300">
                {/* Header Skeleton */}
                <div className={`p-6 rounded-[24px] ${baseClass} animate-pulse`}>
                    <div className="flex justify-between items-center">
                        <Shimmer className="h-8 w-48" />
                        <Shimmer className="h-10 w-32" />
                    </div>
                </div>

                {/* List Items Skeleton */}
                {[1, 2, 3, 4, 5].map((i) => (
                    <div
                        key={i}
                        className={`p-5 rounded-[20px] ${baseClass} animate-pulse`}
                        style={{ animationDelay: `${i * 80}ms` }}
                    >
                        <div className="flex items-center gap-4">
                            <Shimmer className="w-12 h-12 rounded-full" />
                            <div className="flex-1 space-y-3">
                                <Shimmer className="h-5 w-3/4" />
                                <Shimmer className="h-4 w-1/2" />
                            </div>
                            <Shimmer className="h-8 w-24 rounded-full" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // Default skeleton
    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className={`p-8 rounded-[32px] ${baseClass} animate-pulse`}>
                <Shimmer className="h-8 w-64 mb-6" />
                <div className="space-y-4">
                    <Shimmer className="h-4 w-full" />
                    <Shimmer className="h-4 w-5/6" />
                    <Shimmer className="h-4 w-4/6" />
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2].map((i) => (
                    <div
                        key={i}
                        className={`p-8 rounded-[32px] ${baseClass} animate-pulse h-64`}
                        style={{ animationDelay: `${i * 100}ms` }}
                    >
                        <Shimmer className="h-6 w-32 mb-4" />
                        <Shimmer className="h-40 w-full" />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SkeletonLoader;
