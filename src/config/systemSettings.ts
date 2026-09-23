/**
 * System-wide feature flags and settings.
 *
 * Edit values here for now. Later a manage page / API can feed the same shape
 * through `src/lib/systemSettings.ts` without changing call sites.
 */
export const systemSettings = {
  /** When true, ingredient forms call AI to suggest a category. */
  aiCategoryDetection: false,
} as const

export type SystemSettingKey = keyof typeof systemSettings

export type SystemSettings = {
  readonly [K in SystemSettingKey]: (typeof systemSettings)[K]
}
