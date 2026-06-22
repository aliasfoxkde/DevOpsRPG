# Plan - DevOpsQuest

**Version**: 1.0.0
**Last Updated**: 2026-06-22
**Status**: APPROVED

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Cloudflare Pages                         │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Next.js 14 App (CSR-first)             │    │
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
         │   (User Data)     │  │   (Sessions)    │
         └──────────────────┘  └─────────────────┘
```

## Technology Stack

| Layer | Technology | Justification |
|-------|------------|---------------|
| Frontend | Next.js 14 + TypeScript | App Router, CSR-first, excellent DX |
| Styling | Tailwind CSS + CSS Variables | Theme system, dark/light modes |
| State | React Context + localStorage | Simple, offline-capable |
| Backend | Cloudflare Workers | Edge computing, free tier |
| Database | Cloudflare D1 (SQLite) | SQL at edge, zero config |
| Sessions | Cloudflare KV | Fast key-value session store |
| Auth | Google/GitHub OAuth | Standard SSO, Workers integration |
| Deployment | Cloudflare Pages | Free hosting, global CDN |
| Testing | Vitest + Playwright | 80% coverage target |

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

## Career Path Themes

1. **Web Developer**: HTML → CSS → JS → React → NodeJS → SQL → Bootstrap → jQuery
2. **Backend Engineer**: Python → Java → SQL → PostgreSQL → NodeJS → Django → Docker
3. **DevOps Engineer**: Git → Bash → AWS → Docker → Cybersecurity → Python → Tools
4. **Data Scientist**: Python → SQL → NumPy → Pandas → SciPy → R → Data Science
5. **Mobile Developer**: Swift → Kotlin → React → NodeJS → SASS

## Gamification System

### XP & Leveling
- Topic completion: 50-200 XP (difficulty-scaled)
- Quiz pass: 25-100 XP
- Daily streak: +10% XP per consecutive day
- Level formula: `level = floor(sqrt(xp / 100))`

### Achievements
- First Steps (complete 1 topic)
- Dedicated Learner (7-day streak)
- Polyglot (5 categories)
- Master (complete a phase)
- Speed Demon (<5 min per topic)

### Daily Rewards
- Day 1: 10 XP bonus
- Day 3: 25 XP bonus
- Day 7: 50 XP + badge
- Day 30: 200 XP + "Monthly Champion"

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

## Implementation Phases

### Phase 1: Foundation (Current)
- [x] Project setup with Next.js 14
- [ ] Tailwind CSS with dark/light mode
- [ ] Theme system (CSS variables)
- [ ] PWA manifest + service worker
- [ ] Basic layout components

### Phase 2: Authentication
- [ ] Cloudflare Workers setup
- [ ] Google OAuth
- [ ] GitHub OAuth
- [ ] Session management
- [ ] D1 schema + migrations

### Phase 3: Core Learning UI
- [ ] Technology catalog
- [ ] Topic viewer (W3Schools iframe)
- [ ] Progress tracking
- [ ] Navigation

### Phase 4: Gamification
- [ ] XP system
- [ ] Level calculations
- [ ] Achievement system
- [ ] Streak tracker
- [ ] Theme selection

### Phase 5: Polish & PWA
- [ ] Service worker
- [ ] Offline support
- [ ] Install prompt

### Phase 6: Testing & Deployment
- [ ] Unit tests (Vitest)
- [ ] E2E tests (Playwright)
- [ ] CI/CD pipeline
- [ ] 80% coverage
- [ ] Cloudflare Pages deploy

## Timeline

```
Week 1-2: Phase 1 (Foundation)
Week 3-4: Phase 2 (Authentication)
Week 5-6: Phase 3 (Core UI)
Week 7: Phase 4 (Gamification)
Week 8: Phase 5 (Polish)
Week 9-10: Phase 6 (Testing + Deploy)
```

## Success Metrics

- PWA Lighthouse: 90+
- FCP: <1.5s
- TTI: <3s
- Test coverage: 80%+
- All core features functional
- Deployed on Cloudflare Pages
