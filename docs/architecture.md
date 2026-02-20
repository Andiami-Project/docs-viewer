---
sidebar_position: 2
---

# System Architecture

Understanding how the As You Wish Ecosystem components work together is essential for effective development and deployment.

---

## 🏗️ High-Level Architecture

The As You Wish Ecosystem follows a modern, layered architecture with clear separation of concerns:

```mermaid
graph TB
    subgraph "Frontend Layer"
        WX[wish-x<br/>Next.js 15 + React 19<br/>Multi-agent Chat UI]
    end

    subgraph "Backend Layer"
        WBX[wish-backend-x<br/>Trigger.dev v4<br/>Background Jobs]
        CAS[claude-agent-server<br/>WebSocket Server<br/>Real-time AI Agents]
    end

    subgraph "Data Layer"
        SB[Supabase<br/>PostgreSQL + Auth + Storage]
    end

    subgraph "Documentation Layer"
        DV[docs-viewer<br/>Docusaurus<br/>Documentation Hub]
        DAH[doc-automation-hub<br/>Automated Docs<br/>Generation]
    end

    subgraph "Configuration Layer"
        WCF[workspace-claude-files<br/>CLAUDE.md<br/>Dev Guidelines]
        WD[workspace-documentation<br/>Implementation Docs<br/>149 Files]
    end

    WX -->|Database Queries| SB
    WX -->|Auth Requests| SB
    WX -->|File Storage| SB
    WX -->|Background Jobs| WBX
    WX -->|Real-time AI| CAS

    WBX -->|Database Updates| SB
    WBX -->|Long-running Tasks| WBX

    CAS -->|Database Access| SB
    CAS -->|Streaming Responses| WX

    DAH -->|Updates| DV
    DAH -->|Reads Config| WCF

    style WX fill:#3b82f6,stroke:#1e40af,color:#fff
    style WBX fill:#8b5cf6,stroke:#6d28d9,color:#fff
    style CAS fill:#ec4899,stroke:#be185d,color:#fff
    style SB fill:#10b981,stroke:#047857,color:#fff
    style DV fill:#f59e0b,stroke:#d97706,color:#fff
```

---

## 🔗 Component Relationships

### Core Components (Required for Basic Setup)

```mermaid
graph LR
    subgraph "Minimum Setup"
        A[wish-x<br/>Frontend] -->|Auth & Data| B[Supabase<br/>Database]
        A -->|Real-time AI| C[claude-agent-server<br/>AI Server]
        C -->|Store Results| B
    end

    style A fill:#3b82f6,stroke:#1e40af,color:#fff
    style B fill:#10b981,stroke:#047857,color:#fff
    style C fill:#ec4899,stroke:#be185d,color:#fff
```

**What You Need:**
- ✅ **wish-x** - User interface for chat and workflows
- ✅ **claude-agent-server** - AI processing and streaming
- ✅ **Supabase** - Data persistence and authentication

**You Can Skip** (Optional Components):
- ⚠️ **wish-backend-x** - Only needed for background job processing
- ⚠️ **doc-automation-hub** - Only needed for automated documentation
- ⚠️ **docs-viewer** - Only needed to host documentation site

---

### Full System (Production Deployment)

