/** Stub auth — always allows editing for now. Replace with real auth later. */
export function canEditContent(): boolean {
  return true
}

export function authenticateEditor(_password?: string): boolean {
  return true
}
