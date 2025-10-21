import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Import translation files
import trTranslations from './locales/tr.json'

const resources = {
  tr: {
    translation: trTranslations,
  },
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'tr', // Default to Turkish
    lng: 'tr', // Always use Turkish
    debug: false,

    interpolation: {
      escapeValue: false, // React already escapes values
    },
  })

export default i18n