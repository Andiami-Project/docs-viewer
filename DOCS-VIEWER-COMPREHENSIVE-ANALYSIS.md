# Docs Viewer - Comprehensive Analysis & Recommendations

**Date:** 2026-02-03
**Project URL:** https://y1.andiami.tech/docs-viewer
**Status:** Multiple Critical Issues Identified

---

## Executive Summary

The docs-viewer project has **3 critical issues** affecting user experience:

1. ❌ **Broken Images** - All 6 project thumbnails return 404 errors
2. ❌ **Incomplete Document Discovery** - Only showing ~17 docs instead of 100+ available
3. ❌ **Build Errors** - Production build failing with prerender errors

**User Experience Impact:** 🔴 **POOR** - Images don't load, most documentation is hidden, navigation is confusing

---

## Issue #1: Broken Project Thumbnail Images (CRITICAL)

### Problem
All 6 project card images return **404 Not Found** errors:

```
❌ /docs-viewer/genie-logo.png (404)
❌ /docs-viewer/workspace-docs.png (404)
❌ /docs-viewer/doc-automation-hub.png (404)
❌ /docs-viewer/claude-agent-server.png (404)
❌ /docs-viewer/wish-backend-x.png (404)
❌ /docs-viewer/wish-x.png (404)
```

### Root Cause
**Image path mismatch** - Code references `/docs-viewer/[project-name].png` but files exist in `/public/` directory.

### Evidence
```bash
# Images EXIST in public directory:
$ ls -la /home/ubuntu/workspace/docs-viewer/public/
-rw-r--r--  1 ubuntu ubuntu  968736 Jan 28 17:47 claude-agent-server.png
-rw-r--r--  1 ubuntu ubuntu  904363 Jan 28 17:47 doc-automation-hub.png
-rw-r--r--  1 ubuntu ubuntu  308208 Jan 28 16:45 genie-logo.png
-rw-r--r--  1 ubuntu ubuntu  1043735 Jan 28 17:47 wish-backend-x.png
-rw-r--r--  1 ubuntu ubuntu  983428 Jan 28 17:47 wish-x.png
-rw-r--r--  1 ubuntu ubuntu  864740 Jan 28 17:47 workspace-docs.png

# Code references them with basePath:
app/page.tsx:85: src="/docs-viewer/genie-logo.png"
app/page.tsx:190: src={`/docs-viewer/${project.name}.png`}
```

### Why This Happened Again
**Configuration confusion** - `next.config.ts` sets `basePath: '/docs-viewer'` which affects routing but NOT static asset serving.

Next.js serves `/public/*` files at root level, but `basePath` makes the app think they're at `/docs-viewer/*`.

### Fix Strategy
**Option A: Remove basePath prefix from image paths** (RECOMMENDED)
```typescript
// app/page.tsx line 85
- src="/docs-viewer/genie-logo.png"
+ src="/genie-logo.png"  // Next.js auto-adds basePath

// app/page.tsx line 190
- src={`/docs-viewer/${project.name}.png`}
+ src={`/${project.name}.png`}  // Next.js auto-adds basePath
```

**Option B: Use Next.js Image component** (BETTER PRACTICE)
```typescript
import Image from 'next/image';

<Image
  src="/genie-logo.png"  // Relative path works
  alt="As You Wish Logo"
  width={192}
  height={192}
  className="w-full h-full object-contain"
/>
```

---

## Issue #2: Incomplete Document Discovery (CRITICAL)

### Problem
**Only 17 documents shown** when **100+ markdown files exist** in the workspace.

### Evidence

**What we see in UI:**
```
Doc Automation Hub: 6 docs
Wish Backend X: 0 docs (!!!)
Claude Agent Server: 0 docs (!!!)
Wish X: 17 docs (some shown)
Workspace Docs: 2 docs (!!!)
```

**What actually exists:**
```bash
# Actual markdown file counts:
workspace-docs (.claude): 55 files
wish-x: 43 files (only 17 shown)
wish-backend-x: ~30 files (NONE shown)
doc-automation-hub: 6 files (all shown)
claude-agent-server: ~20 files (NONE shown)
```

### Root Cause Analysis

**Hypothesis 1: Path Configuration Issues**
```typescript
// lib/project-config.ts
export const PROJECT_ROOTS: Record<string, string> = {
  'workspace-docs': '/home/ubuntu/workspace/.claude',  // ❌ WRONG PATH
  'wish-x': '/home/ubuntu/workspace/wish-x',          // ✅ Correct
  'wish-backend-x': '/home/ubuntu/workspace/wish-backend-x',  // ✅ Correct
  // ... others
};
```

