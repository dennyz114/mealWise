# MW-007 — Household Settings

## Description
Lets users manage their household from the Settings page — view members, share the join code, and either close or leave the household depending on their role. The Settings page is reachable from the profile dropdown.

## Requirements

### Settings Page Structure
- Settings page is accessible from the profile dropdown
- Mobile: single-column layout with sections stacked vertically
- Desktop: same layout, no sub-sidebar navigation (ignore the sidebar shown in mocks)

### Account Section
- Display the user's display name (read-only for now — no edit button)
- Display the user's email (read-only, comes from Google OAuth)

### Household Section
- Display household name with an "Edit" button (owner only)
  - Max length: 50 characters
  - All characters allowed
  - On save, validate length and update the household name
  - Show validation error if name exceeds 50 characters
- Display join code with a "Copy" button
  - On click, copies the code to clipboard
  - Icon briefly changes to a checkmark for a few seconds (same pattern as profile dropdown copy)

### Member List
- Display all household members
- Each member shows:
  - Avatar with initial(s) and deterministic background color based on the first letter of the name
  - Full name
  - Email address
  - Badges: "Owner" (if applicable), "You" (for the current user)

### Avatar Color Mapping
Deterministic color assignment based on the first letter of the member's name:

| Letter Range | Color |
|-------------|-------|
| A–C | Coral (#FAECE7 / #712B13) |
| D–F | Green (#EAF3DE / #27500A) |
| G–I | Amber (#FAEEDA / #633806) |
| J–L | Teal (#E1F5EE / #085041) |
| M–O | Blue (#E6F1FB / #0C447C) |
| P–R | Purple (#EEEDFE / #534AB7) |
| S–U | Pink (#FBEAF0 / #72243E) |
| V–Z | Dark Blue (brand accent) |

### Danger Zone — Owner View
- Show "Close household" section with red styling
- Description: "Permanently deletes this household and all its data for every member. This cannot be undone."
- Button opens a confirmation modal

### Close Household Confirmation Modal
- Title: "Close household"
- Body explains the action will permanently delete the household and remove all members
- Warning banner: "This action cannot be undone. All X members will lose access immediately." (where X is the member count)
- Input field: "Type **[household name]** to confirm"
- Confirm button is disabled (dimmed) until the typed name exactly matches the household name
- Even if the owner is the last member, the confirmation flow is still required
- On success: redirect to the create/join household screen

### Danger Zone — Member View
- Show "Leave household" section with red styling
- Description: "You'll lose access to shared menus and shopping lists. The household continues for other members."
- Button opens a simple confirmation modal

### Leave Household Confirmation Modal
- Title: "Leave household"
- Body warns the user they will lose access to shared menus and shopping lists
- "Leave" and "Cancel" buttons
- On success: redirect to the create/join household screen

### Ownership Transfer (Backend Rule)
- If the owner leaves the household, ownership automatically transfers to the next member
- No UI needed for this — it's a backend rule

### Update to MW-006 — Create Household Name Validation
- Add max length of 50 characters to the household name input in the create household flow
- Show validation error if name exceeds 50 characters
