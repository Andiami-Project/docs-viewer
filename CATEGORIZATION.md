# Documentation Viewer - Intelligent Categorization System

## Overview

The Documentation Viewer includes an intelligent project categorization system that automatically organizes projects into meaningful categories. The system is designed to:

1. **Auto-detect categories** based on project names and paths
2. **Normalize category names** to prevent duplicate variations
3. **Persist metadata** for consistency across sessions
4. **Learn from patterns** as new projects are added
5. **Allow manual overrides** when auto-detection needs correction

## Category Definitions

The system includes 9 predefined categories:

| Category | Display Name | Description | Icon |
|----------|--------------|-------------|------|
| `documentation` | Documentation | Documentation, guides, and knowledge bases | BookOpen |
| `backend` | Backend Services | Backend APIs, services, and server-side applications | Server |
| `frontend` | Frontend Applications | Web applications, UIs, and client-side projects | Layout |
| `tools` | Developer Tools | CLI tools, utilities, and development aids | Wrench |
| `infrastructure` | Infrastructure | DevOps, deployment, and infrastructure projects | Cloud |
| `workspace` | Workspace Configuration | Workspace settings, configurations, and metadata | Folder |
| `ai-agents` | AI & Agents | AI services, agents, and machine learning projects | Bot |
| `ecommerce` | E-Commerce | Online stores, shopping platforms, and retail applications | ShoppingCart |
| `other` | Other | Miscellaneous projects | Package |

## How Auto-Detection Works

The categorization service analyzes project names and paths using keyword matching:

### Example 1: Backend Service
**Project:** `wish-backend-x`
**Keywords matched:** "backend"
**Category assigned:** `backend` (Backend Services)

### Example 2: Documentation Hub
**Project:** `doc-automation-hub`
**Keywords matched:** "doc", "automation"
**Category assigned:** `documentation` (Documentation)

### Example 3: AI Agent
**Project:** `claude-agent-server`
**Keywords matched:** "agent", "claude"
**Category assigned:** `ai-agents` (AI & Agents)

## Category Normalization

The system prevents duplicate categories by normalizing input:

```typescript
// All of these normalize to "backend"
normalizeCategory("backend")         → "backend"
normalizeCategory("Backend")         → "backend"
normalizeCategory("backend-services") → "backend"
normalizeCategory("BACKEND")         → "backend"
```

**Aliases for each category:**
- `documentation`: docs, documentation, guides, manuals
- `backend`: backend, backend-services, api, services
- `frontend`: frontend, web-app, webapp, ui, website
- `tools`: tools, utilities, cli-tools, dev-tools
- `infrastructure`: infrastructure, infra, devops, deployment
- `workspace`: workspace, workspace-config, settings
- `ai-agents`: ai, agents, ai-agents, ml
- `ecommerce`: ecommerce, e-commerce, store, shop
- `other`: other, misc, miscellaneous

## Persistent Storage

Project metadata is stored in:
```
.docs-viewer-data/project-metadata.json
```

**Example metadata entry:**
```json
{
  "wish-backend-x": {
    "name": "wish-backend-x",
    "displayName": "Wish Backend X",
    "description": "Wish Backend X - Backend Services",
    "category": "backend",
    "path": "/home/ubuntu/workspace/wish-backend-x",
    "icon": "Server",
    "tags": [],
    "autoDetected": true
  }
}
```

## Adding New Projects

When a new project is added to `PROJECT_ROOTS` in `/app/api/docs/route.ts`:

1. **First request:** System auto-detects category based on keywords
2. **Metadata saved:** Project metadata persisted to storage
3. **Subsequent requests:** Uses saved metadata (fast!)
4. **Manual override:** Can be updated via API if categorization is incorrect

## API Endpoints

### Get All Projects (Categorized)
```bash
GET /docs-viewer/api/projects?action=by-category
```

**Response:**
```json
{
  "backend": {
    "definition": {
      "name": "backend",
      "displayName": "Backend Services",
      "description": "Backend APIs, services, and server-side applications",
      "icon": "Server"
    },
    "projects": [
      {
        "name": "wish-backend-x",
        "displayName": "Wish Backend X",
        "description": "Wish Backend X - Backend Services",
        "category": "backend",
        "autoDetected": true
      }
    ]
  }
}
```

### Get All Projects (Flat List)
```bash
GET /docs-viewer/api/projects
```

### Update Project Metadata
```bash
PUT /docs-viewer/api/projects
Content-Type: application/json

{
  "projectName": "wish-backend-x",
  "updates": {
    "category": "backend",
    "description": "Custom description",
    "tags": ["api", "rest", "graphql"]
  }
}
```

## Homepage Organization

The homepage displays projects organized by category:

