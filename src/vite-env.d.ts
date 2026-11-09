/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  /** Set only for the old copy of the site: the address CodeQuest moved to. */
  readonly VITE_MOVED_TO?: string
}
