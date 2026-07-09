# Review — Bugfix: Mobile navigation & ingredient picker auto-open

## Bugs

1. **[BLOCKING] Vertical scroll triggers `onTap` navigation** — `SwipeableCard.tsx:29-43` only tracks horizontal movement via `didSwipe`. `handleTouchMove` never reads `touch.clientY`, so it cannot distinguish a tap from a vertical scroll. When a user scrolls vertically through the meal list on mobile, each card's `handleTouchEnd` fires with `didSwipe = false` → `onTap()` fires → navigation happens. The user intended to scroll the list, not open a meal. Fix: add a `touchStartY` ref, track vertical displacement in `handleTouchMove`, and gate `onTap()` on vertical displacement being below a threshold (e.g. 10px).

2. **[BLOCKING] Tap on revealed (swiped-open) card navigates instead of just dismissing** — `SwipeableCard.tsx:50-59`: if `isRevealed` is true and the user taps (no horizontal swipe), `handleTouchEnd` falls into the `else` branch: `setTranslateX(0)`, `setIsRevealed(false)`, and then `onTap()` fires. The user intended to dismiss the delete reveal, not navigate to the detail page. Fix: add `if (isRevealed) { setTranslateX(0); setIsRevealed(false); return; }` before the `onTap()` call.

3. **[NON-BLOCKING] `onClick` on content div does not actually prevent double-firing** — `SwipeableCard.tsx:96-99` calls `e.preventDefault()` + `e.stopPropagation()`, but this runs in the bubbling phase *after* `MealCard`'s own `onClick` has already fired (the event target is the `MealCard` root div, which is a child). Both `onTap()` (from `handleTouchEnd`) and `MealCard.onClick()` fire `onMealClick(meal)`, resulting in two `navigate()` calls to the same route. TanStack Router deduplicates this in practice, so it's not user-visible, but it's dead logic. A more correct approach would be to pass `onClick={undefined}` to `MealCard` on mobile instead of trying to block the event after the fact.

## Duplicated Code

No issues found.

## Orphaned / Unused Code

No issues found.

## Guideline Violations

No new violations introduced by this fix. The changes are consistent with existing patterns.

## Missing Test Coverage

No tests exist for `SwipeableCard`, `MealList`, or `CreateMealSheet`. The previous review (MW-008) already flagged this gap. The new bugfix behavior adds additional untested scenarios:

| Missing Test | What It Should Cover |
|---|---|
| `SwipeableCard.test.tsx` | Tap fires `onTap`; horizontal swipe ≥80px reveals delete and does NOT fire `onTap`; short swipe <80px snaps back without firing `onTap`; vertical scroll does NOT fire `onTap`; tap on revealed card dismisses reveal without navigating |

## Requirement Gaps

1. **[Req 3] Auto-open ingredient picker after meal creation — FIXED** — `CreateMealSheet.tsx:42` sets `sessionStorage.setItem('addIngredient', newMeal.id)`, and `MealDetailPage.tsx:26-31` reads it in a `useEffect` to open the picker. The removal of `onOpenChange(false)` before `navigate()` is correct: `MealsPage` is unmounted on route change, which unmounts the `CreateMealSheet` and its Radix Dialog portal. The `sessionStorage` flag is consumed and removed in the same effect, preventing stale state.

2. **[Req 7] Mobile tap on meal card navigates to detail — PARTIALLY FIXED** — The `onTap` mechanism works for pure taps, but fails for vertical scrolls (Bug #1) and taps on revealed cards (Bug #2). These two edge cases need to be addressed before the fix is complete.

## Suggested Enhancements

1. **Track vertical displacement to distinguish taps from scrolls** — Add `touchStartY` ref alongside `touchStartX`, compute vertical diff in `handleTouchMove`, and set a `didScroll` ref when `Math.abs(verticalDiff) > 10`. Gate `onTap()` on `!didScroll.current`.

2. **Gate `onTap()` on `isRevealed`** — When the card is in the revealed state, a tap should only dismiss the reveal, not navigate:
   ```tsx
   if (!didSwipe.current && !isRevealed) {
     onTap?.()
   }
   ```

3. **Pass `onClick={undefined}` to `MealCard` on mobile** — Instead of blocking the click event after the fact, prevent `MealCard` from attaching its `onClick` handler when wrapped in `SwipeableCard`. This eliminates the double-fire issue entirely:
   ```tsx
   // In MealList.tsx, wrap MealCard differently for mobile:
   <MealCard
     onClick={isDesktop ? () => onMealClick(meal) : undefined}
     ...
   />
   ```

4. **Reset `touchCurrentX` in `handleTouchEnd`** — Minor: `touchCurrentX.current` is never reset, so the next `handleTouchEnd` reads stale values. Reset it alongside `didSwipe` in `handleTouchStart` for correctness.