```mermaid
graph TB
    subgraph "User Layer"
        USER[User Browser]
    end

    subgraph "Frontend"
        WX[wish-x<br/>Port: 3011<br/>Domain: z1.andiami.tech]
    end

    subgraph "Backend Services"
        WBX[wish-backend-x<br/>Trigger.dev Cloud<br/>Background Jobs]
        CAS[claude-agent-server<br/>Port: 3003<br/>WebSocket Server]
    end

    subgraph "Data & Auth"
        SB_DB[(Supabase<br/>PostgreSQL<br/>RLS Enabled)]
        SB_AUTH[Supabase Auth<br/>JWT Tokens]
        SB_STORAGE[Supabase Storage<br/>File Uploads]
    end

    subgraph "External APIs"
        ANTHROPIC[Anthropic API<br/>Claude Models]
        OPENAI[OpenAI API<br/>GPT Models]
        GEMINI[Google AI<br/>Gemini Models]
        XAI[xAI API<br/>Grok Models]
    end

    USER -->|HTTPS| WX
    WX -->|Auth Requests| SB_AUTH
    WX -->|Database Queries| SB_DB
    WX -->|File Uploads| SB_STORAGE
    WX -->|Trigger Jobs| WBX
    WX -->|WebSocket| CAS

    WBX -->|Read/Write| SB_DB
    WBX -->|AI Requests| ANTHROPIC
    WBX -->|AI Requests| OPENAI

    CAS -->|AI Requests| ANTHROPIC
    CAS -->|Store Results| SB_DB
    CAS -->|Stream Responses| WX

    SB_AUTH -->|Verify Tokens| WX
    SB_AUTH -->|Verify Tokens| WBX
    SB_AUTH -->|Verify Tokens| CAS

    style USER fill:#64748b,stroke:#475569,color:#fff
    style WX fill:#3b82f6,stroke:#1e40af,color:#fff
    style WBX fill:#8b5cf6,stroke:#6d28d9,color:#fff
    style CAS fill:#ec4899,stroke:#be185d,color:#fff
    style SB_DB fill:#10b981,stroke:#047857,color:#fff
    style SB_AUTH fill:#10b981,stroke:#047857,color:#fff
    style SB_STORAGE fill:#10b981,stroke:#047857,color:#fff
```

---

## 🔄 Data Flow Diagrams

### User Request Flow (AI Chat)

```mermaid
sequenceDiagram
    actor User
    participant WX as wish-x<br/>(Frontend)
    participant SB as Supabase<br/>(Auth & DB)
    participant CAS as claude-agent-server<br/>(AI Server)
    participant AI as Anthropic API<br/>(Claude)

    User->>WX: Send chat message
    WX->>SB: Verify JWT token
    SB-->>WX: Token valid ✓

    WX->>SB: Save message to DB
    SB-->>WX: Message saved

    WX->>CAS: Send message via WebSocket
    CAS->>SB: Verify token
    SB-->>CAS: Token valid ✓

    CAS->>AI: Stream request with context

    loop Streaming Response
        AI-->>CAS: Response chunk
        CAS->>WX: Forward chunk via WebSocket
        WX->>User: Display chunk in real-time
    end

    CAS->>SB: Save AI response to DB
    SB-->>CAS: Response saved

    CAS->>WX: Response complete
    WX->>User: Show complete response
```

---

### Background Job Flow (Document Generation)

```mermaid
sequenceDiagram
    actor User
    participant WX as wish-x<br/>(Frontend)
    participant SB as Supabase<br/>(Database)
    participant WBX as wish-backend-x<br/>(Trigger.dev)
    participant AI as AI APIs<br/>(Claude/GPT)
    participant DOCX as Document Generator<br/>(DOCX/PDF)

    User->>WX: Request document generation
    WX->>SB: Create job record (pending)
    SB-->>WX: Job created (ID: 123)

    WX->>WBX: Trigger background job
    WBX-->>WX: Job queued ✓
    WX->>User: "Document generation started..."

    Note over WBX: Job runs in background

    WBX->>SB: Update job status (processing)
    WBX->>AI: Generate content
    AI-->>WBX: Content generated

    WBX->>DOCX: Create formatted document
    DOCX-->>WBX: Document file

    WBX->>SB: Upload to Supabase Storage
    SB-->>WBX: File URL

    WBX->>SB: Update job status (complete)
    WBX->>SB: Save file URL

    Note over WX: Frontend polls for updates

    WX->>SB: Check job status
    SB-->>WX: Status: complete
    WX->>SB: Get document URL
    SB-->>WX: File URL

    WX->>User: "Document ready! Click to download"
    User->>WX: Click download
    WX->>SB: Request file from Storage
    SB-->>User: Download document file
```

---

### Authentication Flow

