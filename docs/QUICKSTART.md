# Quick Start - DevOpsRPG

**Get up and running in 5 minutes**

---

## 1. Clone & Install

```bash
git clone https://github.com/aliasfoxkde/DevOpsRPG.git
cd DevOpsRPG
npm install
```

## 2. Start Development

```bash
npm run dev
```

Open http://localhost:5173

## 3. Build for Production

```bash
npm run build
npm run preview
```

---

## What's Next?

| Task                                             | Command                                                                        |
| ------------------------------------------------ | ------------------------------------------------------------------------------ |
| Run tests                                        | `npm run test`                                                                 |
| Lint code                                        | `npm run lint`                                                                 |
| Type check                                       | `npm run typecheck`                                                            |
| Full validation                                  | `npm run validate` (lint, typecheck, format, knip, unit + worker tests, build) |
| Unit tests + coverage ratchet                    | `npm run test:coverage`                                                        |
| E2E (3 browsers, needs `npx playwright install`) | `npm run test:e2e`                                                             |

---

## Common Issues

**Port in use:**

```bash
npx kill-port 5173
```

**Clear localStorage:**

```bash
localStorage.clear()
location.reload()
```

---

For full documentation, see [docs/README.md](./README.md)
