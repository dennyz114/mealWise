# Database Schema

Platform: **Supabase (PostgreSQL)**
All primary keys are `uuid`. Timestamps use `timestamptz`.

---

## Tables

### `auth.users` (Supabase built-in)
Managed by Supabase Auth. Referenced by `profiles.id`, `households.created_by`, `household_members.user_id`, `meals.created_by`, and `weekly_menus.created_by`.

---

### `profiles`
Extends `auth.users` with public user data.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK, references `auth.users.id` |
| `display_name` | text | |
| `avatar_url` | text | |
| `created_at` | timestamptz | |

---

### `households`
A household groups users together to share meals, menus, and shopping lists.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `name` | text | |
| `join_code` | text | Unique code for inviting members |
| `created_by` | uuid | References `auth.users.id` |
| `created_at` | timestamptz | |

---

### `household_members`
Junction table linking users to households with a role.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `household_id` | uuid | References `households.id` |
| `user_id` | uuid | References `auth.users.id` |
| `role` | text | e.g. `owner`, `member` |
| `joined_at` | timestamptz | |

---

### `meals`
A meal belongs to a household and can be reused across weekly menus.

| Column | Type | Notes |
|---|---|---|---|
| `id` | uuid | PK |
| `household_id` | uuid | References `households.id` |
| `name` | text | |
| `icon` | text | Icon name from Tabler Icons, randomly assigned at creation |
| `created_by` | uuid | References `auth.users.id` |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

---

### `meal_ingredients`
Ingredients that belong to a meal.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `meal_id` | uuid | References `meals.id` |
| `name` | text | |
| `quantity` | numeric | |
| `unit` | text | e.g. `g`, `ml`, `units` |
| `category` | text | e.g. `dairy`, `produce`, `meat` |
| `created_at` | timestamptz | |

---

### `weekly_menus`
Represents a weekly meal plan for a household starting on a specific date.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `household_id` | uuid | References `households.id` |
| `week_start` | date | Monday of the week |
| `created_by` | uuid | References `auth.users.id` |
| `created_at` | timestamptz | |

---

### `menu_days`
Assigns a meal to a specific day within a weekly menu.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `weekly_menu_id` | uuid | References `weekly_menus.id` |
| `day_of_week` | int2 | 1=Monday … 7=Sunday |
| `meal_id` | uuid | References `meals.id` |
| `created_at` | timestamptz | |

---

### `shopping_list_items`
Shopping list items derived from (or manually added to) a weekly menu.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `weekly_menu_id` | uuid | References `weekly_menus.id` |
| `ingredient_name` | text | |
| `quantity` | numeric | |
| `unit` | text | |
| `category` | text | |
| `is_checked` | bool | Whether the item has been purchased |
| `is_manual` | bool | `true` if added manually, not from a meal |
| `created_at` | timestamptz | |

---

## Relationships Overview

```
auth.users
  ├── profiles (1:1)
  ├── households.created_by (1:N)
  ├── household_members.user_id (1:N)
  ├── meals.created_by (1:N)
  └── weekly_menus.created_by (1:N)

households
  ├── household_members (1:N)
  ├── meals (1:N)
  └── weekly_menus (1:N)
        ├── menu_days (1:N)
        │     └── meals (N:1)
        └── shopping_list_items (1:N)

meals
  └── meal_ingredients (1:N)
```

---

## Notes

- **Row Level Security (RLS)** should be enabled on all tables. Users must belong to a household to read or write its data.
- **`join_code`** on `households` should have a unique constraint and be used only for invite flows — never exposed in public listings.
- **`is_manual`** on `shopping_list_items` distinguishes auto-generated items (from meal ingredients) from ones the user typed in manually. Keep this distinction when syncing or regenerating the list.
- **`day_of_week`** uses `int2` with 1=Monday through 7=Sunday (ISO 8601). Always enforce this convention in application code.
- **`week_start`** should always be a Monday. Validate this at the application layer before inserting.