```mermaid
sequenceDiagram
    actor User
    participant WX as wish-x<br/>(Frontend)
    participant SB_AUTH as Supabase Auth
    participant SB_DB as Supabase DB
    participant CAS as claude-agent-server

    User->>WX: Enter email + password
    WX->>SB_AUTH: signInWithPassword()

    alt Valid Credentials
        SB_AUTH-->>WX: JWT access token + refresh token
        WX->>SB_DB: Fetch user profile
        SB_DB-->>WX: User data
        WX->>User: Redirect to dashboard

        Note over User,WX: User interacts with app

        User->>WX: Send AI request
        WX->>CAS: WebSocket + JWT token
        CAS->>SB_AUTH: Verify JWT
        SB_AUTH-->>CAS: Token valid ✓
        CAS-->>WX: Process request
    else Invalid Credentials
        SB_AUTH-->>WX: Error: Invalid credentials
        WX->>User: Show error message
    end

    Note over WX,SB_AUTH: Token refresh (happens automatically)

    WX->>SB_AUTH: Refresh token
    SB_AUTH-->>WX: New JWT access token
```

---

## 📦 Technology Stack by Component

### wish-x (Frontend)

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Framework** | Next.js 15 (App Router) | Server-side rendering, routing |
| **UI Library** | React 19 | Component-based UI |
| **Language** | TypeScript | Type safety |
| **Styling** | Tailwind CSS v4 | Utility-first styling |
| **Components** | Radix UI | Accessible primitives |
| **State** | Zustand | Global state management |
| **Forms** | React Hook Form + Zod | Form handling + validation |
| **Editor** | TipTap | Rich text editing |
| **AI SDK** | Vercel AI SDK | AI model integration |
| **Auth** | Supabase Auth | User authentication |
| **Database** | Supabase Client | Database queries |

---

### wish-backend-x (Background Jobs)

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Orchestration** | Trigger.dev v4 | Job scheduling & queueing |
| **Runtime** | Node.js | JavaScript runtime |
| **Language** | TypeScript | Type safety |
| **AI Integration** | Anthropic SDK, OpenAI SDK | AI model access |
| **Database** | Supabase Client | Data persistence |
| **Document Gen** | docx, PDFKit | DOCX/PDF creation |

---

### claude-agent-server (AI Server)

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Framework** | Custom Node.js server | WebSocket handling |
| **Protocol** | WebSocket | Real-time bidirectional |
| **AI SDK** | Anthropic Claude SDK | Claude model access |
| **Database** | Supabase Client | Store conversations |
| **Auth** | Supabase Auth | Token verification |

---

### Supabase (Data Layer)

| Service | Technology | Purpose |
|---------|------------|---------|
| **Database** | PostgreSQL 15 | Relational data storage |
| **Auth** | Supabase Auth | JWT-based authentication |
| **Storage** | Supabase Storage | File uploads (S3-compatible) |
| **RLS** | Row Level Security | Data access control |
| **Real-time** | PostgreSQL LISTEN/NOTIFY | Live data updates |

---

## 🚀 Deployment Architecture

### Development Environment

```mermaid
graph TB
    subgraph "Local Machine"
        DEV_WX[wish-x<br/>localhost:3000<br/>npm run dev]
        DEV_CAS[claude-agent-server<br/>localhost:3003<br/>npm run dev]
    end

    subgraph "Cloud Services"
        DEV_SB[Supabase<br/>Development Project]
        DEV_WBX[Trigger.dev<br/>Dev Environment]
    end

    DEV_WX -->|API Calls| DEV_SB
    DEV_WX -->|WebSocket| DEV_CAS
    DEV_WX -->|Trigger Jobs| DEV_WBX
    DEV_CAS -->|Database| DEV_SB
    DEV_WBX -->|Database| DEV_SB

    style DEV_WX fill:#60a5fa,stroke:#2563eb,color:#fff
    style DEV_CAS fill:#f472b6,stroke:#ec4899,color:#fff
    style DEV_SB fill:#34d399,stroke:#10b981,color:#fff
    style DEV_WBX fill:#a78bfa,stroke:#8b5cf6,color:#fff
```

