---
slug: /
sidebar_position: 1
---

# As You Wish Ecosystem Documentation

Welcome to the documentation hub for the **As You Wish Ecosystem** - a production-ready AI development platform.

---

## 🎯 What is As You Wish?

As You Wish is a **complete AI development ecosystem** that combines modern frontend, background processing, and real-time AI agents into a unified platform for building production-grade AI applications.

### What It Provides

- 🎨 **Modern Frontend** - Next.js 15 + React 19 multi-agent chat interface with visual workflow builder
- ⚙️ **Background Processing** - Trigger.dev v4 orchestration for long-running AI tasks
- 🤖 **Real-time AI Agents** - WebSocket server for streaming AI interactions
- 📚 **Documentation Automation** - Automated docs generation and synchronization
- 🛠️ **Development Tools** - Claude configuration files and comprehensive deployment workflows

### Who Is This For?

- ✅ **Full-stack developers** building AI-powered applications
- ✅ **AI engineers** integrating multiple AI models (Claude, GPT, Gemini, xAI)
- ✅ **Product teams** creating multi-agent workflow systems
- ✅ **DevOps engineers** deploying scalable AI infrastructure

### What You Can Build

- 🤖 Multi-model AI chat applications with parallel conversations
- 🔄 Visual workflow builders with AI agent orchestration
- 📄 Document generation systems (PDF, Google Docs, DOCX)
- 🎨 Custom theme systems with 50+ design tokens
- 🔐 Secure, production-grade auth and data management

---

## 🚀 Quick Start (Choose Your Path)

**Not sure where to begin?** Choose the path that matches your role and available time:

### Path 1: Frontend Developer (30-60 minutes)
**Best for:** Building AI chat interfaces, working with React/Next.js