**Issue:** `workspace-docs` points to `/.claude` which doesn't exist in wish-x!

```bash
$ ls /home/ubuntu/workspace/.claude/
# This is the WORKSPACE root .claude directory with 55 files

$ ls /home/ubuntu/workspace/wish-x/.claude/
ls: cannot access '/home/ubuntu/workspace/wish-x/.claude': No such file or directory
```

**Hypothesis 2: File Traversal Skipping Directories**

```typescript
// lib/project-metadata.ts:134-136
if (entry.name === 'node_modules' || entry.name === '.git' ||
    entry.name === '.next' || entry.name === 'dist') {
  continue;  // Skip these directories
}
```

**Missing skip rules for:**
- `.omc/` (oh-my-claudecode state - should probably skip)
- `.github/` (contains useful docs like COMMIT_HOOK_README.md)
- `docs/` subdirectory (wish-x has 20+ files in `docs/` folder!)

### Document Discovery Flow

```
1. User visits /project/wish-x
   ↓
2. API calls getAllMarkdownFiles('/home/ubuntu/workspace/wish-x')
   ↓
3. Traverses directories recursively
   ↓
4. Skips: node_modules, .git, .next, dist
   ↓
5. Collects .md files
   ↓
6. Returns file list
   ↓
7. categorizeDocument() assigns category
   ↓
8. UI displays by category
```

