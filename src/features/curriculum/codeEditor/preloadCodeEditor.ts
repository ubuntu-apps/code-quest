/** Starts downloading the code editor early (e.g. when a lesson opens), so it is ready by the challenges. */
export function preloadCodeEditor(): void {
  void import('./CodeMirrorEditor').catch(() => {
    // Offline and not cached yet: the plain text box is used instead.
  })
}
