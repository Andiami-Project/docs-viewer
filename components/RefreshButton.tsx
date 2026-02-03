'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';

export function RefreshButton() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setMessage(null);

    try {
      const response = await fetch('/docs-viewer/api/refresh', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.revalidated) {
        setMessage('✓ Documentation refreshed successfully');
        // Reload the page after short delay to show new docs
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setMessage('✗ Failed to refresh documentation');
      }
    } catch (error) {
      setMessage('✗ Error refreshing documentation');
      console.error('Refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors text-sm font-medium"
        title="Refresh documentation list"
      >
        <RefreshCw
          className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
        />
        {isRefreshing ? 'Refreshing...' : 'Refresh Docs'}
      </button>

      {message && (
        <span className={`text-sm ${message.startsWith('✓') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </span>
      )}
    </div>
  );
}
