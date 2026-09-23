import {
  systemSettings,
  type SystemSettingKey,
  type SystemSettings,
} from '@/config/systemSettings'

/**
 * Returns the full system settings object.
 * Swap this implementation later to load from an API or manage page.
 */
export const getSystemSettings = (): SystemSettings => systemSettings

/**
 * Returns a single system setting by key.
 */
export const getSystemSetting = <K extends SystemSettingKey>(
  key: K,
): SystemSettings[K] => getSystemSettings()[key]

/**
 * Convenience helper for boolean feature flags.
 */
export const isFeatureEnabled = (key: SystemSettingKey): boolean =>
  Boolean(getSystemSetting(key))