**Start here:** [wish-x Quick Start](./wish-x#quick-start)

**What you'll build:** A working AI chat interface with multiple models

**Prerequisites:**
- Node.js 18.17+
- Supabase account (free tier)
- Basic React/TypeScript knowledge

---

### Path 2: Backend Developer (30-60 minutes)
**Best for:** AI task orchestration, background job processing

**Start here:** [wish-backend-x Quick Start](./wish-backend-x#quick-start)

**What you'll build:** Background AI task processing system

**Prerequisites:**
- Node.js 18.17+
- Trigger.dev account (free tier)
- Basic API development experience

---

### Path 3: Full System Setup (2-4 hours)
**Best for:** Production deployment, full ecosystem understanding

**What you'll deploy:** Complete AI development platform

**Prerequisites:**
- All frontend & backend prerequisites
- PM2, nginx, domain name
- DevOps experience recommended

**Steps:**
1. Setup [wish-x (Frontend)](./wish-x)
2. Setup [wish-backend-x (Backend)](./wish-backend-x)
3. Setup [claude-agent-server (AI Agent)](./claude-agent-server)
4. Configure deployment with PM2 + nginx
5. Verify with comprehensive testing

---

### Path 4: Just Browsing (5-10 minutes)
**Best for:** Understanding architecture and capabilities

**Quick tour:**
1. Review project descriptions below
2. Check [workspace-claude-files](./workspace-claude-files) for development guidelines
3. Browse implementation examples in the workspace documentation sections

---

## 📋 Before You Start

### Required Accounts (All Free Tiers Available)

| Service | Purpose | Sign Up | Free Tier | Estimated Cost |
|---------|---------|---------|-----------|----------------|
| **Supabase** | Database & Auth | [Sign up](https://supabase.com) | ✅ 500MB DB, 50K MAU | $0-25/month |
| **Trigger.dev** | Background Jobs | [Sign up](https://trigger.dev) | ✅ 1000 runs/month | $0-20/month |
| **Anthropic** | Claude API | [Sign up](https://anthropic.com) | ⚠️ Pay-as-you-go | $5-50/month |
| **OpenAI** | GPT API (optional) | [Sign up](https://openai.com) | ⚠️ Pay-as-you-go | Optional |
| **Vercel** | Frontend Hosting | [Sign up](https://vercel.com) | ✅ Unlimited hobby projects | $0-20/month |

**💡 Total estimated cost for development:** $10-115/month (depending on usage)

---

### Required Tools

| Tool | Version | Install | Verify |
|------|---------|---------|--------|
| **Node.js** | 18.17+ | [Download](https://nodejs.org) | `node --version` |
| **npm** or **yarn** | Latest | Included with Node.js | `npm --version` |
| **Git** | 2.0+ | [Download](https://git-scm.com) | `git --version` |
| **VS Code** | Latest (recommended) | [Download](https://code.visualstudio.com) | - |

---

### Required Knowledge

**Essential (You Must Know):**
- ✅ JavaScript/TypeScript basics
- ✅ Command line / terminal usage
- ✅ Git basics (clone, commit, push)
- ✅ Environment variables (.env files)

**Recommended (Makes Learning Easier):**
- ⚠️ React fundamentals (components, hooks, state)
- ⚠️ Next.js basics (App Router, Server Components)
- ⚠️ API development (REST, WebSockets)
- ⚠️ Database basics (SQL, RLS policies)

**Helpful But Not Required:**
- 💡 TypeScript advanced features
- 💡 Tailwind CSS
- 💡 PM2 process management
- 💡 nginx configuration

**Skill Level Assessment:**
- 🟢 **Beginner-Friendly:** Frontend development with wish-x (if you know React)
- 🟡 **Intermediate:** Backend development with wish-backend-x (API experience helpful)
- 🔴 **Advanced:** Full system deployment (requires DevOps knowledge)

---

### Time Commitment

| Task | Time Estimate | Prerequisites |
|------|---------------|---------------|
| **Explore Documentation** | 15-30 minutes | None |
| **Setup Frontend (wish-x)** | 30-60 minutes | Supabase account |
| **Setup Backend (wish-backend-x)** | 30-60 minutes | Trigger.dev account |
| **Deploy to Production** | 2-4 hours | Domain, nginx, PM2 |
| **Learn Complete System** | 8-16 hours | All prerequisites |

---

## 📚 Projects

| Project | Description | Setup Time |
|---------|-------------|------------|
| [**wish-x**](./wish-x) | **Frontend** - Next.js 15 + React 19 UI<br/>→ Multi-agent chat interface with visual workflow builder<br/>→ Start here if: Building AI user interfaces | ⏱️ 30-60 min |
| [**wish-backend-x**](./wish-backend-x) | **Backend** - Trigger.dev v4 orchestration<br/>→ Background AI task processing and job scheduling<br/>→ Start here if: Building backend AI services | ⏱️ 30-60 min |
| [**claude-agent-server**](./claude-agent-server) | **AI Agent** - WebSocket + Agent SDK<br/>→ Real-time streaming AI interactions<br/>→ Start here if: Building WebSocket AI servers | ⏱️ 15-30 min |
| [**doc-automation-hub**](./doc-automation-hub) | **Documentation** - Automated docs generation<br/>→ GitHub Actions + Claude Code CLI integration<br/>→ Start here if: Automating documentation workflows | ⏱️ 45-60 min |
| [**workspace-claude-files**](./workspace-claude-files) | **Configuration & References** - Claude Code instructions + implementation docs<br/>→ Contains CLAUDE.md (Global Instructions) and 149 implementation docs<br/>→ Start here if: Understanding development guidelines or looking for implementation examples | ⏱️ 5-10 min (reading) |

---

## 💎 Why Choose As You Wish?

### Production-Ready from Day One

Unlike tutorial code or starter templates, As You Wish provides:

- ✅ **Production-grade security** - Supabase RLS policies, zero-tolerance security protocols
- ✅ **Real-time streaming** - Server-sent events with Trigger.dev orchestration
- ✅ **Multi-model support** - Claude, GPT, Gemini, xAI in one interface
- ✅ **Visual workflow builder** - Create complex multi-agent flows without coding
- ✅ **Complete deployment guide** - From local dev to production in 10 steps
- ✅ **Comprehensive testing** - Pre-deployment verification built-in

### What You Get Out of the Box

- 🎨 Multi-agent chat UI ($5,000-10,000 value)
- ⚙️ Background job orchestration ($3,000-7,000 value)
- 🤖 Real-time WebSocket server ($2,000-5,000 value)
- 🔐 Authentication system ($1,000-3,000 value)
- 💾 Database with RLS ($2,000-5,000 value)
- 🚀 Deployment automation ($1,000-2,000 value)

**Total value:** $15,500-35,000 of production-ready code

**Your cost:** Free (open source) + hosting/API fees ($10-115/month)

---

## 🏗️ System Architecture (Simplified)

```
┌─────────────────────────────────────────────────┐
│  Frontend Layer                                 │
│  ┌─────────────────────────────────────────┐  │
│  │  wish-x (Next.js 15 + React 19)         │  │
│  │  • Multi-agent chat UI                  │  │
│  │  • Visual flow builder                  │  │
│  │  • Theme system                         │  │
│  └─────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                     ↓ ↑
┌─────────────────────────────────────────────────┐
│  Backend Layer                                  │
│  ┌───────────────────┐  ┌──────────────────┐  │
│  │ wish-backend-x    │  │ claude-agent-    │  │
│  │ (Trigger.dev)     │  │ server (WebSocket)│  │
│  │ • Background jobs │  │ • Real-time AI   │  │
│  │ • Task queuing    │  │ • Streaming      │  │
│  └───────────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────┘
                     ↓ ↑
┌─────────────────────────────────────────────────┐
│  Data Layer                                     │
│  ┌─────────────────────────────────────────┐  │
│  │  Supabase (PostgreSQL + Auth + Storage) │  │
│  │  • Database with RLS                     │  │
│  │  • User authentication                   │  │
│  │  • File storage                          │  │
│  └─────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

**Minimum setup:** You can start with just 3 components:
1. wish-x (Frontend) - Required
2. claude-agent-server (AI Server) - Required
3. Supabase (Database) - Required

**Optional components to add later:**
- wish-backend-x (when you need background processing)
- doc-automation-hub (when you want automated documentation)

---

## 🤝 Getting Help

- 📖 **Documentation:** You're reading it!
- 🐛 **Bug reports:** Check project-specific GitHub repositories
- 💬 **Questions:** Use GitHub Discussions or Issues
- 📧 **Email support:** Check individual project READMEs for contact info

---

## For AI Tools

This documentation is AI-friendly. Access methods:

- **llms.txt**: [/docs-viewer/llms.txt](/llms.txt) - Instructions for AI assistants
- **Sitemap**: [/docs-viewer/sitemap.xml](/sitemap.xml) - All page URLs
- **robots.txt**: [/docs-viewer/robots.txt](/robots.txt) - Crawler permissions

All pages are static HTML - no JavaScript required to read content.

---

**Ready to start?** Choose your path above or explore the projects below! 🚀
