# Household management

Household is the core unit — meals, menus, and shopping lists belong to it.

## Gate
- After login, users **without** a household see setup (create / join) instead of the main app.
- Header stays; nav may be dimmed until setup completes.

## Create
- Name required (max 50 chars).
- Join code auto-generated `XXX-XXX` (copyable).
- Creator becomes **owner**.
- Implemented via `create_household` RPC (RLS-safe).

## Join
- Enter `XXX-XXX` code.
- Implemented via `join_household_by_code` RPC (non-members cannot SELECT households by code under RLS).

## Profile dropdown
- No household: “My household” disabled + “Setup needed”.
- Has household: show join code, click/copy works.

## Responsive
- Mobile: bottom sheets; desktop: modals/sheets per existing UI patterns.
