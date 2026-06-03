import { useSyncExternalStore } from 'react'
import { getProgressSnapshot, subscribeProgress } from '../progressStorage'

export function useProgressVersion(): number {
  return useSyncExternalStore(subscribeProgress, getProgressSnapshot, getProgressSnapshot)
}
