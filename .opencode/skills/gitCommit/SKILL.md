---
name: gitCommit
description: Generates a simplified git commit message for a mealWise feature. Use when the Developer agent has finished implementing a feature and needs to suggest a commit message to the user.
---

# gitCommit

Generates a clean, simplified git commit message after a feature has been implemented.

## Output Format

```
MW-XXX-desc:
- Important change 1
- Important change 2
- Important change 3
```

## Rules

- The first line is the feature identifier followed by a colon — use the exact folder name from `features/` (e.g. `MW-001-login:`, `MW-002-meal-list:`)
- Each bullet is a short, plain-english summary of one meaningful change
- Focus on WHAT changed, not HOW — no file names, no component names, no technical jargon unless strictly necessary
- Maximum 5 bullets — group related changes if there are more
- Each bullet is one line, no sub-bullets
- Output only the commit message block — no explanation, no preamble

## Examples

```
MW-001-login:
- add Google OAuth login screen
- handle redirect after successful authentication
- create user profile on first login
```

```
MW-002-meal-list:
- add meal library view with search
- support create, edit and delete meals
- show ingredient count per meal card
```