**Where it breaks:**
- ❌ Not discovering files in subdirectories (`docs/`, `.github/`, `.omc/`)
- ❌ Category mismatch (files categorized wrong, don't show up)
- ❌ Path traversal stops early

### Files Being Missed

**wish-x missing documents:**
```
/docs/GOOGLE-TOKEN-TESTING-GUIDE.md (api)
/docs/AUTO-CONTINUE-SYSTEM.md (guide)
/docs/05-deployment/X1-Z1-DEPLOYMENT-GUIDE.md (setup)
/docs/STAGING-DEPLOYMENT-2026-01-29.md (troubleshooting)
/docs/testing/alert-state-manual-tests.md (guide)
/docs/plans/*.md (20+ planning documents)
/.github/COMMIT_HOOK_README.md (setup)
/.omc/autopilot/*.md (guide)
/.githooks/README.md (setup)
```

**wish-backend-x missing ALL documents** (0 shown but ~30 exist):
```
/README.md
/docs/*.md
/.claude/*.md
```

### Fix Strategy

**Step 1: Fix project paths**
```typescript
// lib/project-config.ts
export const PROJECT_ROOTS: Record<string, string> = {
  'workspace-docs': '/home/ubuntu/workspace',  // Changed from /.claude
  // OR better:
  'workspace-docs': '/home/ubuntu/workspace/.claude',  // Keep but fix traversal

  // Add explicit subdirectory handling
};
```

**Step 2: Add debugging to file traversal**
```typescript
// lib/project-metadata.ts
function getAllMarkdownFiles(dir: string): string[] {
  const files: string[] = [];
  console.log(`[DEBUG] Scanning directory: ${dir}`);

  function traverse(currentPath: string, depth: number = 0) {
    console.log(`[DEBUG] ${" ".repeat(depth)}Entering: ${currentPath}`);

    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    console.log(`[DEBUG] ${" ".repeat(depth)}Found ${entries.length} entries`);

    for (const entry of entries) {
      // Log what's being skipped
      if (entry.name === 'node_modules' || entry.name === '.git' ||
          entry.name === '.next' || entry.name === 'dist') {
        console.log(`[DEBUG] ${" ".repeat(depth)}SKIP: ${entry.name}`);
        continue;
      }

      if (entry.isDirectory()) {
        console.log(`[DEBUG] ${" ".repeat(depth)}RECURSE: ${entry.name}/`);
        traverse(fullPath, depth + 1);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        console.log(`[DEBUG] ${" ".repeat(depth)}FOUND: ${entry.name}`);
        files.push(fullPath);
      }
    }
  }

  traverse(dir);
  console.log(`[DEBUG] Total files found: ${files.length}`);
  return files;
}
```

**Step 3: Update directory skip list** (OPTIONAL)
```typescript
const SKIP_DIRS = [
  'node_modules',
  '.git',
  '.next',
  'dist',
  // Add these if you don't want internal docs:
  // '.omc',  // oh-my-claudecode state (probably skip)
  // 'build',
  // 'out',
];

if (SKIP_DIRS.includes(entry.name)) {
  continue;
}
```

**Step 4: Verify categorization logic**
```typescript
// lib/doc-metadata.ts:220-264
// Make sure categorizeDocument() is working correctly
// Add debug logging to see what category each file gets
```

---

## Issue #3: Build Failures (BLOCKING DEPLOYMENT)

### Problem
```
⨯ Next.js build worker exited with code: 1
Error: Cannot read properties of null (reading 'useContext')
Export encountered an error on /_global-error/page
```

### Root Cause
**React context being used during SSR/SSG** where it's not available.

### Evidence
```
Each child in a list should have a unique "key" prop.
Check the top-level render call using <__next_viewport_boundary__>
```

### Fix Strategy

**Option 1: Add keys to list items**
```typescript
// app/page.tsx:176
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {category.projects.map((project) => (
    <Link
      key={project.name}  // ADD THIS KEY
      href={`/project/${project.name}`}
      // ...
    >
```

**Option 2: Fix global error page**
```typescript
// app/global-error.tsx or app/error.tsx
// Ensure 'use client' directive is present
'use client';

export default function GlobalError() {
  // Component code
}
```

---

## Issue #4: User Experience Problems (SEVERE)

### Navigation Confusion

**Problem:** No clear "back to home" button on docs pages

**Evidence:** User has to use browser back button or breadcrumbs (which are small)

**Fix:**
```typescript
// Add prominent "← Back to Projects" button in breadcrumb area
<div className="flex items-center gap-4">
  <Link href="/docs-viewer" className="btn-secondary">
    <ArrowLeft className="w-4 h-4" />
    Back to Projects
  </Link>
  <nav aria-label="Breadcrumb">
    {/* existing breadcrumbs */}
  </nav>
</div>
```

### Search Functionality

**Problem:** Search box on homepage does nothing (no functionality)

**Evidence:** Line 123-134 in app/page.tsx shows search input but no actual search logic

**Fix:**
```typescript
// Add actual search functionality
const filteredProjects = Object.entries(projects).reduce((acc, [categoryName, category]) => {
  if (searchQuery) {
    const filtered = category.projects.filter(p =>
      p.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[categoryName] = { ...category, projects: filtered };
    }
  } else {
    acc[categoryName] = category;
  }
  return acc;
}, {} as Record<string, ProjectCategory>);
```

### Category Organization

**Problem:** Category names don't make semantic sense

**Current categories:**
```
📄 Documentation (2 projects)
⚙️ Backend Services (1 project)
📁 Workspace Configuration (2 projects) ← Confusing name
```

**Better names:**
```
📄 Documentation & Guides
⚙️ Backend Services & APIs
🔧 Tools & Configuration
🎨 Frontend Applications
🤖 AI & Automation
```

### File List Sidebar

**Problem:** No visual hierarchy, all files look the same

**Fix:** Add better visual separation:
```tsx
<div className="space-y-6">
  {Object.entries(categorizedDocs).map(([category, docs]) => (
    <div key={category} className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
        {category} ({docs.length})
      </h3>
      <div className="space-y-1">
        {docs.map((doc) => (
          <DocLink key={doc.path} doc={doc} />
        ))}
      </div>
    </div>
  ))}
</div>
```

---

## Priority Fix Plan

### 🔴 Phase 1: Critical Fixes (DO FIRST)

**1. Fix Broken Images** (15 minutes)
```bash
cd /home/ubuntu/workspace/docs-viewer

# Edit app/page.tsx
# Line 85: Change "/docs-viewer/genie-logo.png" → "/genie-logo.png"
# Line 190: Change src={`/docs-viewer/${project.name}.png`} → src={`/${project.name}.png`}

npm run build && pm2 restart docs-viewer
```

**2. Fix Build Errors** (30 minutes)
```bash
# Add keys to all .map() calls
# Fix global error page with 'use client' directive
# Test build passes: npm run build
```

**3. Debug Document Discovery** (1 hour)
```bash
# Add debug logging to lib/project-metadata.ts
# Run locally: npm run dev
# Visit each project page
# Check terminal output for file counts
# Fix path/traversal issues based on logs
```

### 🟡 Phase 2: UX Improvements (DO NEXT)

**4. Add Search Functionality** (45 minutes)
```typescript
// Implement actual filtering logic in app/page.tsx
// Test search works for all projects
```

**5. Improve Navigation** (30 minutes)
```typescript
// Add "Back to Projects" button
// Make breadcrumbs more prominent
// Add keyboard shortcuts (← → to navigate docs)
```

**6. Better Category Names** (15 minutes)
```typescript
// Update lib/categorization-service.ts
// Rename "Workspace Configuration" → "Tools & Configuration"
// Test all projects show in correct categories
```

### 🟢 Phase 3: Polish (DO LAST)

**7. Visual Hierarchy** (1 hour)
```typescript
// Redesign file list sidebar
// Add icons for file types
// Group by category with collapsible sections
```

**8. Dark Mode Persistence** (30 minutes)
```typescript
// Save dark mode preference to localStorage
// Load on page load
```

**9. Mobile Optimization** (1 hour)
```typescript
// Test on mobile devices
// Fix sidebar on mobile (make it collapsible)
// Ensure touch targets are 44px minimum
```

---

## Testing Checklist (BEFORE Declaring Done)

### Build Verification
- [ ] `npm run build` completes without errors
- [ ] No React warnings in build output
- [ ] Production bundle size is reasonable

### Image Verification
- [ ] All 6 project cards show images (not broken)
- [ ] Genie logo shows on homepage
- [ ] Images load on first visit (not cached)
- [ ] Images are properly sized (not stretched)

### Document Discovery Verification
- [ ] wish-x shows 40+ documents (not just 17)
- [ ] wish-backend-x shows documents (not 0)
- [ ] workspace-docs shows 55 documents (not 2)
- [ ] All subdirectories are traversed (docs/, .github/, etc.)

### Navigation Verification
- [ ] Homepage → Project page works
- [ ] Project page → Document works
- [ ] Breadcrumbs work (all links clickable)
- [ ] "Back to Projects" button exists and works
- [ ] Search functionality filters projects

### Cross-Browser Testing
- [ ] Chrome desktop - images load
- [ ] Firefox desktop - images load
- [ ] Safari desktop - images load
- [ ] Chrome mobile - images load
- [ ] Safari mobile - images load

### Deployment Verification
- [ ] PM2 restart successful
- [ ] Public URL works: https://y1.andiami.tech/docs-viewer
- [ ] All pages accessible via public URL
- [ ] No 404 errors in browser console
- [ ] Playwright tests pass

---

## Recommendations for Long-Term Improvements

### 1. Automated Testing
```typescript
// Add Playwright tests for:
// - Image loading
// - Document discovery (assert count > threshold)
// - Navigation flows
// - Search functionality
```

### 2. Document Metadata Caching
```typescript
// Cache file discovery results in .docs-viewer-data/
// Regenerate on:
// - Server restart
// - Manual trigger (/api/refresh-cache)
// - Scheduled cron (every 6 hours)
```

### 3. Better Error Handling
```typescript
// Show user-friendly errors when:
// - Project not found
// - Document not found
// - Build fails
// Add error boundaries to catch React errors
```

### 4. Analytics
```typescript
// Track:
// - Which projects are viewed most
// - Which documents are read most
// - Search queries (to improve categorization)
// Use simple file-based analytics (no external service)
```

### 5. Documentation Auto-Discovery
```typescript
// Automatically detect new projects in /home/ubuntu/workspace/
// Add them to project list without manual configuration
// Use fs.readdir() to scan workspace directory
```

---

## Summary

**Current State:** 🔴 **BROKEN** - Images don't load, most docs hidden, build fails
**Estimated Fix Time:** 3-4 hours (Phase 1 + Phase 2)
**Recommended Approach:** Fix critical issues first (Phase 1), then UX (Phase 2), then polish (Phase 3)

**Key Insight:** The project was working before but regressed due to:
1. **Next.js basePath confusion** - Image paths don't account for basePath behavior
2. **Path configuration errors** - workspace-docs points to wrong directory
3. **Incomplete file traversal** - Skipping important subdirectories like `docs/` and `.github/`

**Next Steps:**
1. Fix broken images (15 min)
2. Fix build errors (30 min)
3. Debug document discovery with logging (1 hour)
4. Test everything works end-to-end
5. Deploy to production
6. Create verification report with Playwright evidence

---

**Last Updated:** 2026-02-03
**Analyst:** Claude (Linai)
**Status:** Analysis Complete - Ready for Implementation
