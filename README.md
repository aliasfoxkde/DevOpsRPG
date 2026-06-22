# DevOpsQuest

**Gamified DevOps Learning Platform**

Transform your DevOps learning journey into an RPG-style adventure. Master 47+ technologies through W3Schools tutorials while earning XP, unlocking achievements, and building streaks.

## Features

- 🎮 **Gamified Learning**: Earn XP, level up, unlock achievements
- 📚 **47+ Technologies**: HTML, CSS, JavaScript, Python, SQL, and more
- 🛤️ **5 Career Paths**: Web Developer, Backend Engineer, DevOps, Data Science, Mobile
- 🔥 **Daily Streaks**: Keep your streak alive with consistent learning
- 🌙 **Dark/Light Mode**: Supports system preference
- 📱 **PWA**: Install as a native app
- ☁️ **Cloudflare Edge**: Fast global deployment

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, React 18
- **Styling**: Tailwind CSS
- **Backend**: Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite)
- **Sessions**: Cloudflare KV
- **Auth**: Google/GitHub OAuth
- **Deployment**: Cloudflare Pages

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Wrangler CLI (`npm i -g wrangler`)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/devopsquest.git
cd devopsquest

# Install dependencies
npm install

# Start development server
npm run dev
```

### Cloudflare Setup

1. Create a Cloudflare account
2. Install Wrangler: `npm i -g wrangler`
3. Login: `wrangler login`
4. Create D1 database: `wrangler d1 create devopsquest-db`
5. Update `wrangler.toml` with your database ID
6. Run migrations: `wrangler d1 execute devopsquest-db --file=./drizzle/schema.sql`

### Environment Variables

Create a `.dev.vars` file:

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start         # Start production server
npm run lint          # Run ESLint
npm run test          # Run unit tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage
npm run test:e2e      # Run E2E tests (Playwright)
```

## Project Structure

```
devopsquest/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Homepage
│   │   ├── learn/           # Learning pages
│   │   └── dashboard/       # User dashboard
│   ├── components/          # React components
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility functions
│   ├── data/                 # Static data (technologies, achievements)
│   └── types/                # TypeScript types
├── public/                   # Static assets
│   ├── manifest.json         # PWA manifest
│   └── sw.js                 # Service worker
├── workers/                  # Cloudflare Workers
│   └── api/                  # API handlers
├── drizzle/                  # Database schema
└── tests/                   # Test files
```

## Learning Path

### Phase 1: Foundations
- Intro to Programming
- Intro to HTML & CSS
- HTML
- CSS
- JavaScript
- SQL

### Phase 2: Backend Basics
- Python
- Java
- PHP
- C
- C++
- C#
- HOW TO
- W3.CSS

### Phase 3: Frameworks & Databases
- Bootstrap
- React
- MySQL
- jQuery
- Excel
- XML
- Django
- NumPy
- Pandas
- NodeJS
- DSA

### Phase 4: Advanced & Cloud
- TypeScript
- Angular
- AngularJS
- Git
- PostgreSQL
- MongoDB
- ASP
- AI
- R

### Phase 5: Modern DevOps
- Go
- Kotlin
- Swift
- SASS
- Vue
- Gen AI
- SciPy
- AWS
- Cybersecurity
- Data Science
- Bash
- Rust
- Tools

## Career Paths

1. **Web Developer**: HTML → CSS → JS → React → NodeJS → SQL
2. **Backend Engineer**: Python → Java → SQL → PostgreSQL → NodeJS → Django
3. **DevOps Engineer**: Git → Bash → AWS → Docker → Cybersecurity → Tools
4. **Data Scientist**: Python → SQL → NumPy → Pandas → SciPy → R
5. **Mobile Developer**: Swift → Kotlin → React → NodeJS → SASS

## Gamification

- **XP**: Earn 50-200 XP per topic (difficulty-scaled)
- **Streaks**: 10% bonus XP per consecutive day (capped at 100%)
- **Levels**: `level = floor(sqrt(totalXP / 100))`
- **Achievements**: Unlock badges for milestones

## Deployment

### Cloudflare Pages

```bash
# Build the project
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy .next --project-name=devopsquest
```

## License

MIT License - see LICENSE file for details.

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

---

Built with 💜 for DevOps learners everywhere.
