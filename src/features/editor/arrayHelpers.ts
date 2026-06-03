export function moveItem<T>(items: T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction
  if (target < 0 || target >= items.length) return items
  const next = [...items]
  const temp = next[index]
  next[index] = next[target]
  next[target] = temp
  return next
}

export function removeAt<T>(items: T[], index: number): T[] {
  return items.filter((_, i) => i !== index)
}
