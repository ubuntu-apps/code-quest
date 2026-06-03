/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_OLLAMA_BASE_URL?: string
  readonly VITE_OLLAMA_MODEL?: string
  readonly VITE_GITHUB_CLIENT_ID?: string
  readonly VITE_GITHUB_REPO?: string
  readonly VITE_GITHUB_CONTENT_BRANCH?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
