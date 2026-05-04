# UI Design Overhaul to Meta Store System

**Goal**: Update all shared UI components in `components/ui/` to fully comply with the Meta Store design system defined in `DESIGN.md`. This includes color palette, rounded corners, typography, shadows, and interaction states.

## User Review Required
> [!IMPORTANT]
> Review the proposed component changes for any custom business logic that may be affected (e.g., component props, variant handling). Approve or suggest adjustments before we proceed.

## Proposed Changes

### Core Styling Adjustments
- Apply Meta primary color `#0064E0` and secondary shades across components.
- Use `rounded-[20px]` for containers (cards, sheets, popovers) and `rounded-full` or `rounded-[8px]` for inputs, buttons, etc.
- Update focus rings to `focus-visible:ring-[3px] focus-visible:ring-[#0064E0]/20`.
- Standardize shadows to `shadow-[0_12px_28px_0_rgba(0,0,0,0.2),0_2px_4px_0_rgba(0,0,0,0.1)]` for overlays.
- Replace generic gray colors with token equivalents (`#F1F4F7`, `#CED0D4`, `#1C2B33`, `#65676B`).

### Component‑Specific Updates
| Component | Files to Modify | Key Changes |
|-----------|----------------|-------------|
| **Button** | `button.tsx` | Update `buttonVariants` to use pill shape (`rounded-full`), new color tokens, hover/active scaling, and remove legacy borders. |
| **Badge** | `badge.tsx` | Adjust variants to use Meta semantic colors, rounded full, and new border colors. |
| **Input** | `input.tsx` | Ensure `rounded-[8px]`, border `#CED0D4`, focus ring, placeholder color `#65676B`. |
| **Progress** | `progress.tsx` | Use Meta primary bar color `#0064E0`, background `#DEE3E9` unchanged, ensure rounded container. |
| **Select** | `select.tsx` | Already updated – verify consistency with other dropdown components. |
| **Dropdown‑Menu** | `dropdown-menu.tsx` | Updated radii, borders, shadows, typography. |
| **Popover** | `popover.tsx` | Updated radii, shadows, typography. |
| **Sheet** | `sheet.tsx` | Updated overlay opacity, borders, radii, spacing, title/description fonts. |
| **Tabs** | `tabs.tsx` | Updated list and trigger styles (rounded full, colors, shadows). |
| **Avatar** | `avatar.tsx` | Adjust border colors, sizes, and badge styling to match palette. |
| **Date‑Picker** | `date-picker.tsx` | Updated button styling to input‑style. |
| **Switch** | `switch.tsx` | Apply Meta toggle colors, rounded track, thumb sizing. |
| **Checkbox** | `checkbox.tsx` | Update border and check colors to Meta palette. |
| **Textarea** | `textarea.tsx` | Mirror Input styling (rounded, borders, focus). |
| **Card** | `card.tsx` | Ensure `rounded-[20px]`, shadow, background, and typography. |
| **Calendar** | `calendar.tsx` | Verify that component inherits global token colors; adjust if needed. |
| **Accordion**, **Pagination**, **Tooltip**, **Separator**, **Skeleton**, **Sonner**, **Label**, **Icon‑Button**, **Pagination** | Respective files | Minor token updates (colors, radii) to align with design system. |

## Open Questions
- Do any components rely on custom `variant` props that would conflict with the new color tokens? (e.g., `button` variant `outline` mapping to secondary). Please confirm if we should keep existing variant names or rename them to match Meta terminology.
- Are there any components that are not currently used in the UI but may be imported later? Should we apply the same updates proactively?

## Verification Plan
### Automated Tests
- Run `npm run test` (if test suite exists) to ensure no breaking changes.
- Lint with `npm run lint` to catch any style violations.

### Manual Verification
- Start the dev server (`npm run dev`) and visually inspect each component page (buttons, forms, dialogs, etc.) for correct colors, radii, and interactions.
- Use Storybook (if available) to snapshot component states.

---
*Once approved, we will generate a detailed task list in `task.md` and begin applying the changes.*
