import { useSettingsStore } from '../store/useSettingsStore'
import { getTranslation, type TranslationKey } from './translations'

export function useTranslation() {
  const language = useSettingsStore((s) => s.language)

  function t(key: TranslationKey, vars?: Record<string, string | number>): string {
    return getTranslation(language, key, vars)
  }

  return { t, language }
}