### Features:
- **Category headers** with icons and descriptions
- **Project count** per category
- **Auto-categorized badge** for auto-detected projects
- **Search** across categories, project names, and descriptions
- **Responsive grid** layout (1-3 columns based on screen size)

### Category Sorting:
Categories appear in the order defined in `CATEGORY_DEFINITIONS`:
1. Documentation
2. Backend Services
3. Frontend Applications
4. Developer Tools
5. Infrastructure
6. Workspace Configuration
7. AI & Agents
8. E-Commerce
9. Other

Empty categories are automatically hidden.

## Manual Categorization

To manually categorize a project:

### Option 1: Via API
```bash
curl -X PUT http://localhost:3890/docs-viewer/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "projectName": "my-project",
    "updates": {
      "category": "frontend",
      "description": "My awesome frontend app",
      "tags": ["react", "nextjs"]
    }
  }'
```

### Option 2: Edit Metadata File
```bash
# Edit .docs-viewer-data/project-metadata.json
{
  "my-project": {
    "name": "my-project",
    "displayName": "My Project",
    "description": "Custom description",
    "category": "frontend",
    "path": "/home/ubuntu/workspace/my-project",
    "icon": "Layout",
    "tags": ["react", "nextjs"],
    "autoDetected": false
  }
}
```

## Adding Custom Categories

To add a new category, update `CATEGORY_DEFINITIONS` in `/lib/categorization-service.ts`:

```typescript
{
  name: 'mobile',
  displayName: 'Mobile Apps',
  description: 'Native and hybrid mobile applications',
  keywords: ['mobile', 'ios', 'android', 'react-native', 'flutter'],
  icon: 'Smartphone',
  aliases: ['mobile', 'mobile-apps', 'ios', 'android']
}
```

Then add the icon to `ICON_MAP` in `/app/page.tsx`:

```typescript
import { Smartphone } from 'lucide-react';

const ICON_MAP = {
  // ... existing icons
  Smartphone,
};
```

## Benefits

### 1. Automatic Organization
- New projects automatically categorized
- No manual configuration needed
- Consistent categorization rules

### 2. Scalability
- Handles unlimited projects
- Fast lookups via persisted metadata
- Efficient category grouping

### 3. Discoverability
- Browse by category
- Search across all projects
- Clear visual hierarchy

### 4. Flexibility
- Manual override support
- Custom descriptions and tags
- Extensible category system

### 5. Consistency
- Category normalization prevents duplicates
- Aliases handle common variations
- Stable canonical names

## Future Enhancements

Potential improvements:

1. **Machine Learning:** Use project file structure and content for smarter categorization
2. **Tags System:** Rich tagging with tag clouds and filtering
3. **Custom Categories:** User-defined categories per workspace
4. **Category Analytics:** Track most-used categories and projects
5. **Bulk Operations:** Recategorize multiple projects at once
6. **Category Templates:** Pre-configured category sets for different workflows

## Architecture

```
┌─────────────────────────────────────────┐
│         Homepage (page.tsx)             │
│  - Fetches categorized projects         │
│  - Displays by category                 │
│  - Search & filter                      │
└──────────────────┬──────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────┐
│   API: /api/projects (route.ts)         │
│  - GET: Fetch categorized projects      │
│  - PUT: Update metadata                 │
└──────────────────┬──────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────┐
│  Categorization Service                 │
│  (lib/categorization-service.ts)        │
│                                         │
│  - Auto-detect category                 │
│  - Normalize category names             │
│  - Persist metadata                     │
│  - Load/save from storage               │
└──────────────────┬──────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────┐
│  Persistent Storage                     │
│  .docs-viewer-data/project-metadata.json│
│                                         │
│  - JSON file storage                    │
│  - Fast lookups                         │
│  - Survives restarts                    │
└─────────────────────────────────────────┘
```

## Testing

### Test Auto-Detection
```bash
# Add a new project to PROJECT_ROOTS
# First load will auto-detect and save
curl http://localhost:3890/docs-viewer/api/projects?action=by-category | jq
```

### Test Normalization
```bash
# All should normalize to same category
curl -X PUT http://localhost:3890/docs-viewer/api/projects \
  -H "Content-Type: application/json" \
  -d '{"projectName": "test", "updates": {"category": "Backend"}}'

curl -X PUT http://localhost:3890/docs-viewer/api/projects \
  -H "Content-Type: application/json" \
  -d '{"projectName": "test", "updates": {"category": "backend-services"}}'

# Both should result in category: "backend"
```

### Test Persistence
```bash
# Restart the app
pm2 restart docs-viewer

# Metadata should persist
curl http://localhost:3890/docs-viewer/api/projects | jq
```

---

**Documentation Viewer** • Intelligent project categorization for better organization and discovery
