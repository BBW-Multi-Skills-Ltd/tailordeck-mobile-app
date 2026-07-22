import type { SocialPlatform } from '../../../lib/settings'

export const onboardingSetupSteps = ['Business', 'Brand', 'Contact'] as const

export const onboardingSocialPlatforms: SocialPlatform[] = ['Instagram', 'Facebook', 'TikTok']

export const onboardingSetupStepCopy = [
  {
    title: 'Business details',
    helper: 'Fill in the details clients will see on documents.',
  },
  {
    title: 'Brand assets',
    helper: 'Upload your logo and signature if available.',
  },
  {
    title: 'Contact details',
    helper: 'Add the best ways clients can reach you.',
  },
] as const

export type OnboardingSetupStatus = 'editing' | 'saving' | 'success'
