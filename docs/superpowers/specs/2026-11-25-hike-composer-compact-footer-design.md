# Hike Composer Compact Footer Design

## Intent

Make the hike composer shorter and easier to scan by moving its location, joined-hiker, date, and mountain controls into a compact footer at the lower right of the caption field.

## Goals and constraints

- Keep the caption editable and preserve all current location, joined-hiker, date, and mountain selection behavior.
- Show location, joined-hiker, and date actions as icon buttons with hover tooltips and accessible names.
- Keep the selected mountain name visible in a compact selector beside the icon actions.
- Remove the location and joined-hiker text controls from the author row and the standalone mountain-name field row.
- Keep the capacity and available-spots controls, image area, and difficulty selector working as they do now.
- Allow the footer to fit at narrow widths without clipping the caption or controls.

## Approaches

1. **Caption footer (selected):** place the compact mountain selector and icon actions inside a footer visually joined to the caption field. This removes separate metadata controls and saves the most vertical space while keeping related editing controls together.
2. **Toolbar below the caption:** place the same controls in a separate row. This keeps the caption surface uninterrupted but uses more vertical space.

The user selected the caption footer.

## Interaction and layout

Use a bordered caption container with the textarea above a compact footer. Align the mountain selector and icon actions to the lower right. The location and joined-hiker buttons open their existing pickers; the calendar button opens the existing date picker. Add short tooltips and accessible labels to all icon buttons. Show the chosen mountain name in the compact selector and retain its current suggestions and custom-entry support.

On small screens, keep the footer within the caption container and let its contents wrap or compact as needed rather than overflow. Preserve current validation feedback for the mountain field.

## Out of scope

No changes to hike data, submission behavior, capacity calculations, image editing, or the posted hike layout.
