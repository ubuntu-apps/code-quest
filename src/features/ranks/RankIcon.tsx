import { Crown, Gem, Shield, Sprout, Swords, type LucideIcon } from 'lucide-react'
import type { RankId } from './ranks'

const ICONS: Record<RankId, LucideIcon> = {
  novice: Sprout,
  squire: Shield,
  knight: Swords,
  champion: Crown,
  legend: Gem,
}

/** The picture for a rank. */
export function RankIcon({ rank, size = 18 }: { rank: RankId; size?: number }) {
  const Icon = ICONS[rank]
  return <Icon size={size} aria-hidden />
}
