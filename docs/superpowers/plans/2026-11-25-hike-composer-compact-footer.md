# Hike Composer Compact Footer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce the hike composer height by grouping its mountain, location, joined-hiker, and date controls in a compact caption footer.

**Architecture:** Keep `ActivityFeedPost` as the layout owner and reuse its existing controlled state callbacks. Add compact presentation options to the current mountain and picker controls; preserve their current selection dialogs and date behavior.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, HeroUI, Radix Dialog.

**Spec:** `docs/superpowers/specs/2026-11-25-hike-composer-compact-footer-design.md`

## Global Constraints

- Keep the caption editable and preserve all current location, joined-hiker, date, and mountain selection behavior.
- Show location, joined-hiker, and date actions as icon buttons with hover tooltips and accessible names.
- Keep the selected mountain name visible in a compact selector beside the icon actions.
- Remove the location and joined-hiker text controls from the author row and the standalone mountain-name field row.
- Keep the capacity and available-spots controls, image area, and difficulty selector working as they do now.
- Allow the footer to fit at narrow widths without clipping the caption or controls.
- No changes to hike data, submission behavior, capacity calculations, image editing, or the posted hike layout.

## Review Focus

- No location is selected: show “Pick a meeting place”; the icon remains named and opens the current location dialog.
- A long location name: keep the icon control within the footer and expose the name through its tooltip.
- Zero, one, or many joined hikers: retain the count and open the existing profile/guest dialog.
- No date or a selected date: keep the date picker accessible, enforce its current minimum date, and include the selected date in its tooltip when present.
- A custom mountain name, suggested mountain, or validation error: keep the compact combobox editable, usable by keyboard, and able to show the validation feedback.

---

### Task 1: Move hike metadata controls into the caption footer

**Files:**

- Modify: `apps/frontend/src/features/home/feed/components/activity-feed-post.tsx`
- Modify: `apps/frontend/src/features/hikes/create/components/hike-mountain-name-field.tsx`
- Modify: `apps/frontend/src/features/hikes/create/components/hike-location-badge.tsx`
- Modify: `apps/frontend/src/features/hikes/create/components/hike-joined-hiker-picker.tsx`
- Modify: `apps/frontend/src/features/hikes/create/components/hike-date-picker.tsx`

**Interfaces:**

- `ActivityFeedPost` continues to consume the existing controlled props for caption, mountain name, location click, joined hikers, and scheduled date.
- Add an optional `compact` presentation prop to `HikeMountainNameField`; keep its existing `value`, `onChange`, and `error` contract and combo-box behavior.
- Keep picker callbacks unchanged. Add icon-only trigger presentation, visible tooltips, and accessible labels to the existing location, joined-hiker, and date controls.

- [x] Group the caption textarea and footer in one rounded, bordered surface; place the compact mountain selector and location, joined-hiker, and date icon actions at the lower right.
- [x] Remove the location and joined-hiker text controls from the composer author row and remove the separate mountain field from the capacity row; leave the non-composer post layout and all capacity controls intact.
- [x] Make the mountain combobox compact while retaining its visible selected name, suggestions, custom values, keyboard behavior, and validation feedback.
- [x] Make each icon control's tooltip describe its action and current value where applicable; preserve the location dialog, joined-hiker dialog, and date picker interactions.
- [x] Review the edited JSX and responsive class combinations, then run `git diff --check`.

**Expected result:** The composer uses less vertical space, the metadata controls sit in the caption footer without overflowing narrow layouts, and all existing editor interactions remain available.
