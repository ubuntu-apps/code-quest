import { Castle, Cpu, Hammer, Puzzle, WandSparkles, type LucideIcon } from 'lucide-react'
import type { RankId } from './ranks'

const ICONS: Record<RankId, LucideIcon> = {
  tinkerer: Puzzle,
  builder: Hammer,
  engineer: Cpu,
  architect: Castle,
  wizard: WandSparkles,
}

/** The picture for a rank. */
export function RankIcon({ rank, size = 18 }: { rank: RankId; size?: number }) {
  const Icon = ICONS[rank]
  return <Icon size={size} aria-hidden />
}
