'use client';

import { useState, useRef, useEffect } from 'react';
import { Copy, Check, Package, FileText, Clock } from 'lucide-react';

interface ProjectHeroProps {
  displayName: string;
  description: string;
  category: string;
  stats: {
    totalDocs: number;
    lastUpdated: string;
    components: number;
  };
  installCommand?: string;
}

export function ProjectHero({
  displayName,
  description,
  category,
  stats,
  installCommand
}: ProjectHeroProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleCopy = () => {
    if (installCommand) {
      navigator.clipboard.writeText(installCommand);
      setCopied(true);

      // Clear existing timeout if any
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout and store reference
      timeoutRef.current = setTimeout(() => {
        setCopied(false);
        timeoutRef.current = null;
      }, 2000);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Category-based solid colors (no gradients per UI guidelines)
  const colors: Record<string, string> = {
    frontend: 'bg-blue-600 dark:bg-blue-700',
    backend: 'bg-green-600 dark:bg-green-700',
    infrastructure: 'bg-gray-700 dark:bg-gray-800',
    tools: 'bg-orange-600 dark:bg-orange-700',
    default: 'bg-indigo-600 dark:bg-indigo-700',
  };

  const color = colors[category.toLowerCase()] || colors.default;

  return (
    <div className={`relative overflow-hidden ${color} text-white rounded-2xl p-6 md:p-12 mb-8`}>
      {/* Background decoration - subtle pattern only */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      {/* Content */}
      <div className="relative z-10">
        {/* Category badge */}
        <div className="inline-block px-3 py-1 mb-4 text-sm font-medium bg-white/20 backdrop-blur-sm rounded-full">
          {category}
        </div>

        {/* Title & Description */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-balance">
          {displayName}
        </h1>
        <p className="text-lg md:text-xl lg:text-2xl text-white/90 mb-6 md:mb-8 text-pretty max-w-3xl">
          {description}
        </p>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard
            icon={<FileText className="w-5 h-5" />}
            label="Documentation Files"
            value={stats.totalDocs.toString()}
          />
          <StatCard
            icon={<Package className="w-5 h-5" />}
            label="Components"
            value={stats.components.toString()}
          />
          <StatCard
            icon={<Clock className="w-5 h-5" />}
            label="Last Updated"
            value={stats.lastUpdated}
          />
        </div>

        {/* Install Command */}
        {installCommand && (
          <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <code className="flex-1 text-sm md:text-base font-mono text-white/95 break-all">
              {installCommand}
            </code>
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-200 backdrop-blur-sm"
              aria-label={copied ? "Copied!" : "Copy install command"}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span className="text-sm font-medium">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span className="text-sm font-medium">Copy</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
      <div className="flex items-center gap-2 mb-2 text-white/70">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="text-2xl font-bold tabular-nums">{value}</div>
    </div>
  );
}
