# Onboarding Progress Rail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework DAPYO onboarding into four focused screens with a responsive left progress rail, and apply the existing ease-out theme reveal to every theme control.

**Architecture:** Keep onboarding authorization and API reads in the server page content. Let the existing client form own the four-step state, save required preferences as a draft after step two, and render the responsive progress rail beside the active step. Extract the existing circular theme reveal into a shared helper and call it from both the shared `ThemeToggle` and the home account-menu switches.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, Auth.js theme provider, `next-themes`.

**Spec:** [docs/superpowers/specs/2026-11-23-onboarding-progress-rail-design.md](../specs/2026-11-23-onboarding-progress-rail-design.md)

## Global Constraints

- Keep the existing backend endpoints, request shape, callback handling, and route behavior.
- Save required hiking preferences before the optional steps so incomplete onboarding remains resumable.
- Complete onboarding only after an explicit consent choice.
- With consent declined, save no age, interest, or referral values and still allow completion.
- Keep DAPYO's colors, typography, theme toggle, and existing profile questions.
- Apply the existing ease-out circular theme reveal to every theme control and preserve reduced-motion behavior.
- The user selected HeroUI v3 and approved upgrading the frontend to React 19 and Tailwind CSS 4. Keep `tailwind-merge` on its Tailwind 4 compatible v3 line.
- Use a single-select HeroUI TagGroup for interests and preserve the current compact tag size.

## Review Focus

- Empty required answers must prevent moving forward from either required screen; the owning form task preserves disabled-button validation.
- Moving backward must preserve all selected answers; the form state remains in the client wizard.
- Consent must be explicitly selected before the optional details/finish screen; consent false must omit optional values in the final request.
- The fourth step must remain usable when consent is false and must still complete onboarding.
- The progress rail must fit on narrow screens, and all theme controls must fall back to an immediate theme change when view transitions are unavailable or reduced motion is preferred.

---

### Task 1: Build the four-step onboarding shell and progress rail

**Files:**

- Create: `apps/frontend/src/features/auth/onboarding/lib/onboarding-steps.ts`
- Create: `apps/frontend/src/features/auth/onboarding/components/onboarding-progress-rail.tsx`
- Create: `apps/frontend/src/features/auth/onboarding/components/hiking-experience-step.tsx`
- Create: `apps/frontend/src/features/auth/onboarding/components/trail-difficulty-step.tsx`
- Create: `apps/frontend/src/features/auth/onboarding/components/optional-insights-consent-step.tsx`
- Create: `apps/frontend/src/features/auth/onboarding/components/optional-insights-details-step.tsx`
- Modify: `apps/frontend/src/features/auth/onboarding/components/onboarding-form.tsx`
- Modify: `apps/frontend/src/features/auth/onboarding/components/onboarding-page-content.tsx`
- Delete: `apps/frontend/src/features/auth/onboarding/components/hiking-style-step.tsx`
- Delete: `apps/frontend/src/features/auth/onboarding/components/optional-insights-step.tsx`

**Interfaces:**

- `onboarding-steps.ts` exports the ordered four-step list and `OnboardingStep` union type (`1 | 2 | 3 | 4`).
- `OnboardingProgressRail` consumes `activeStep: OnboardingStep` and renders the same labels in the desktop rail and compact mobile stepper.
- `OnboardingForm` keeps `initialProfile` and `callbackUrl` props; it owns step and answer state.

- [x] **Step 1: Define the shared onboarding step IDs and labels** in `lib/onboarding-steps.ts`: `Hiking experience`, `Trail difficulty`, `Optional insights`, and `Your profile`.
- [x] **Step 2: Split the question UI into focused components**: move the existing experience choices and difficulty choices into their respective components; move consent radios into `optional-insights-consent-step.tsx`; move age, interests, and referral controls into `optional-insights-details-step.tsx`.
- [x] **Step 3: Update the wizard state machine** in `onboarding-form.tsx`: step one gathers experience; step two gathers difficulty and saves both required values as the existing draft; step three requires an explicit yes/skip choice; step four shows optional controls for consent yes, or a ready-to-finish message for consent no. The final mutation sends optional values only when consent is true, then follows the existing callback.
- [x] **Step 4: Add the responsive page shell**: render DAPYO branding, theme toggle, and `OnboardingProgressRail` in a desktop side rail; show a compact progress version above the centered active step on small screens. Move focus to the active step heading whenever `activeStep` changes and keep back navigation from clearing answers.
- [x] **Step 5: Keep `OnboardingPageContent` focused on server gating** and render the client wizard with the fetched profile and safe callback; remove the old hero-image/form-card layout.
- [x] **Step 6: Remove the superseded combined hiking-style component** after both required question components are wired in.

