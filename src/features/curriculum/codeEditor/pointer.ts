/** Whether the device's main pointer is a finger (phones and tablets). */
export function hasCoarsePointer(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches === true
}

