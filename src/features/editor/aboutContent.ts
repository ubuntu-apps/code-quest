export interface AboutContent {
  lead: string
  installIntro: string
  installSteps: string[]
}

export const DEFAULT_ABOUT_CONTENT: AboutContent = {
  lead: 'CodeQuest teaches programming through quests. Each quest is a series of short stages with hands-on coding challenges, and each stage ends with a gate: a short quiz that opens the next stage. Your code runs right here in your browser, and your progress is saved on this device.',
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
