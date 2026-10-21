/**
 * Names a challenge's instructions write as code, for the editor to suggest: `day_off`,
 * `is_weekend()`, and the name being set in a span like `total = 0`. Spans of example
 * output, such as `Hello, world!`, are left out (they are not a single name).
 */
export function namesInMarkdown(markdown: string): string[] {
  const names = new Set<string>()
  // Inline code only: fenced blocks are skipped first, so their backticks don't pair up.
  const text = markdown.replace(/```[\s\S]*?```/g, ' ')
  for (const match of text.matchAll(/`([^`\n]+)`/g)) {
    const span = match[1].trim()
    const name = /^([A-Za-z_]\w*)(?:\(\))?$/.exec(span) ?? /^([A-Za-z_]\w*)\s*=[^=]/.exec(span)
    if (name && name[1].length >= 2) names.add(name[1])
  }
  return [...names]
}
