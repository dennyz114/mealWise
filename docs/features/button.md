# Button component

Reusable `Button` (`src/components/ui/button.tsx`).

- Variants: **primary**, **secondary**, **icon-only**.
- States: disabled (50% opacity), loading (spinner replaces icon), hover (color only).
- Icon on the left when provided; icon-only needs tooltip + `aria-label`.
- Min tap target ~44×44px; radius `--radius-md`.
