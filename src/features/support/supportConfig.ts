/**
 * Ways to support CodeQuest. Fill these in to switch the features on; anything left
 * null or empty stays hidden, so the app shows no support prompts until it is set up.
 */
export const SUPPORT_CONFIG: {
  /** GitHub Sponsors page, e.g. 'https://github.com/sponsors/<you>'. */
  githubSponsorsUrl: string | null
  /** Ko-fi (or Buy Me a Coffee) page, e.g. 'https://ko-fi.com/<you>'. */
  kofiUrl: string | null
  /**
   * The pay-what-you-want page for the supporter edition of the certificate: a Ko-fi
   * shop item, a Lemon Squeezy product or a Stripe Payment Link.
   */
  supporterEditionUrl: string | null
  /**
   * SHA-256 (hex) of each supporter code. Make a code and its hash with
   * `npm run supporter-code`. After paying, send supporters to the thank-you link it
   * prints (<site>/supporter?code=<code>), or give them the code to enter on About.
   */
  supporterCodeHashes: string[]
} = {
  githubSponsorsUrl: null,
  kofiUrl: null,
  supporterEditionUrl: null,
  supporterCodeHashes: [],
}

/** Whether any way to donate is set up. */
export function hasDonationLinks(): boolean {
  return Boolean(SUPPORT_CONFIG.githubSponsorsUrl || SUPPORT_CONFIG.kofiUrl)
}
