import { APP_VERSION } from '../../version'

/** Where learners report a wrong or confusing challenge or quiz. */
export const ISSUES_URL = 'https://github.com/ubuntu-apps/code-quest/issues/new'

/**
 * A link that opens a new GitHub issue with the title and details filled in, so a
 * report always says which challenge or quiz it is about and which app version.
 */
export function reportProblemUrl(subject: string, where: string): string {
  const body = [
    `**Where:** ${where}`,
    `**App version:** ${APP_VERSION}`,
    '',
    '**What went wrong?**',
    '',
    '',
    '**Your code or answer (if it helps):**',
    '',
  ].join('\n')
  const params = new URLSearchParams({ title: `Problem with ${subject}`, body })
  return `${ISSUES_URL}?${params.toString()}`
}
