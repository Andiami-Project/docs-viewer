# Docs Viewer Complete Fix - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix all critical issues in docs-viewer: broken images, incomplete document discovery, build errors, and add auto-discovery for new markdown files without server restart.

**Architecture:** Replace static file scanning with Next.js ISR (30s revalidation) + manual refresh button. Enhanced recursive file traversal to discover all subdirectories. Client-side search filtering. React keys and error boundaries for build stability.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, Lucide React icons

---

## Task 1: Fix Broken Images

**Files:**
- Modify: `app/page.tsx:85,190`

**Step 1: Fix logo image path**

```typescript
// app/page.tsx line 85
// Replace:
src="/docs-viewer/genie-logo.png"

// With:
src="/genie-logo.png"
```

**Reason:** Next.js `basePath` config auto-adds `/docs-viewer` prefix. Double-prefixing causes 404.

**Step 2: Fix project thumbnail paths**

```typescript
// app/page.tsx line 190
// Replace:
src={`/docs-viewer/${project.name}.png`}

// With:
src={`/${project.name}.png`}
```

**Step 3: Test images load**

Run: Open browser to https://y1.andiami.tech/docs-viewer
Expected: All 6 project cards show images (not broken image icons)

**Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "fix: correct image paths for basePath compatibility"
```

---

## Task 2: Fix Build Errors - Add React Keys

**Files:**
- Modify: `app/page.tsx:176-200`

**Step 1: Add key to project cards loop**

```typescript
// app/page.tsx around line 176
// Find this code:
{category.projects.map((project) => (
  <Link
    href={`/project/${project.name}`}
    // ...
  >

// Add key prop:
{category.projects.map((project) => (
  <Link
    key={project.name}  // ADD THIS LINE
    href={`/project/${project.name}`}
    // ...
  >
```

**Step 2: Find and fix all other .map() calls without keys**

Search for: `.map((` in `app/page.tsx`
Add `key` prop to each mapped element

**Step 3: Test build**

Run: `npm run build`
Expected: Build completes without "unique key prop" warnings

**Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "fix: add React keys to all mapped elements"
```

---

## Task 3: Fix Build Errors - Global Error Page

**Files:**
- Modify: `app/global-error.tsx` OR `app/error.tsx`

**Step 1: Check if file exists**

Run: `ls app/global-error.tsx app/error.tsx`

**Step 2: Add 'use client' directive**

```typescript
// At very top of file (line 1)
'use client';

export default function GlobalError({ error, reset }: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  // existing code
}
```

**Step 3: Test build**

Run: `npm run build`
Expected: Build completes without "Cannot read properties of null" error

**Step 4: Commit**

```bash
git add app/global-error.tsx  # or app/error.tsx
git commit -m "fix: add use client directive to error boundary"
```

---

## Task 4: Fix Document Discovery - Enhanced Traversal

**Files:**
- Modify: `lib/project-metadata.ts:126-155`

**Step 1: Replace SKIP list with minimal set**

```typescript
// lib/project-metadata.ts - Add at top of file (around line 5)
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
```

**Step 2: Replace getAllMarkdownFiles function**

```typescript
// lib/project-metadata.ts - Replace function starting at line 126
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

**Step 3: Test locally**

Run: `npm run dev`
Visit: http://localhost:3000/docs-viewer/project/wish-x
Expected: See 40+ documents in sidebar (not 17)

**Step 4: Check console logs**

Expected output: `[Discovery] Found 43 files, skipped 5 dirs in /home/ubuntu/workspace/wish-x`

**Step 5: Commit**

```bash
git add lib/project-metadata.ts
git commit -m "fix: enhance file discovery to include all subdirectories"
```

---

## Task 5: Add ISR Revalidation

**Files:**
- Modify: `app/project/[projectName]/docs-list/[[...slug]]/page.tsx:1`

**Step 1: Add revalidate export**

```typescript
// app/project/[projectName]/docs-list/[[...slug]]/page.tsx
// Add at top of file (line 1-2)
export const revalidate = 30; // Revalidate every 30 seconds

// Rest of file...
```

**Step 2: Verify no build errors**

Run: `npm run build`
Expected: Build succeeds with ISR configured

**Step 3: Commit**

```bash
git add "app/project/[projectName]/docs-list/[[...slug]]/page.tsx"
git commit -m "feat: add ISR revalidation for automatic doc discovery"
```

---

## Task 6: Create Refresh API Route

**Files:**
- Create: `app/api/refresh/route.ts`

**Step 1: Create API directory**

Run: `mkdir -p app/api/refresh`

**Step 2: Create route handler**

```typescript
// app/api/refresh/route.ts
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { projectName } = await request.json();

    if (projectName) {
      // Refresh specific project
      revalidatePath(`/project/${projectName}`);
      revalidatePath(`/project/${projectName}/docs-list`);
    } else {
      // Refresh everything
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

**Step 3: Test API route**

Run: `npm run dev`

Test with curl:
```bash
curl -X POST http://localhost:3000/docs-viewer/api/refresh \
  -H "Content-Type: application/json" \
  -d '{"projectName":"wish-x"}'
```

Expected: `{"success":true,"message":"Cache cleared","timestamp":"..."}`

**Step 4: Commit**

```bash
git add app/api/refresh/route.ts
git commit -m "feat: add API route for manual cache refresh"
```

---

## Task 7: Create Refresh Button Component

**Files:**
- Create: `components/refresh-button.tsx`

**Step 1: Create components directory if needed**

Run: `mkdir -p components`

**Step 2: Create refresh button component**

```typescript
// components/refresh-button.tsx
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

      // Reload page to show fresh data
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
      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
    >
      <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      {isRefreshing ? 'Refreshing...' : 'Refresh Docs'}
    </button>
  );
}
```

**Step 3: Test component renders**

Add temporarily to `app/page.tsx`:
```typescript
import { RefreshButton } from '@/components/refresh-button';

// In JSX:
<RefreshButton />
```

Visit: http://localhost:3000/docs-viewer
Expected: See "Refresh Docs" button, clicking it reloads page

**Step 4: Remove test code from app/page.tsx**

**Step 5: Commit**

```bash
git add components/refresh-button.tsx
git commit -m "feat: add refresh button component for manual doc updates"
```

---

## Task 8: Add Refresh Button to Docs Page

**Files:**
- Modify: `app/project/[projectName]/docs-list/[[...slug]]/page.tsx`

**Step 1: Import refresh button**

```typescript
// app/project/[projectName]/docs-list/[[...slug]]/page.tsx
// Add to imports at top
import { RefreshButton } from '@/components/refresh-button';
```

**Step 2: Add button to header area**

Find the breadcrumb/header section and add:

```typescript
// Around the header/breadcrumb area
<div className="flex items-center justify-between mb-4">
  <nav aria-label="Breadcrumb">
    {/* existing breadcrumbs */}
  </nav>
  <RefreshButton projectName={params.projectName} />
</div>
```

**Step 3: Test button appears and works**

Run: `npm run dev`
Visit: http://localhost:3000/docs-viewer/project/wish-x
Expected: See "Refresh Docs" button, clicking reloads with fresh file list

**Step 4: Commit**

```bash
git add "app/project/[projectName]/docs-list/[[...slug]]/page.tsx"
git commit -m "feat: integrate refresh button into docs list page"
```

---

## Task 9: Add Working Search Functionality

**Files:**
- Modify: `app/page.tsx`

**Step 1: Make page a client component**

```typescript
// app/page.tsx - Add at very top (line 1)
'use client';

// Rest of imports...
```

**Step 2: Add search state**

```typescript
// app/page.tsx - In component function
import { useState } from 'react';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');

  // ... rest of component
}
```

**Step 3: Add filter logic**

```typescript
// app/page.tsx - Before return statement
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
```

**Step 4: Update search input**

```typescript
// app/page.tsx - Find search input, update onChange
<input
  type="text"
  placeholder="Search Documentation..."
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
/>
```

**Step 5: Use filteredCategories instead of projectsByCategory**

```typescript
// app/page.tsx - In the rendering section
{Object.entries(filteredCategories).map(([categoryName, category]) => (
  // existing category rendering code
))}
```

**Step 6: Test search**

Run: `npm run dev`
Visit: http://localhost:3000/docs-viewer
Type in search: "wish"
Expected: Only "Wish X" and "Wish Backend X" cards appear

**Step 7: Commit**

```bash
git add app/page.tsx
git commit -m "feat: add working search functionality for projects"
```

---

## Task 10: Improve Navigation - Back Button

**Files:**
- Modify: `app/project/[projectName]/docs-list/[[...slug]]/page.tsx`

**Step 1: Import navigation components**

```typescript
// app/project/[projectName]/docs-list/[[...slug]]/page.tsx
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
```

**Step 2: Add back button to header**

```typescript
// Find the header/breadcrumb section, update to:
<div className="flex items-center gap-4 mb-4">
  <Link
    href="/docs-viewer"
    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
  >
    <ArrowLeft className="w-4 h-4" />
    <span className="text-sm font-medium">Back to Projects</span>
  </Link>

  <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-gray-600">
    {/* existing breadcrumb items */}
  </nav>

  <div className="ml-auto">
    <RefreshButton projectName={params.projectName} />
  </div>
</div>
```

**Step 3: Test navigation**

Run: `npm run dev`
Visit: http://localhost:3000/docs-viewer/project/wish-x
Click: "Back to Projects"
Expected: Returns to homepage

**Step 4: Commit**

```bash
git add "app/project/[projectName]/docs-list/[[...slug]]/page.tsx"
git commit -m "feat: add prominent back to projects button"
```

---

## Task 11: Fix Category Names

**Files:**
- Modify: `lib/categorization-service.ts` OR `lib/doc-metadata.ts`

**Step 1: Find category display logic**

Search for: "Workspace Configuration" in all TypeScript files

**Step 2: Update category names**

```typescript
// Find the category display name mapping
const CATEGORY_DISPLAY_NAMES = {
  'documentation': '📄 Documentation & Guides',
  'backend': '⚙️ Backend Services & APIs',
  'infrastructure': '🔧 Tools & Infrastructure',  // Changed from "Workspace Configuration"
  'frontend': '🎨 Frontend Applications',
  'tools': '🛠️ Development Tools',
};
```

**Step 3: Test updated names**

Run: `npm run dev`
Visit: http://localhost:3000/docs-viewer
Expected: Category headings show new names

**Step 4: Commit**

```bash
git add lib/categorization-service.ts  # or whichever file
git commit -m "fix: improve category naming for better UX"
```

---

## Task 12: Build and Test

**Files:**
- None (verification only)

**Step 1: Clean build**

```bash
rm -rf .next
npm run build
```

Expected: Build completes with 0 errors

**Step 2: Test production build locally**

```bash
npm run start
```

Visit: http://localhost:3000/docs-viewer
Expected: All features work in production mode

**Step 3: Stop local server**

```bash
# Ctrl+C to stop server
```

**Step 4: No commit** (verification only)

---

## Task 13: Deploy to Production

**Files:**
- None (deployment only)

**Step 1: Restart PM2 service**

```bash
cd /home/ubuntu/workspace/docs-viewer
pm2 restart docs-viewer
```

**Step 2: Verify PM2 status**

```bash
pm2 status
pm2 logs docs-viewer --lines 20
```

Expected: Status shows "online", no error logs

**Step 3: Test public URL**

```bash
curl -I https://y1.andiami.tech/docs-viewer
```

Expected: HTTP 200 response

**Step 4: No commit** (deployment only)

---

## Task 14: Playwright Verification

**Files:**
- Create: `VERIFICATION-REPORT.md`

**Step 1: Test homepage images**

```typescript
await mcp__plugin_testing-suite_playwright-server__browser_navigate({
  url: "https://y1.andiami.tech/docs-viewer"
});

await mcp__plugin_testing-suite_playwright-server__browser_take_screenshot({
  filename: "docs-viewer-homepage-fixed.png",
  type: "png"
});

await mcp__plugin_testing-suite_playwright-server__browser_console_messages({
  level: "error"
});
```

Expected: 0 image 404 errors

**Step 2: Test document count**

Navigate to: https://y1.andiami.tech/docs-viewer/project/wish-x

Count documents in sidebar
Expected: 40+ documents visible

**Step 3: Test search**

Type in search box: "wish"
Expected: Projects filter correctly

**Step 4: Test refresh button**

Click "Refresh Docs" button
Expected: Page reloads, fresh data shown

**Step 5: Create verification report**

Create: `VERIFICATION-REPORT.md` with:
- Screenshots of working images
- Document counts per project
- Search functionality evidence
- Refresh button working
- All tests passed ✅

**Step 6: Commit verification**

```bash
git add VERIFICATION-REPORT.md
git commit -m "docs: add verification report for complete fix"
```

---

## Task 15: Test Auto-Discovery

**Files:**
- None (testing only)

**Step 1: Create test markdown file**

```bash
echo "# Test Document" > /home/ubuntu/workspace/wish-x/TEST-AUTO-DISCOVERY.md
```

**Step 2: Wait 30 seconds OR click Refresh**

Option A: Wait 30 seconds, refresh browser
Option B: Click "Refresh Docs" button immediately

**Step 3: Verify file appears**

Visit: https://y1.andiami.tech/docs-viewer/project/wish-x
Expected: "TEST-AUTO-DISCOVERY.md" appears in document list

**Step 4: Delete test file**

```bash
rm /home/ubuntu/workspace/wish-x/TEST-AUTO-DISCOVERY.md
```

**Step 5: Verify file disappears**

Click "Refresh Docs"
Expected: File no longer in list

**Step 6: No commit** (testing only)

---

## Final Verification Checklist

Run through this checklist:

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
- [ ] New .md file appears after 30s or manual refresh
- [ ] Deleted file disappears after refresh
- [ ] No server restart required

### Search & Navigation
- [ ] Search box filters project cards
- [ ] "Back to Projects" button works
- [ ] Breadcrumbs are clickable
- [ ] All navigation links work

### Cross-Browser
- [ ] Chrome desktop - all features work
- [ ] Firefox desktop - all features work
- [ ] Safari desktop - all features work

---

**Plan Complete**
**Estimated Time:** 3-4 hours
**Total Tasks:** 15
**Files Modified:** 8
**Files Created:** 3
