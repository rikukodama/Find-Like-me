// src/i18n.js
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import translationEN from './locales/en/translation.json'
import translationPL from './locales/pl/translation.json'
import translationFR from './locales/fr/translation.json'
import translationES from './locales/es/translation.json'

// Map of language codes to their full variants
const languageMap = {
	en: ['en', 'en-US', 'en-GB'],
	pl: ['pl', 'pl-PL'],
	fr: ['fr', 'fr-FR', 'fr-CA'],
	es: ['es', 'es-ES', 'es-MX', 'es-AR'],
}

const resources = {
	en: { translation: translationEN },
	pl: { translation: translationPL },
	fr: { translation: translationFR },
	es: { translation: translationES },
}

// Custom language detector
const customDetector = {
	name: 'customNavigatorDetector',
	lookup() {
		if (typeof window === 'undefined') return undefined

		// Get browser language
		const browserLang = navigator.language || navigator.userLanguage

		// Find matching language from our supported languages
		for (const [key, variants] of Object.entries(languageMap)) {
			if (variants.some(variant => browserLang.toLowerCase().startsWith(variant))) {
				return key // Returns normalized language code (en, pl, fr, es)
			}
		}

		return 'en' // Default fallback
	},
}

i18n
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		resources,
		fallbackLng: 'en',
		interpolation: {
			escapeValue: false,
		},

		detection: {
			order: [
				'customNavigatorDetector', // Our custom detector first
				'querystring', // example: ?lng=en
				'localStorage', // window.localStorage.i18nextLng
				'sessionStorage',
				'navigator', // navigator.language
				'htmlTag', // <html lang="en">
			],
			lookupQuerystring: 'lng',
			lookupLocalStorage: 'i18nextLng',
			caches: ['localStorage'],
			cookieMinutes: 10080, // 7 days
			cookieDomain: window.location.hostname,
		},
		react: {
			useSuspense: false,
		},
	})

// Save language preference when it changes
i18n.on('languageChanged', lng => {
	// Normalize the language code before saving
	const normalizedLng =
		Object.entries(languageMap).find(([key, variants]) =>
			variants.some(variant => lng.toLowerCase().startsWith(variant))
		)?.[0] || 'en'

	localStorage.setItem('i18nextLng', normalizedLng)
})

export default i18n