### Task 2: Apply the ease-out reveal to every theme control

**Files:**

- Create: `apps/frontend/src/lib/theme-transition.ts`
- Modify: `apps/frontend/src/components/theme-toggle.tsx`
- Modify: `apps/frontend/src/features/home/feed/components/home-feed-account-menu.tsx`
- Existing CSS reference: `apps/frontend/src/styles/globals.css`

**Interfaces:**

- `changeThemeWithReveal(element: HTMLElement, nextTheme: 'light' | 'dark', applyTheme: () => void): void` configures the reveal origin, runs the caller update through `document.startViewTransition` when supported, synchronizes the root theme class/color scheme, and clears the temporary origin after completion.
- Callers keep their existing `next-themes` updates and local account-menu state updates inside `applyTheme`.

- [x] **Step 1: Extract the current reveal behavior** from `HomeFeedAccountMenu` into `lib/theme-transition.ts`, including its viewport-covering circle, existing easing, unsupported-browser fallback, and reduced-motion fallback.
- [x] **Step 2: Use the helper from the shared `ThemeToggle`** so the auth pages and onboarding get the same effect from the toggle's screen position.
- [x] **Step 3: Replace the account-menu-local implementation** with the shared helper for both its menu switch and settings switch, preserving the local `isDark` update.
- [x] **Step 4: Leave the existing global keyframes and reduced-motion CSS in place** unless the shared helper reveals a concrete mismatch; do not add a second theme animation.

### Task 3: Upgrade the frontend styling runtime for HeroUI v3

**Files:**

- Modify: `apps/frontend/package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `apps/frontend/postcss.config.mjs`
- Modify: `apps/frontend/tailwind.config.ts` or migrate its tokens into `apps/frontend/src/styles/globals.css`
- Modify: `apps/frontend/src/styles/globals.css`
- Modify: `apps/frontend/src/app/layout.tsx` if the v4 container default needs an equivalent width rule

**Interfaces:**

- Keep the existing `@app/frontend` scripts and Next.js app-router entry points.
- Retain DAPYO's color utility names (`bg-background`, `text-foreground`, `border-border`, etc.), font utilities, custom animations, and class-based `.dark` behavior.
- Load HeroUI's styles after Tailwind and keep its theme tokens independent from the current DAPYO CSS variables.

- [x] **Step 1: Upgrade framework and styling dependencies** to React 19, matching React type packages, Tailwind 4, Tailwind 4 compatible `tailwind-merge`, `@tailwindcss/postcss`, `@heroui/react`, `@heroui/styles`, and `@gravity-ui/icons`.
- [x] **Step 2: Migrate Tailwind configuration and CSS imports** to v4, preserving the existing DAPYO colors, font families, radius values, custom animations, content scanning, and centered 1200px app container; use HeroUI's Tailwind 4 animation utilities instead of the legacy plugin.
- [x] **Step 3: Keep DAPYO color variables separate from HeroUI's built-in theme variables** so existing `oklch(var(--...))` utilities and HeroUI's `.dark` styles both remain valid.
- [x] **Step 4: Preserve class-based dark mode** through `next-themes` and the existing root `.dark` class; do not add another theme state or provider.

### Task 4: Use HeroUI controls in optional profile details

**Files:**

- Modify: `apps/frontend/src/features/auth/onboarding/components/optional-insights-details-step.tsx`
- Modify: `apps/frontend/src/features/auth/onboarding/components/onboarding-progress-rail.tsx`

**Interfaces:**

- The age and referral dropdowns update their existing callbacks and preserve “Prefer not to say” and “Choose an option” as empty values.
- The interest TagGroup updates the existing `HikingInterest[]` callback with zero or one selected value.
- Existing `OptionalInsightsDetailsStep` props and onboarding save payload remain unchanged.

- [x] **Step 1: Replace the native age and referral selects** with the HeroUI Dropdown pattern, adding HeroUI `Dropdown.Trigger`, single-selection state, labels, and indicators; preserve the compact 40px trigger sizing and all options.
- [x] **Step 2: Replace the checkbox chips** with HeroUI `TagGroup` in single-selection mode; keep the compact chip dimensions and add an appropriate Gravity UI icon to each interest option.
- [x] **Step 3: Apply theme-aware colors to the desktop progress rail** so “Your trail profile,” the four step labels, active/up-next statuses, and controls remain readable in both themes and transition with the existing circular reveal.

## Execution Notes

- Implement natively in this session; the onboarding flow and shared theme helper are sequential changes across a small set of existing files.
- Do not add or run tests for this task. Keep existing API payloads and use static review to check that all four paths and both theme controls are wired consistently.
- Do not commit changes unless asked.
