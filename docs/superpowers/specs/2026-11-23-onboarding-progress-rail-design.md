# Onboarding Progress Rail Design

## Intent

Reshape the existing DAPYO profile onboarding to use the supplied screenshot's persistent left progress rail and focused step area. Keep DAPYO's colors, typography, theme toggle, and existing profile questions.

## Goals and constraints

- Split onboarding into four focused screens: hiking experience, trail difficulty, optional insights consent, and optional details or a skip-ready finish screen.
- Show step names and completion state in a desktop left rail; turn it into a compact stepper above the form on smaller screens.
- Keep keyboard focus on each new step heading and preserve answers when moving backward and forward.
- Save required hiking preferences before the optional steps so incomplete onboarding remains resumable. Complete onboarding only after an explicit consent choice.
- With consent declined, save no age, interest, or referral values and still allow completion.
- Keep the existing backend endpoints, request shape, callback handling, and route behavior.
- Apply the existing ease-out circular theme reveal to every theme control, including the shared auth-page toggle and the home account-menu switches; preserve the reduced-motion behavior.
- Make the desktop progress rail's surfaces, labels, and step states follow the active light/dark theme so the rail participates in the same reveal.
- Use HeroUI v3's Dropdown for age range and referral source, plus a small, single-select TagGroup for interests with one icon on each interest tag.
- Upgrade the frontend to React 19 and Tailwind CSS 4, as required by the selected HeroUI v3 components.

## Approaches

1. **Keep two form steps and add a progress rail:** smallest change, but retains the combined required questions and optional section that the user wants to split up.
2. **Split into four focused screens with a persistent progress rail (selected):** matches the requested layout and gives each required choice and the optional consent a clear moment. The final screen shows optional fields for opted-in users, or confirms they can finish without them.

The user chose the four-screen approach.

## Flow and layout

1. **Hiking experience:** choose one required experience level.
2. **Trail difficulty:** choose one required difficulty. Continuing saves both required choices as the existing resumable draft.
3. **Optional insights:** explicitly opt in or skip the optional aggregate-analysis questions.
4. **Your profile:** when opted in, show the existing optional age range, interests, and referral controls; when skipped, show a concise ready-to-finish state. Finish saves the consent decision and any permitted optional values, then follows the safe callback.

On wide screens, use a full-height two-column layout with DAPYO branding and numbered steps in the left rail, and the active step centered in the main area. On narrow screens, move branding and compact progress above the active step. Reuse the existing form controls and forest-green palette; do not add imagery or new routes.

Age range remains a single optional choice with “Prefer not to say” as its empty value. The referral source remains optional with “Choose an option” as its empty value. Both use the supplied HeroUI dropdown pattern. Interest tags become single-select as in the supplied HeroUI example; store the selected interest in the existing array request field with zero or one entries. Keep the tag size aligned with the current compact chips.

Theme changes should reuse the existing `theme-reveal-from-toggle` view transition and its `cubic-bezier(0.16, 1, 0.3, 1)` easing. Centralize the toggle-origin setup so all theme controls share the same reveal and fallback when view transitions are unavailable or reduced motion is preferred.

The user chose the HeroUI v3 implementation and its required React 19 and Tailwind CSS 4 upgrade. Keep the existing DAPYO theme toggle as the source of light/dark state and style the progress rail for both themes.

## Out of scope

No new questions, backend schema/API changes, changes to the signup flow, or redesign of the rest of the product.
