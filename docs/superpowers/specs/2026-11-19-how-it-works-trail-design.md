# How It Works Trail Section Design

## Intent

Replace the current scroll-controlled photo sequence with a compact, playful explanation of the three steps: Discover, Join, and Hike. The section should feel like a route the visitor can explore, without requiring a long scroll or a full-viewport panel.

## Approaches

- **Photo sequence:** Keep the three photos and show them in a normal content section. This is familiar but does not deliver the requested route illustration or mascot interaction.
- **Illustrated route with draggable mascot (selected):** Draw one continuous path that changes from road to grass trail to mountain route. Place each step in a cloud-like callout at a route stop. Let a small original mascot be dragged along the path and snap to the nearest of the three stops. This directly expresses the requested concept and removes scroll-driven state.

## Design

- Use a natural-height section with the existing deep forest green and amber palette. Remove the `280svh` height, sticky panel, scroll-step listener, photo stack, and this section's scroll-snap alignment.
- Draw the route as lightweight inline SVG/CSS artwork, using surface changes and small road, grass, and mountain symbols instead of photography. On narrow screens, rearrange it into a vertical or diagonal route with readable callouts.
- Give each route stop a cloud-shaped callout containing its number, title, and current short description: Discover, Join, Hike.
- Use a small original inline-SVG explorer mascot with a backpack; no external image or animation dependency is needed.
- Pointer dragging moves the mascot along the track. On release, it animates to the closest stop. Tapping a stop also moves it there. Provide keyboard controls and an announced current stop so drag is not the only way to use the interaction. Respect reduced-motion preferences.
- Keep the existing copy and section position in the page. Do not change the hero snap, hike strip, or surrounding sections.

## Constraints and non-goals

- No backend data, new route, external asset, or dependency is required.
- Do not make the section sticky, viewport-height, or dependent on page scroll to change steps.
- Keep the route decorative and the three step descriptions as semantic text.

## Implementation calls

- The mascot will snap to three fixed route stops rather than roam freely, so its location always reinforces one of the three steps.
- The route will be an inline illustration so it remains crisp, responsive, and easy to adjust with the current palette.
- The section will be extracted into a focused landing component to keep `HomePageContent` readable.

## Approval

Approved by the user before implementation.