---

### Production Environment

```mermaid
graph TB
    subgraph "Vercel"
        PROD_WX[wish-x<br/>z1.andiami.tech<br/>Auto-deploy from staging]
    end

    subgraph "VPS (y1.andiami.tech)"
        NGINX[nginx<br/>Reverse Proxy]
        PM2[PM2 Process Manager]

        subgraph "PM2 Services"
            PROD_CAS[claude-agent-server<br/>Port 3003]
            DOCS[docs-viewer<br/>Port 3001]
        end
    end

    subgraph "Cloud Services"
        PROD_SB[Supabase<br/>Production Project]
        PROD_WBX[Trigger.dev<br/>Production Env]
    end

    NGINX -->|Proxy| PROD_CAS
    NGINX -->|Proxy| DOCS
    PM2 -->|Manages| PROD_CAS
    PM2 -->|Manages| DOCS

    PROD_WX -->|API Calls| PROD_SB
    PROD_WX -->|WebSocket| NGINX
    NGINX -->|Forward| PROD_CAS
    PROD_WX -->|Trigger Jobs| PROD_WBX

    PROD_CAS -->|Database| PROD_SB
    PROD_WBX -->|Database| PROD_SB

    style PROD_WX fill:#3b82f6,stroke:#1e40af,color:#fff
    style NGINX fill:#fb923c,stroke:#ea580c,color:#fff
    style PM2 fill:#fbbf24,stroke:#f59e0b,color:#000
    style PROD_CAS fill:#ec4899,stroke:#be185d,color:#fff
    style PROD_SB fill:#10b981,stroke:#047857,color:#fff
    style PROD_WBX fill:#8b5cf6,stroke:#6d28d9,color:#fff
```

---

## 📋 Minimum Setup Requirements

### Option 1: Frontend Only (Quickest Start)

**Time:** 30-60 minutes

**Components:**
- ✅ wish-x (Frontend)
- ✅ claude-agent-server (AI Server)
- ✅ Supabase (Database + Auth)

**What You Get:**
- Multi-agent chat interface
- Real-time AI streaming responses
- User authentication
- Chat history storage

**What You DON'T Get:**
- Background job processing
- Document generation
- Automated documentation

**Best For:**
- Learning the system
- Building chat-based AI applications
- Prototyping AI interactions

---

### Option 2: Full System (Production Ready)

**Time:** 2-4 hours

**Components:**
- ✅ wish-x (Frontend)
- ✅ wish-backend-x (Background Jobs)
- ✅ claude-agent-server (AI Server)
- ✅ Supabase (Database + Auth)
- ✅ docs-viewer (Documentation - optional)
- ✅ doc-automation-hub (Auto-docs - optional)

**What You Get:**
- Everything from Option 1, PLUS:
- Background job processing
- Long-running AI tasks
- Document generation (PDF, DOCX)
- Automated documentation
- Complete production setup

**Best For:**
- Production deployment
- Complex AI workflows
- Document automation
- Team collaboration

---

## 🔐 Security Architecture

### Authentication Flow

```mermaid
graph TB
    subgraph "Client Side"
        A[User Browser<br/>JWT in localStorage]
    end

    subgraph "Supabase Auth"
        B[Auth Service<br/>JWT Signing]
        C[Token Verification]
    end

    subgraph "Application Layer"
        D[wish-x<br/>SUPABASE_ANON_KEY]
        E[wish-backend-x<br/>SERVICE_ROLE_KEY]
        F[claude-agent-server<br/>Verify JWT]
    end

    subgraph "Data Layer"
        G[(PostgreSQL<br/>RLS Enabled)]
    end

    A -->|Login| B
    B -->|JWT Token| A
    A -->|Requests + JWT| D
    D -->|Verify| C
    C -->|Valid| D

    D -->|RLS Query<br/>auth.uid()| G
    E -->|Bypass RLS<br/>Service Role| G
    F -->|Verify JWT| C
    F -->|RLS Query| G

    style A fill:#64748b,stroke:#475569,color:#fff
    style B fill:#10b981,stroke:#047857,color:#fff
    style C fill:#10b981,stroke:#047857,color:#fff
    style D fill:#3b82f6,stroke:#1e40af,color:#fff
    style E fill:#8b5cf6,stroke:#6d28d9,color:#fff
    style F fill:#ec4899,stroke:#be185d,color:#fff
    style G fill:#10b981,stroke:#047857,color:#fff
```

