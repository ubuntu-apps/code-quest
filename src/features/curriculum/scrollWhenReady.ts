/**
 * Scrolls the page to `y` once it is tall enough to get there (a step or a lesson can take a
 * moment to render), giving up after about a second and going as far as it can. Returns a
 * function that cancels a scroll still waiting.
 */
export function scrollWhenReady(y: number): () => void {
  let tries = 0
  let timer = 0
  const attempt = () => {
    const maxY = document.documentElement.scrollHeight - window.innerHeight
    if (maxY >= y || tries >= 20) {
      window.scrollTo(0, Math.min(y, Math.max(maxY, 0)))
      return
    }
    tries += 1
    timer = window.setTimeout(attempt, 50)
  }
  attempt()
  return () => window.clearTimeout(timer)
}
