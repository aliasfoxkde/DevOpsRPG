# Architecture - DevOpsQuest

**Version**: 1.0.0
**Last Updated**: 2026-06-22
**Status**: APPROVED

---

## Technology Stack

| Layer | Technology | Justification |
|-------|------------|---------------|
| Frontend | ViteJS + React 19 | CSR-first SPA, excellent DX, fast builds |
| Styling | Tailwind CSS v4 | Theme system, dark/light modes via @tailwindcss/vite |
| State | React Context + localStorage | Simple, offline-capable |
| Backend | Cloudflare Workers | Edge computing, free tier |
| Database | Cloudflare D1 (SQLite) | SQL at edge, zero config |
| Sessions | Cloudflare KV | Fast key-value session store |
| Auth | Google/GitHub OAuth | Standard SSO, Workers integration |
| Deployment | Cloudflare Pages | Free hosting, global CDN |
| Testing | Vitest + Playwright | Unit and E2E coverage |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Cloudflare Pages                         │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              ViteJS + React SPA                      │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │    │
│  │  │   PWA    │  │  Theme    │  │  Progress Track  │  │    │
│  │  │  Service │  │  Manager  │  │  & Gamification  │  │    │
│  │  └──────────┘  └──────────┘  └──────────────────┘  │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Cloudflare Workers                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────────┐  │
│  │   Auth    │  │   API     │  │   OAuth (Google/GitHub)  │  │
│  │  Handler  │  │  Gateway  │  │                          │  │
│  └──────────┘  └──────────┘  └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                    │                    │
                    ▼                    ▼
         ┌──────────────────┐  ┌─────────────────┐
         │   Cloudflare D1   │  │  Cloudflare KV  │
         │   (User Data)     │  │   (Sessions)   │
         └──────────────────┘  └─────────────────┘
```

---

## Career Path Themes

1. **Web Developer**: HTML → CSS → JS → React → NodeJS → SQL → Bootstrap → jQuery
2. **Backend Engineer**: Python → Java → SQL → PostgreSQL → NodeJS → Django → Docker
3. **DevOps Engineer**: Git → Bash → AWS → Docker → Cybersecurity → Python → Tools
4. **Data Scientist**: Python → SQL → NumPy → Pandas → SciPy → R → Data Science
5. **Mobile Developer**: Swift → Kotlin → React → NodeJS → SASS

---

## Learning Path Order (47 Technologies)

### Phase 1 - Foundations (6)
INTRO TO PROGRAMMING → INTRO TO HTML & CSS → HTML → CSS → JAVASCRIPT → SQL

### Phase 2 - Backend Basics (8)
PYTHON → JAVA → PHP → C → C++ → C# → HOW TO → W3.CSS

### Phase 3 - Frameworks & Databases (11)
BOOTSTRAP → REACT → MYSQL → JQUERY → EXCEL → XML → DJANGO → NUMPY → PANDAS → NODEJS → DSA

### Phase 4 - Advanced & Cloud (9)
TYPESCRIPT → ANGULAR → ANGULARJS → GIT → POSTGRESQL → MONGODB → ASP → AI → R

### Phase 5 - Modern DevOps (13)
GO → KOTLIN → SWIFT → SASS → VUE → GEN AI → SCIPY → AWS → CYBERSECURITY → DATA SCIENCE → BASH → RUST → TOOLS

---

## Database Schema

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  provider TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak_days INTEGER DEFAULT 0,
  last_active DATE,
  theme TEXT DEFAULT 'web-developer',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE progress (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  technology TEXT NOT NULL,
  topic TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  xp_earned INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0,
  completed_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE achievements (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  achievement_key TEXT NOT NULL,
  earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## Cloudflare Deployment

### Pages Configuration
- Build command: `npm run build:cloudflare`
- Output directory: `dist`
- Node version: 18

### Workers Configuration
- Wrangler.toml for worker bindings
- D1 database bindings
- KV namespace bindings
