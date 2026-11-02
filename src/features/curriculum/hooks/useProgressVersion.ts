import { useSyncExternalStore } from 'react'
import { getProgressSnapshot, subscribeProgress } from '../progress/progressStorage'

export function useProgressVersion(): number {
  return useSyncExternalStore(subscribeProgress, getProgressSnapshot, getProgressSnapshot)
}
