# MW-002 — Dark Mode

## Description
Dark mode provides a theme toggle that allows users to switch between light and dark appearances. The app automatically detects the user's system preference on first visit and provides a manual toggle to override it. The selected preference persists across sessions.

## Requirements

- Auto-detect the user's system color preference on first visit
- Provide a manual toggle button in the bottom right corner to switch between light and dark modes
- User preference persists across sessions (localStorage or equivalent)
- Both light and dark themes must be fully supported across all pages
- System preference changes should not override the user's manual choice once set
