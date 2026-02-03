# Docs Viewer - Complete Fix & Auto-Discovery Design

**Date:** 2026-02-03
**Status:** Approved - Ready for Implementation
**Estimated Time:** 3-4 hours

---

## Overview

Complete redesign to fix all critical issues + add auto-discovery for new markdown files without server restart.

### Problems Being Solved

1. ❌ **Broken Images** - All project thumbnails 404
2. ❌ **Incomplete Document Discovery** - Only 17/100+ docs showing
3. ❌ **Build Failures** - Production build failing
4. ❌ **No Auto-Discovery** - New files require server restart
5. ❌ **Poor UX** - Non-functional search, confusing navigation

### Solution Approach

**Hybrid Auto-Discovery:**
- Next.js ISR with 30-second revalidation (automatic refresh)
- Manual "Refresh Docs" button (instant refresh)
- No file watchers or WebSockets required (simple, reliable)

---

## Architecture Changes

### Before (Broken)
```typescript
// Static file scanning - cached forever
const files = getAllMarkdownFiles(projectRoot);

// Aggressive directory skipping
if (entry.name === 'node_modules' || entry.name === '.git' ||
    entry.name === '.next' || entry.name === 'dist') {
  continue;  // Skips docs/, .github/, .omc/
}

// No refresh mechanism
```

### After (Fixed)
```typescript
// Dynamic scanning with 30s cache
export const revalidate = 30;
const files = await getAllMarkdownFiles(projectRoot);

// Minimal skip list (only build artifacts)
const SKIP_DIRECTORIES = new Set([
  'node_modules', '.git', '.next', 'dist', 'build',
  'out', '.vercel', '.turbo', 'coverage'
]);
// Includes: docs/, .github/, .omc/

// Manual refresh via API
POST /api/refresh → revalidatePath() → reload
```

---

## Implementation Plan

### Phase 1: Critical Fixes (1.5 hours)

#### Task 1.1: Fix Broken Images (15 min)
**File:** `app/page.tsx`

**Changes:**
```typescript
// Line 85 - Logo image
- src="/docs-viewer/genie-logo.png"
+ src="/genie-logo.png"

// Line 190 - Project thumbnails
- src={`/docs-viewer/${project.name}.png`}
+ src={`/${project.name}.png`}

// Better: Use Next.js Image component
import Image from 'next/image';

<Image
  src="/genie-logo.png"
  alt="As You Wish Logo"
  width={192}
  height={192}
  className="w-full h-full object-contain"
/>
```

**Verification:**
```bash
# After fix, images should load:
curl -I https://y1.andiami.tech/docs-viewer/genie-logo.png
# Should return 200, not 404
```

#### Task 1.2: Fix Build Errors (30 min)
**File:** `app/page.tsx`

**Add keys to all .map() calls:**
```typescript
// Line 176 - Project cards
{category.projects.map((project) => (
  <Link
    key={project.name}  // ADD THIS
    href={`/project/${project.name}`}
    // ...
  >
))}
```

**File:** `app/global-error.tsx` or `app/error.tsx`

**Add 'use client' directive:**
```typescript
'use client';

export default function GlobalError() {
  // Component code
}
```

**Verification:**
```bash
npm run build
# Should complete without errors
```

#### Task 1.3: Fix Document Discovery (45 min)
**File:** `lib/project-metadata.ts`

**Replace getAllMarkdownFiles() function:**
```typescript
const SKIP_DIRECTORIES = new Set([
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
  'out',
  '.vercel',
  '.turbo',
  'coverage',
]);

function getAllMarkdownFiles(dir: string): string[] {
  const files: string[] = [];
  let skippedCount = 0;
  let foundCount = 0;

  function traverse(currentPath: string, depth: number = 0) {
    try {
      const entries = fs.readdirSync(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);

        // Only skip known build directories
        if (entry.isDirectory() && SKIP_DIRECTORIES.has(entry.name)) {
          skippedCount++;
          continue;
        }

        if (entry.isDirectory()) {
          traverse(fullPath, depth + 1);
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          files.push(fullPath);
          foundCount++;
        }
      }
    } catch (err) {
      console.error(`Cannot read ${currentPath}:`, err);
    }
  }

  traverse(dir);
  console.log(`[Discovery] Found ${foundCount} files, skipped ${skippedCount} dirs in ${dir}`);
  return files;
}
```

**Verification:**
```bash
# Check logs for file counts
npm run dev
# Visit /docs-viewer/project/wish-x
# Should see 40+ documents (not 17)
```

### Phase 2: Auto-Discovery (1 hour)

#### Task 2.1: Add API Route (20 min)
**File:** `app/api/refresh/route.ts` (NEW)

```typescript
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { projectName } = await request.json();

    if (projectName) {
      revalidatePath(`/project/${projectName}`);
      revalidatePath(`/project/${projectName}/docs-list`);
    } else {
      revalidatePath('/');
      revalidatePath('/project/[projectName]', 'page');
    }

    return NextResponse.json({
      success: true,
      message: 'Cache cleared',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Refresh failed'
    }, { status: 500 });
  }
}
```

#### Task 2.2: Create Refresh Button Component (20 min)
**File:** `components/refresh-button.tsx` (NEW)

```typescript
'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';

export function RefreshButton({ projectName }: { projectName?: string }) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);

    try {
      await fetch('/docs-viewer/api/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectName })
      });

      window.location.reload();
    } catch (error) {
      console.error('Refresh failed:', error);
      setIsRefreshing(false);
    }
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={isRefreshing}
      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
    >
      <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      {isRefreshing ? 'Refreshing...' : 'Refresh Docs'}
    </button>
  );
}
```

