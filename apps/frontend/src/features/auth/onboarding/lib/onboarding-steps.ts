export const onboardingSteps = [
  { id: 1, label: 'Hiking experience' },
  { id: 2, label: 'Trail difficulty' },
  { id: 3, label: 'Optional insights' },
  { id: 4, label: 'Your profile' },
] as const;

export type OnboardingStep = (typeof onboardingSteps)[number]['id'];
