# CodeQuest

CodeQuest is an installable web app (PWA) for learning to code. Each lesson has a short intro with a live code sandbox, hands-on challenges that are checked by running real code in the browser, and a quiz.

Live site: <https://ubuntu-apps.github.io/code-quest/>

## Courses

| Course | Status | Code runs with |
| --- | --- | --- |
| Python | Live, 10 sections | [Pyodide](https://pyodide.org) in a Web Worker |
| R | Live, 15 sections | [WebR](https://docs.r-wasm.org/webr/) |
| Java | Draft, not listed in the app | none yet (text-checked only) |

The Java files in `public/content/java/` are kept for later. To publish them, add a `java` entry to `public/content/index.json`.

## Getting started

Requires Node 24 (see `.nvmrc`).

```bash
npm ci
npm run dev        # http://localhost:5173/code-quest/
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with the content editor enabled |
| `npm run build` | Type-check, build to `dist/`, and add `404.html` for GitHub Pages routing |
| `npm run check` | Lint, run tests, and build (what CI runs) |
| `npm test` | Vitest in watch mode (`npm run test:run` for a single run) |
| `npm run lint` | ESLint |
| `npm run preview` | Serve the production build locally |
| `npm run icons` | Regenerate the PWA icons from `public/favicon.svg` |

## How it works

- **Content** lives in `public/content/` as JSON: `index.json` lists the languages, each language folder has its own `index.json` of sections, and each section file holds its levels (intro, challenges, quiz). The app validates every file against the Zod schemas in `src/features/curriculum/curriculumSchemas.ts`.
- **Python** runs in `public/pyodide-worker.js`, off the main thread. Runs stop after 10 seconds, the sandbox has a Stop button, and `input()` reads from the sandbox's Input box. The runtime is downloaded from the jsDelivr CDN on first use.
- **Progress** (completed challenges, saved answers, passed quizzes, streak) is stored in the browser's `localStorage`.
- **Old devices**: the build targets Safari 12 so lessons and quizzes work on old iPhones. Running code needs Safari 16.4+ or a recent Chrome or Firefox.

### Project layout

```
src/
  features/curriculum/   Learn, Progress and About screens, sandboxes, grading
    hooks/               useSandbox, useChallenges, useLevelTest, routing, loading
    views/               One component per screen
  features/editor/       In-app content editor
  components/            App shell pieces (bottom nav, install banner, share sheet)
public/
  content/               Course JSON
  pyodide-worker.js      Python runtime worker
scripts/
  python-curriculum/     Python course generator (data/ holds the source)
  r-curriculum/          R course generator
```

## Editing content

Course JSON is generated from the data files under `scripts/`:

```bash
node scripts/python-curriculum/generate.mjs
node scripts/r-curriculum/generate.mjs
```

Edit the `data/*.mjs` files, then regenerate. Challenge IDs are random, so regenerating a section resets learners' saved progress for it.

You can also edit lessons in the app. In `npm run dev`, use the editor button in the header; **Save** writes straight to `public/content/`.

### Saving from the deployed site (optional)

The editor can commit changes to GitHub when signed in. Copy `.env.example` to `.env.local` and fill in:

| Variable | Value |
| --- | --- |
| `VITE_GITHUB_CLIENT_ID` | Client ID of a GitHub OAuth app whose callback URL is `https://<user>.github.io/code-quest/auth/callback` |
| `VITE_GITHUB_REPO` | Repository to save to, e.g. `ubuntu-apps/code-quest` |
| `VITE_GITHUB_CONTENT_BRANCH` | Branch to commit to (default `main`) |

Only users with write access to the repository can sign in to edit.

## Deployment

Every push to `main` runs `.github/workflows/deploy-pages.yml`, which lints, tests, builds and publishes `dist/` to GitHub Pages. Pull requests run the same checks in `.github/workflows/ci.yml`.
