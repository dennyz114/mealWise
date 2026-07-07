# MW-006 — Household Management

## Description
A household is the core unit of mealWise — all meals, menus, and shopping lists belong to a household. When a user logs in without a household, they must either create one or join an existing one before accessing the main application. This feature enforces the household-first flow and provides the UI for creating, joining, and displaying household information.

## Requirements

### No-Household Gate
- After login, if the user has no household, display a "Set up your household" screen replacing the main content area
- The header remains visible but navigation tabs are dimmed/disabled
- The setup screen presents two options: "Create a household" and "Join a household"
- Tapping either option opens a bottom sheet (mobile) or modal (desktop)

### Create Household
- Opens a bottom sheet on mobile or a modal on desktop
- Title: "Create a household"
- Subtitle: "Give your household a name. You'll get a code to share with others."
- Input field for household name (required, cannot be empty)
- Join code is auto-generated when the sheet/modal opens (visible before the user types a name)
- Join code format: `XXX-XXX` (6 alphanumeric characters with a hyphen in the middle, e.g., `XK4-92T`)
- Copy icon button next to the join code to copy it to clipboard
- Helper text below the code: "Share this code with anyone you want to invite. They can join from their profile."
- "Create household" button — disabled until a household name is entered
- "Cancel" button — closes the sheet/modal without creating a household
- On success, the user becomes the owner of the household and is redirected to the meals placeholder
- On error, display a user-friendly error message

### Join Household
- Opens a bottom sheet on mobile or a modal on desktop
- Title: "Join a household"
- Subtitle: "Ask the household owner for their 7-character code and enter it below."
- Input field for join code with mask `XXX-XXX` (auto-inserts the hyphen after the 3rd character)
- Placeholder: `e.g. XK4-92T`
- "Join household" button — disabled until a valid-length code is entered
- "Cancel" button — closes the sheet/modal without joining
- On success, the user joins the household and is redirected to the meals placeholder
- On error (invalid code), display an error message after the API response

### Profile Dropdown — No Household
- "My household" row is disabled (40% opacity) and not clickable
- Amber "Setup needed" badge displayed next to the row
- Other profile menu items (Dark mode, Language, Settings, Sign out) remain functional

### Profile Dropdown — Has Household
- "My household" row is active and clickable
- Clicking the join code copies it to clipboard

### Responsive Behavior
- Mobile (< 640px): bottom sheets for create/join actions
- Desktop (≥ 640px): centered modals for create/join actions
- The setup screen layout is centered on desktop, single column on mobile
