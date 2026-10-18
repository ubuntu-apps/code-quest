export interface AboutContent {
  lead: string
  installIntro: string
  installSteps: string[]
}

export const DEFAULT_ABOUT_CONTENT: AboutContent = {
  lead: 'CodeQuest teaches programming through short lessons, hands-on coding challenges and quizzes. Your code runs right here in your browser, and your progress is saved on this device.',
  installIntro: '',
  installSteps: [],
}

export function mergeAboutContent(
  platformSteps: string[],
  stored?: Partial<AboutContent> | null,
): AboutContent {
  return {
    lead: stored?.lead ?? DEFAULT_ABOUT_CONTENT.lead,
    installIntro: stored?.installIntro ?? '',
    installSteps: stored?.installSteps?.length ? stored.installSteps : platformSteps,
  }
}
