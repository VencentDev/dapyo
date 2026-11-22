# Compact How It Works Trail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the landing page's scroll-controlled 280svh “How it works” story with a compact, responsive road → grass → mountain route and a draggable mascot that snaps to its three stops.

**Architecture:** Extract the section into `HowItWorksTrail`, a focused client component. Render the route with responsive CSS/inline SVG and semantic HTML callouts; use pointer events to position the mascot during a drag and snap it to the nearest stop on release. Keep `HomePageContent` responsible for page composition only.

**Tech Stack:** Next.js 15, React 18, TypeScript, Tailwind CSS, existing lucide-react icons, inline SVG.

**Spec:** `docs/superpowers/specs/2026-11-19-how-it-works-trail-design.md`

## Global Constraints

- Use a natural-height section; remove its `280svh` height, sticky panel, scroll-step listener, photo stack, and scroll-snap alignment.
- Draw one route that changes from road to grass trail to mountain route, with cloud-like callouts for Discover, Join, and Hike.
- Use a small original inline-SVG backpacking mascot; add no external image or animation dependency.
- Dragging snaps to the nearest of three fixed stops; tapping a stop and keyboard controls also move the mascot.
- Announce the current stop to assistive technology and respect reduced-motion preferences.
- Keep the hero, upcoming-hikes strip, section copy, and surrounding page sections unchanged.

## Review Focus

- Pointer cancellation or release outside the mascot: retain or snap to a valid stop without losing the mascot.
- Drop between stops: choose the geometrically nearest stop consistently.
- Keyboard use: users can move among all stops without dragging, with the current stop announced.
- Narrow viewport: the vertical/diagonal route and callouts remain readable and unclipped.
- Reduced motion: stop transitions and mascot movement do not animate when reduced motion is preferred.

## File Structure

- Create `apps/frontend/src/features/home/landing/components/how-it-works-trail.tsx` for route copy, route markup, mascot drawing, and interaction state.
- Modify `apps/frontend/src/features/home/landing/components/home-page-content.tsx` to compose the new component and remove the old scroll-story data and state.
- Modify `apps/frontend/src/styles/globals.css` to remove old story-image/step effects and add responsive route, callout, and mascot styling.

## Task 1: Replace the scroll story with the interactive trail

**Files:**

- Create: `apps/frontend/src/features/home/landing/components/how-it-works-trail.tsx`
- Modify: `apps/frontend/src/features/home/landing/components/home-page-content.tsx`
- Modify: `apps/frontend/src/styles/globals.css`

**Interfaces:**

- Produces: `HowItWorksTrail(): JSX.Element`, imported by `HomePageContent` with no props.
- The component owns a three-value active stop (`Discover`, `Join`, `Hike`), transient drag coordinates, and pointer/keyboard handlers.

- [x] **Step 1: Build the route structure and semantic stop callouts**

  Add the three existing titles and descriptions to `how-it-works-trail.tsx`. Render them as keyboard-focusable stop buttons with numbered labels and route symbols for road, grass, and mountain. Use an inline SVG path behind the stops and cloud-like callouts on desktop; stack the route and alternate callouts vertically on mobile.

- [x] **Step 2: Add the draggable mascot and snap interaction**

  Draw a compact backpacking mascot with inline SVG. On pointer down, capture the pointer; while dragging, keep its temporary position inside the route area; on pointer up, compare the release point with the three stop centers and animate to the nearest one. On pointer cancellation, return it to the active stop. Set `touch-action: none` only on the mascot control.

- [x] **Step 3: Add non-drag input and accessible state**

  Make the mascot keyboard-operable with left/right arrow keys, with Home/End moving to the first/last stop. Keep stop buttons directly activatable. Expose the mascot's current stop through an accessible label and a polite live announcement. Disable movement transitions under `prefers-reduced-motion: reduce`.

- [x] **Step 4: Integrate the compact section and remove scroll progression**

  Import and render `<HowItWorksTrail />` in place of the current `#how-it-works` section. Remove `storySteps`, `storyStep`, the `updateStoryStep` scroll/resize effect, the `journeyVisible` usage, and this section's `min-h-[280svh]`, sticky panel, image stack, and `home-snap-section` class. Preserve the section ID for the hero CTA anchor.

- [x] **Step 5: Replace the old story CSS and review the patch**

  Remove unused `.story-step` and `.story-image-card*` rules. Add route surface colors, stop placement, callout shapes, mascot drag/active states, responsive layout, and reduced-motion rules. Review pointer, keyboard, touch, reduced-motion, and narrow-screen behavior against the Review Focus list; run `git diff --check`.

## Self-Review

- Spec coverage: compact natural-height section, three route surfaces, three cloud callouts, draggable snapping mascot, touch/keyboard alternatives, reduced motion, and no photo dependency are covered in Task 1.
- Step scan: each step has one deliverable and an observable review result; interaction, integration, and styles are separated inside the same cohesive section change.
- Type consistency: the public component interface is `HowItWorksTrail(): JSX.Element`; active stop values are the three named route steps.
- Review Focus: all five risks are assigned to the final behavior review in Step 5.
- Proportion: one cohesive task matches one self-contained landing-section change.
