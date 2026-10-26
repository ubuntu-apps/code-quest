import { RankIcon } from './RankIcon'
import { nextRankHint, type CourseRank } from './ranks'

/** Next to a course's title: the learner's rank in it, and what the next rank takes. */
export function CourseRankBadge({ rank, courseTitle }: { rank: CourseRank; courseTitle: string }) {
  const hint = nextRankHint(rank)
  const progress = rank.next ? Math.round((rank.finished / rank.next.at) * 100) : 100
  return (
    <div className={`cq-rank cq-rank--${rank.rank.id}`}>
      <span className="cq-rank-chip" aria-label={`Your ${courseTitle} rank: ${rank.rank.title}`}>
        <RankIcon rank={rank.rank.id} />
        {rank.rank.title}
      </span>
      <span className="cq-rank-next">
        {hint ?? `Every section finished: the highest ${courseTitle} rank`}
        {rank.next ? (
          <span
            className="cq-rank-bar"
            role="progressbar"
            aria-label={`Sections finished towards ${rank.next.rank.title}`}
            aria-valuemin={0}
            aria-valuemax={rank.next.at}
            aria-valuenow={rank.finished}
          >
            <span className="cq-rank-bar-fill" style={{ width: `${progress}%` }} />
          </span>
        ) : null}
      </span>
    </div>
  )
}
