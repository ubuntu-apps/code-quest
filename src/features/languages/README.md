# Languages

Each course's language lives in its own folder here. What the language *is like* is data, in
`language.json`; only what has to be code is code.

| File | What it holds |
| --- | --- |
| `<id>/language.json` | Labels, flags (Run button, Input box, table output, database, setup code), changes to the phone keys, sandbox samples, status messages, word lists, colouring patterns, "Try it" rules, indent. Checked by `languageSpec.ts` when the app starts. |
| `<id>/<Name>Pack.ts` | A `LanguagePack` subclass: runs and checks code on the language's runtime (loaded on first use), explains errors, downloads the runtime for offline use. |
| `<id>/<Name>EditorLanguage.ts` | An `EditorLanguage` subclass: CodeMirror's syntax and suggestion logic. Loaded only with the editor. |

The shared classes:

- `LanguageRules` turns `language.json` into what the app and the content checker ask for: labels, flags, colouring (`Highlighter`), and which lesson blocks get "Try it". No runtime, no UI, so Node can load it (`scripts/content-check`).
- `keys.json` is the phone key bar every language starts from: indent keys, brackets, quotes and operators. A language's `keys` only adds its own (`"add"`, placed right after the indent keys) and drops what it doesn't use (`"remove"`, by what the key types: `"[]"`, `"''"`). Code without a language gets the base set. `keyBar.ts` puts the two together.
- `LanguagePack` adds the runtime and the key bar. `PyodidePack` is the base for languages that run on the Python worker (Python, SQL).
- `EditorLanguage` is the editor's side; `PlainEditorLanguage` is plain text.

`index.ts` lists the packs. The app asks `languagePack(id)` or `packForTestMode(mode)`, never `languageId === 'python'`.

## Adding a language

For a language with id `javascript`:

1. **`javascript/language.json`.** Copy another language's and change it. `testMode` is the validation mode its challenges use (`javascript_tests`). Word lists are named; the colouring rules (`highlight.names`) and the editor's suggestions (`editor`) refer to them by name.
2. **`javascript/JavaScriptPack.ts`.** Extend `LanguagePack` and pass the JSON to `super()`. Implement `run`, `checkChallenge`, `errorSummaryLine`, `loadEditor` and `prepareOffline`; override `runChallenge`, `warmUp` or `preload` as needed. Load the runtime with a dynamic `import()`, so it isn't downloaded before it is used.
3. **`javascript/JavaScriptEditorLanguage.ts`.** Extend `EditorLanguage`: `syntax()` (a CodeMirror language) and `completionSource()` (suggestions; `this.words` has the language's words).
4. **`index.ts`.** Add `new JavaScriptPack()` to `LANGUAGE_PACKS`.
5. **The course.** A generator in `scripts/javascript-curriculum/`: builders that extend `CourseBuilders` (with a `task()` for its challenges), a generator that extends `CourseGenerator` (with a `TypedInProtection` subclass if its challenges need one), and a line in `public/content/index.json`.
6. **The checks.** A `LanguageChecker` subclass in `scripts/content-check/` that runs the code, and a line in `check.mjs`. Until then, the course gets the shared checks only.

Then `npm run check:content`, `npm test`, and try a lesson in `npm run dev`.
