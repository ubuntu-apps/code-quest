import { useSyncExternalStore } from 'react'

/**
 * Short confirmation sounds, made by the browser's Web Audio API (no sound files, so
 * nothing to download and they work offline). Each step has its own sound; learners can
 * turn them off on the About page.
 */
export type SoundName = 'checkPass' | 'checkFail' | 'quizPass' | 'quizFail' | 'badge' | 'levelUp'

const SOUND_KEY = 'codequest:sound'
const CHANGED_EVENT = 'codequest:sound-changed'
/** Overall loudness: confirmation, not a fanfare. */
const MASTER_VOLUME = 0.14

export function isSoundOn(): boolean {
  try {
    return localStorage.getItem(SOUND_KEY) !== 'off'
  } catch {
    return true
  }
}

export function setSoundOn(on: boolean): void {
  try {
    localStorage.setItem(SOUND_KEY, on ? 'on' : 'off')
  } catch {
    // Storage unavailable: the choice lasts until the page closes.
  }
  window.dispatchEvent(new Event(CHANGED_EVENT))
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener(CHANGED_EVENT, onChange)
  window.addEventListener('storage', onChange)
  return () => {
    window.removeEventListener(CHANGED_EVENT, onChange)
    window.removeEventListener('storage', onChange)
  }
}

export function useSoundOn(): boolean {
  return useSyncExternalStore(subscribe, isSoundOn, () => true)
}

let context: AudioContext | null = null

function audioContext(): AudioContext | null {
  if (context) return context
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  try {
    context = new Ctor()
  } catch {
    return null
  }
  return context
}

// Browsers only allow sound after the learner has tapped or typed, so the audio is
// switched on at the first tap; results that arrive a moment later can then play.
function unlock() {
  const ctx = audioContext()
  if (ctx && ctx.state === 'suspended') void ctx.resume().catch(() => undefined)
}
if (typeof window !== 'undefined') {
  window.addEventListener('pointerdown', unlock, { once: true, capture: true })
  window.addEventListener('keydown', unlock, { once: true, capture: true })
}

/** One note: frequency (Hz), start and length (seconds), and how loud relative to the rest. */
type Note = { f: number; at: number; len: number; gain?: number; type?: OscillatorType }

const SOUNDS: Record<SoundName, Note[]> = {
  // Two quick rising notes.
  checkPass: [
    { f: 659.25, at: 0, len: 0.12 },
    { f: 880, at: 0.09, len: 0.2 },
  ],
  // A soft falling pair, low and quiet: "not yet", not "wrong!".
  checkFail: [
    { f: 329.63, at: 0, len: 0.14, gain: 0.7, type: 'triangle' },
    { f: 261.63, at: 0.12, len: 0.22, gain: 0.7, type: 'triangle' },
  ],
  // A rising arpeggio, ending on a held note.
  quizPass: [
    { f: 523.25, at: 0, len: 0.12 },
    { f: 659.25, at: 0.1, len: 0.12 },
    { f: 783.99, at: 0.2, len: 0.12 },
    { f: 1046.5, at: 0.3, len: 0.4 },
  ],
  quizFail: [
    { f: 392, at: 0, len: 0.16, gain: 0.7, type: 'triangle' },
    { f: 329.63, at: 0.15, len: 0.16, gain: 0.7, type: 'triangle' },
    { f: 293.66, at: 0.3, len: 0.3, gain: 0.7, type: 'triangle' },
  ],
  // High, quick sparkle.
  badge: [
    { f: 1046.5, at: 0, len: 0.1, gain: 0.8 },
    { f: 1318.5, at: 0.07, len: 0.1, gain: 0.8 },
    { f: 1568, at: 0.14, len: 0.1, gain: 0.8 },
    { f: 2093, at: 0.21, len: 0.35, gain: 0.6 },
  ],
  // A short climb and a chord.
  levelUp: [
    { f: 392, at: 0, len: 0.1 },
    { f: 523.25, at: 0.08, len: 0.1 },
    { f: 659.25, at: 0.16, len: 0.45, gain: 0.8 },
    { f: 783.99, at: 0.16, len: 0.45, gain: 0.8 },
    { f: 1046.5, at: 0.16, len: 0.45, gain: 0.6 },
  ],
}

/**
 * Plays a step's sound, unless sounds are off, the app is in the background, or the
 * browser has no audio. `delay` (seconds) lets sounds that happen together follow each other.
 */
export function playSound(name: SoundName, delay = 0): void {
  if (!isSoundOn() || (typeof document !== 'undefined' && document.hidden)) return
  const ctx = audioContext()
  if (!ctx) return
  if (ctx.state === 'suspended') void ctx.resume().catch(() => undefined)
  const start = ctx.currentTime + 0.01 + delay
  for (const note of SOUNDS[name]) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = note.type ?? 'sine'
    osc.frequency.value = note.f
    const t0 = start + note.at
    const peak = MASTER_VOLUME * (note.gain ?? 1)
    // Quick fade in and a smooth fade out, so there are no clicks.
    gain.gain.setValueAtTime(0.0001, t0)
    gain.gain.exponentialRampToValueAtTime(peak, t0 + 0.012)
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + note.len)
    osc.connect(gain).connect(ctx.destination)
    osc.start(t0)
    osc.stop(t0 + note.len + 0.02)
  }
}
