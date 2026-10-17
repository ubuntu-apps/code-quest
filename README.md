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
npm install
npm run dev        # http://localhost:5173/code-quest/
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with the content editor enabled |
| `npm run build` | Type-check, build to `dist/`, and add `404.html` for GitHub Pages routing |
| `npm run check` | Lint, run tests, and build (what CI runs) |
| `npm run check:content` | Run every lesson challenge to check it works (needs Python 3; pandas for the pandas lessons) |
| `npm test` | Vitest in watch mode (`npm run test:run` for a single run) |
| `npm run lint` | ESLint |
| `npm run preview` | Serve the production build locally |
| `npm run icons` | Regenerate the PWA icons from `public/favicon.svg` |

## How it works

- **Content** lives in `public/content/` as JSON: `index.json` lists the languages, each language folder has its own `index.json` of sections, and each section file holds its levels (intro, challenges, quiz). The app validates every file against the Zod schemas in `src/features/curriculum/curriculumSchemas.ts`.
- **Python** runs in `public/pyodide-worker.js`, off the main thread. Runs stop after 10 seconds, the sandbox has a Stop button, and `input()` reads from the sandbox's Input box. The runtime is downloaded from the jsDelivr CDN on first use.
- **Unlocking**: every section can be opened to preview its lessons, but its levels stay locked until the section's prerequisite is met; inside a section, each level unlocks when the previous level's quiz is passed. **Admin mode** (About tab, PIN `2001`) unlocks everything for testing; the PIN only prevents accidents, it isn't security. A section that has easy and medium projects (the first six sections so far) unlocks the next section once those projects are done. Other sections don't lock the next one yet; set `LOCK_SECTIONS_BY_QUIZZES` in `src/features/curriculum/constants.ts` to `true` to require every quiz in the previous section to be passed.
- **Progress** (completed challenges, saved answers, passed quizzes, streak) is stored in the browser's `localStorage`. Learners can download and restore a backup from the About tab.
- **Offline**: the service worker (configured in `vite.config.ts`) precaches the app, fetches lessons network-first with a cached fallback, and keeps the Python and R runtimes cache-first once they've been used. "Download for offline" on the About tab fetches everything up front. Runtime versions are pinned in `src/runtimeVersions.ts`; bump them there to update.
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

Edit the `data/*.mjs` files, then regenerate. The course layout (section order and titles, and which topics go in each section) lives in `data/course.mjs`. Add `--only <sectionId>` to regenerate one section, e.g. `--only data_and_apis`. Challenge IDs come from the topic and position (`json_basics_ch3`), so regenerating keeps learners' progress unless you reorder challenges.

Write new challenges with the `task()` and `mc()` builders in `scripts/python-curriculum/data/_builders.mjs` (and `typedInput()` for challenges that read `input()`); see `data/fundamentals/`, `data/control-flow/`, `data/data-structures/`, `data/functions/`, `data/error-handling/`, `data/file-handling/` and `data/data-apis/` for examples. Sections listed in `scripts/curriculum-check.json` (Fundamentals through Files, and Data and APIs so far) must pass every check, or CI fails. Then run the content check:

```bash
npm run check:content                                 # summary of every section
node scripts/check-curriculum.mjs --section python/data_and_apis --verbose
```

For every challenge it runs the solution (must pass), the starter code and empty code (must fail), using the same Python helpers as the app. It also flags missing prompts, hints and solutions, text-matched grading, and quizzes whose answers are always in the same position. Sections listed in `scripts/curriculum-check.json` must be clean or CI fails; add a section there once it has been rewritten.

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
