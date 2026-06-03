export interface AboutContent {
  lead: string
  installIntro: string
  installSteps: string[]
}

export const DEFAULT_ABOUT_CONTENT: AboutContent = {
  lead: 'CodeQuest is a configurable PWA for learning syntax and concepts. Challenges check your answers with patterns you define in JSON — no cloud compiler.',
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
