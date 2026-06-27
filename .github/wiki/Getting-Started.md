# Getting Started

## Prerequisites

- Node.js >= 20
- npm >= 10
- Git
- GitHub CLI (`gh`)

## Clone the Repository

```bash
git clone https://github.com/aliasfoxkde/DevOpsRPG.git
cd DevOpsRPG
```

## Install Dependencies

```bash
npm install
```

## Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Build for Production

```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Testing

```bash
# Run all tests
npm run test

# Run with coverage
npm run coverage

# Run linting
npm run lint

# Type check
npm run typecheck
```

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── ui/          # Base components (Button, Modal, etc.)
│   ├── minigames/   # Mini-games (Quiz, Memory, etc.)
│   └── layout/      # Layout components
├── contexts/        # React Context providers
├── data/           # Game data (quests, badges, etc.)
├── hooks/          # Custom React hooks
├── pages/          # Page components
└── utils/          # Utility functions
```

## Submitting Feedback

1. Click the Feedback button in the app header
2. Select feedback type (Bug, Feature, Change, or Praise)
3. Fill in the required fields
4. Submit - creates a GitHub issue automatically

## Common Tasks

### Adding a New Quest

Edit `src/data/quests.ts` following the existing pattern.

### Adding a New Badge

Edit `src/data/badges.ts` following the existing pattern.

### Running Full Validation

```bash
npm run lint && npm run typecheck && npm run test && npm run build
```

## Troubleshooting

### Port already in use

```bash
npx kill-port 5173
```

### Clear localStorage

```bash
# In browser console
localStorage.clear()
location.reload()
```