**Security Layers:**

| Layer | Protection | Implementation |
|-------|------------|----------------|
| **Transport** | HTTPS/WSS | TLS encryption |
| **Authentication** | JWT tokens | Supabase Auth |
| **Authorization** | Row Level Security (RLS) | PostgreSQL policies |
| **Input Validation** | Zod schemas | Client & server validation |
| **API Keys** | Environment variables | Never committed to git |
| **CORS** | Origin restrictions | Configured per environment |

---

## 📊 Scalability Considerations

### Current Limits (Single Server)

| Component | Current Limit | Scaling Strategy |
|-----------|---------------|------------------|
| **wish-x** | Vercel auto-scaling | Automatic (edge network) |
| **claude-agent-server** | ~100 concurrent WebSockets | Add load balancer + multiple instances |
| **wish-backend-x** | Trigger.dev handles scaling | Automatic (managed service) |
| **Supabase** | Free tier: 500MB DB | Upgrade to paid tier ($25/month for 8GB) |

---

### Scaling Paths

**Stage 1: Single Server (Current)**
- 1-100 users
- Single PM2 instance per service
- Supabase free tier
- Cost: $10-50/month

**Stage 2: Load Balanced**
- 100-1,000 users
- Multiple claude-agent-server instances
- nginx load balancer
- Supabase Pro tier
- Cost: $100-300/month

**Stage 3: Distributed**
- 1,000-10,000 users
- Kubernetes cluster
- Redis for session management
- Supabase Team tier
- CDN for static assets
- Cost: $500-2,000/month

---

## 🔍 Monitoring & Observability

### Key Metrics to Track

**Frontend (wish-x):**
- Page load time (target: <2 seconds)
- Time to first byte (TTFB)
- Core Web Vitals (LCP, FID, CLS)
- JavaScript error rate

**Backend (wish-backend-x):**
- Job completion rate
- Average job duration
- Failed job count
- Queue depth

**AI Server (claude-agent-server):**
- WebSocket connection count
- Message latency
- Error rate
- AI API response time

**Database (Supabase):**
- Query performance
- Connection pool usage
- Storage usage
- Active user count

---

## 🛠️ Troubleshooting Guide

### Common Issues

**Issue: wish-x shows "Unable to connect to server"**
```
Check:
1. Is claude-agent-server running? (pm2 list)
2. Is WebSocket URL correct in .env?
3. Is nginx proxying WebSocket correctly?
```

**Issue: Background jobs not processing**
```
Check:
1. Is Trigger.dev deployed? (npx trigger.dev deploys list)
2. Are env vars set correctly?
3. Check Trigger.dev dashboard for errors
```

**Issue: Authentication fails**
```
Check:
1. Are Supabase keys correct in .env?
2. Is Supabase RLS policy allowing access?
3. Is JWT token expired? (check browser localStorage)
```

---

## 📚 Related Documentation

- [wish-x Setup Guide](./wish-x) - Frontend development
- [wish-backend-x Setup Guide](./wish-backend-x) - Background job configuration
- [claude-agent-server Setup Guide](./claude-agent-server) - AI server deployment
- [Supabase Configuration](./workspace-claude-files/docs/03-development/supabase-config.md) - Database setup
- [Deployment Workflow](./workspace-claude-files/docs/05-deployment/deployment-workflow.md) - Production deployment

---

**Questions about architecture?** Check the [workspace-claude-files](./workspace-claude-files) for detailed development guidelines, or explore [workspace-documentation](./workspace-documentation) for implementation examples.
