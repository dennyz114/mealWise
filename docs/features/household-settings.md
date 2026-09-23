# Household settings

Settings page from profile dropdown.

## Account
- Display name and email (read-only today).

## Household
- Name editable by **owner** only (max 50).
- Join code + copy.
- Member list: avatar (deterministic color by name initial), name, email, Owner / You badges.

## Danger zone
- **Owner — Close household**: type exact household name to confirm; deletes household for everyone → redirect to setup.
- **Member — Leave**: simple confirm → redirect to setup.
- If owner leaves, ownership transfers to next member (backend rule; no UI).

See also: household create/join in [household-management.md](./household-management.md).
