import { Heart } from 'lucide-react'
import { SUPPORT_CONFIG } from './supportConfig'

/** Buttons for the configured donation pages; they open in a new tab. */
export function SupportLinks({
  primary = false,
  onChoose,
}: {
  /** Highlight the first link. */
  primary?: boolean
  onChoose?: () => void
}) {
  const links = [
    { url: SUPPORT_CONFIG.kofiUrl, label: 'Support on Ko-fi' },
    { url: SUPPORT_CONFIG.githubSponsorsUrl, label: 'Sponsor on GitHub' },
  ].filter((link): link is { url: string; label: string } => Boolean(link.url))

  return (
    <div className="cq-support-links">
      {links.map((link, i) => (
        <a
          key={link.url}
          className={`cq-btn${primary && i === 0 ? ' cq-btn--primary' : ''}`}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onChoose}
        >
          <Heart size={16} aria-hidden />
          {link.label}
        </a>
      ))}
    </div>
  )
}