#### Task 2.3: Add ISR Revalidation (20 min)
**File:** `app/project/[projectName]/docs-list/[[...slug]]/page.tsx`

```typescript
// Add at top of file
export const revalidate = 30; // Revalidate every 30 seconds

// Add RefreshButton to header
import { RefreshButton } from '@/components/refresh-button';

export default async function DocsListPage({ params }: { params: { projectName: string } }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Breadcrumbs />
        <RefreshButton projectName={params.projectName} />
      </div>
      {/* Rest of page */}
    </div>
  );
}
```

### Phase 3: UX Improvements (1 hour)

#### Task 3.1: Working Search (30 min)
**File:** `app/page.tsx`

```typescript
'use client';  // Make this a client component

import { useState } from 'react';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter projects based on search
  const filteredCategories = Object.entries(projectsByCategory).reduce((acc, [catName, category]) => {
    if (searchQuery) {
      const filtered = category.projects.filter(p =>
        p.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (filtered.length > 0) {
        acc[catName] = { ...category, projects: filtered };
      }
    } else {
      acc[catName] = category;
    }
    return acc;
  }, {} as typeof projectsByCategory);

  return (
    <>
      <input
        type="text"
        placeholder="Search Documentation..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-4 py-3 rounded-lg border"
      />

      {/* Display filtered categories */}
      {Object.entries(filteredCategories).map(([catName, category]) => (
        <div key={catName}>
          {/* Category display */}
        </div>
      ))}
    </>
  );
}
```

#### Task 3.2: Improve Navigation (20 min)
**File:** `app/project/[projectName]/docs-list/[[...slug]]/page.tsx`

```typescript
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Add to breadcrumb area
<div className="flex items-center gap-4">
  <Link
    href="/docs-viewer"
    className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
  >
    <ArrowLeft className="w-4 h-4" />
    Back to Projects
  </Link>
  <nav aria-label="Breadcrumb" className="text-sm">
    {/* existing breadcrumbs */}
  </nav>
</div>
```

#### Task 3.3: Fix Category Names (10 min)
**File:** `lib/categorization-service.ts`

```typescript
// Update category display names
const CATEGORY_DISPLAY_NAMES = {
  'documentation': '📄 Documentation & Guides',
  'backend': '⚙️ Backend Services & APIs',
  'infrastructure': '🔧 Tools & Infrastructure',  // Changed from "Workspace Configuration"
  'frontend': '🎨 Frontend Applications',
  'tools': '🛠️ Development Tools',
};
```

### Phase 4: Testing & Deployment (30 min)

#### Task 4.1: Build Verification (10 min)
```bash
npm run build
# Should complete with 0 errors

# Check bundle size
ls -lh .next/static/chunks/
```

#### Task 4.2: Playwright Testing (15 min)
```bash
# Test homepage images
mcp__plugin_testing-suite_playwright-server__browser_navigate({
  url: "https://y1.andiami.tech/docs-viewer"
})

# Verify images load (no 404 errors)
mcp__plugin_testing-suite_playwright-server__browser_console_messages({
  level: "error"
})  # Should show 0 image errors

# Test document count
# Navigate to wish-x
# Count documents in sidebar
# Should see 40+ documents
```

#### Task 4.3: Deployment (5 min)
```bash
pm2 restart docs-viewer
pm2 logs docs-viewer --lines 50

# Verify public access
curl -I https://y1.andiami.tech/docs-viewer
# Should return 200

# Test refresh button works
# Click "Refresh Docs" → Page reloads → Fresh data
```

---

## Testing Checklist

### Build & Images
- [ ] `npm run build` completes without errors
- [ ] All 6 project thumbnails load (not 404)
- [ ] Genie logo shows on homepage
- [ ] No console errors about images

### Document Discovery
- [ ] wish-x shows 40+ documents (not 17)
- [ ] wish-backend-x shows documents (not 0)
- [ ] workspace-docs shows 55 documents (not 2)
- [ ] All subdirectories discovered (docs/, .github/, .omc/)

### Auto-Discovery
- [ ] Create new file: `touch /home/ubuntu/workspace/wish-x/TEST-NEW-DOC.md`
- [ ] Wait 30 seconds OR click "Refresh Docs"
- [ ] File appears in document list
- [ ] Delete file, refresh, file disappears

### Search Functionality
- [ ] Search box accepts input
- [ ] Typing filters project cards
- [ ] Clear search shows all projects
- [ ] Search works for project names and descriptions

### Navigation
- [ ] "Back to Projects" button exists and works
- [ ] Breadcrumbs are clickable
- [ ] All navigation links work
- [ ] No broken links

### Cross-Browser
- [ ] Chrome desktop - all features work
- [ ] Firefox desktop - all features work
- [ ] Safari desktop - all features work
- [ ] Chrome mobile - responsive layout

---

## Success Criteria

**Before:**
- ❌ 6/6 images broken (404)
- ❌ 17/43 docs showing in wish-x
- ❌ 0/30 docs showing in wish-backend-x
- ❌ Build fails
- ❌ No auto-discovery
- ❌ Search doesn't work

**After:**
- ✅ 6/6 images load correctly
- ✅ 43/43 docs showing in wish-x
- ✅ 30/30 docs showing in wish-backend-x
- ✅ Build succeeds
- ✅ Auto-discovery works (30s or manual refresh)
- ✅ Search filters projects

---

## Rollback Plan

If issues arise during deployment:

```bash
# Revert to previous version
git reset --hard HEAD~1

# Rebuild and restart
npm run build
pm2 restart docs-viewer

# Verify rollback successful
curl -I https://y1.andiami.tech/docs-viewer
```

---

**Design Approved:** 2026-02-03
**Implementation Start:** 2026-02-03
**Expected Completion:** 2026-02-03 (3-4 hours)
