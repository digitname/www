/**
 * Internationalization (i18n) Utilities
 * Provides translation and localization functionality
 */

import { Storage } from './storage.js';
import CONFIG from '../config.js';

// Default language (English)
const DEFAULT_LANGUAGE = 'en';

// Supported languages with their display names
const SUPPORTED_LANGUAGES = {
  en: { name: 'English', nativeName: 'English' },
  de: { name: 'German', nativeName: 'Deutsch' },
  es: { name: 'Spanish', nativeName: 'Español' },
  fr: { name: 'French', nativeName: 'Français' },
  it: { name: 'Italian', nativeName: 'Italiano' },
  pl: { name: 'Polish', nativeName: 'Polski' },
  ru: { name: 'Russian', nativeName: 'Русский' },
  zh: { name: 'Chinese', nativeName: '中文' },
  ja: { name: 'Japanese', nativeName: '日本語' },
  ko: { name: 'Korean', nativeName: '한국어' },
  ar: { name: 'Arabic', nativeName: 'العربية', rtl: true }
};

// RTL (right-to-left) languages
const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

// Translation cache
const translationCache = new Map();

// Current language state
let currentLanguage = DEFAULT_LANGUAGE;
let currentTranslations = {};

// Storage for user preferences
const storage = new Storage('i18n');

/**
 * Detect the user's preferred language from browser settings
 * @returns {string} The detected language code
 */
function detectLanguage() {
  // Check URL parameter first (e.g., ?lang=de)
  const urlParams = new URLSearchParams(window.location.search);
  const urlLang = urlParams.get('lang');
  if (urlLang && SUPPORTED_LANGUAGES[urlLang]) {
    return urlLang;
  }
  
  // Check localStorage for previously selected language
  const savedLang = storage.get('language');
  if (savedLang && SUPPORTED_LANGUAGES[savedLang]) {
    return savedLang;
  }
  
  // Detect from browser settings
  const browserLang = navigator.language || navigator.userLanguage || '';
  const langCode = browserLang.split('-')[0].toLowerCase();
  
  // Check if the detected language is supported
  if (SUPPORTED_LANGUAGES[langCode]) {
    return langCode;
  }
  
  // Fall back to default language
  return DEFAULT_LANGUAGE;
}

/**
 * Check if a language is RTL (right-to-left)
 * @param {string} lang - Language code
 * @returns {boolean} True if the language is RTL
 */
function isRTL(lang = currentLanguage) {
  return RTL_LANGUAGES.includes(lang);
}

/**
 * Set the document direction based on language
 * @param {string} lang - Language code
 */
function setDocumentDirection(lang) {
  document.documentElement.dir = isRTL(lang) ? 'rtl' : 'ltr';
  document.documentElement.lang = lang;
}

/**
 * Load translations for a specific language
 * @param {string} lang - Language code
 * @returns {Promise<Object>} The translations object
 */
async function loadTranslations(lang) {
  // Check cache first
  if (translationCache.has(lang)) {
    return translationCache.get(lang);
  }
  
  try {
    // In a real app, you would fetch this from your server
    // For now, we'll use a simple in-memory object
    const response = await fetch(`/locales/${lang}.json`);
    
    if (!response.ok) {
      throw new Error(`Failed to load translations for ${lang}`);
    }
    
    const translations = await response.json();
    
    // Cache the translations
    translationCache.set(lang, translations);
    
    return translations;
  } catch (error) {
    console.error('Error loading translations:', error);
    
    // Fall back to empty translations if loading fails
    const emptyTranslations = {};
    translationCache.set(lang, emptyTranslations);
    return emptyTranslations;
  }
}

/**
 * Initialize the i18n system
 * @param {string} defaultLang - Default language code
 * @returns {Promise<void>}
 */
async function init(defaultLang = null) {
  const lang = defaultLang || detectLanguage();
  await setLanguage(lang);
}

/**
 * Set the current language
 * @param {string} lang - Language code
 * @returns {Promise<boolean>} True if the language was set successfully
 */
async function setLanguage(lang) {
  if (!SUPPORTED_LANGUAGES[lang]) {
    console.warn(`Language '${lang}' is not supported`);
    return false;
  }
  
  if (lang === currentLanguage) {
    return true; // Already set
  }
  
  try {
    // Load translations
    const translations = await loadTranslations(lang);
    
    // Update state
    currentLanguage = lang;
    currentTranslations = translations;
    
    // Update document
    setDocumentDirection(lang);
    document.documentElement.setAttribute('lang', lang);
    
    // Save preference
    storage.set('language', lang);
    
    // Dispatch event
    const event = new CustomEvent('languageChanged', {
      detail: { language: lang, rtl: isRTL(lang) }
    });
    window.dispatchEvent(event);
    
    return true;
  } catch (error) {
    console.error('Failed to set language:', error);
    return false;
  }
}

/**
 * Get the current language
 * @returns {string} The current language code
 */
function getLanguage() {
  return currentLanguage;
}

/**
 * Get the display name of a language
 * @param {string} lang - Language code
 * @param {boolean} native - Whether to return the native name
 * @returns {string} The display name of the language
 */
function getLanguageName(lang, native = false) {
  const language = SUPPORTED_LANGUAGES[lang];
  if (!language) return lang;
  return native ? language.nativeName : language.name;
}

/**
 * Get all supported languages
 * @returns {Object} Object with language codes as keys and language info as values
 */
function getSupportedLanguages() {
  return { ...SUPPORTED_LANGUAGES };
}

/**
 * Translate a key with optional parameters
 * @param {string} key - Translation key
 * @param {Object} params - Parameters to interpolate
 * @returns {string} The translated string
 */
function t(key, params = {}) {
  // Get the translation
  let translation = key
    .split('.')
    .reduce((obj, k) => (obj && obj[k] !== undefined ? obj[k] : key), currentTranslations);
  
  // If no translation found, return the key
  if (translation === key) {
    console.warn(`Translation missing for key: ${key}`);
    return key;
  }
  
  // Replace placeholders with parameters
  if (params) {
    Object.keys(params).forEach(param => {
      translation = translation.replace(new RegExp(`\\{${param}\\}`, 'g'), params[param]);
    });
  }
  
  return translation;
}

/**
 * Format a number according to the current locale
 * @param {number} number - The number to format
 * @param {Object} options - Intl.NumberFormat options
 * @returns {string} The formatted number
 */
function formatNumber(number, options = {}) {
  return new Intl.NumberFormat(currentLanguage, options).format(number);
}

/**
 * Format a date according to the current locale
 * @param {Date|number|string} date - The date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} The formatted date
 */
function formatDate(date, options = {}) {
  const dateObj = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat(currentLanguage, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  }).format(dateObj);
}

/**
 * Format a relative time (e.g., "2 days ago")
 * @param {Date|number|string} date - The date to format
 * @param {Object} options - Intl.RelativeTimeFormat options
 * @returns {string} The formatted relative time
 */
function formatRelativeTime(date, options = {}) {
  const dateObj = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now - dateObj) / 1000);
  
  // Define time units in seconds
  const units = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1
  };
  
  // Find the largest unit to display
  for (const [unit, seconds] of Object.entries(units)) {
    const diff = Math.floor(diffInSeconds / seconds);
    
    if (Math.abs(diff) >= 1 || unit === 'second') {
      const formatter = new Intl.RelativeTimeFormat(currentLanguage, {
        numeric: 'auto',
        ...options
      });
      
      return formatter.format(-diff, unit);
    }
  }
  
  return formatDate(dateObj);
}

// Initialize with default language on load
if (typeof window !== 'undefined') {
  init();
}

// Export the API
export {
  init,
  t,
  getLanguage,
  setLanguage,
  getLanguageName,
  getSupportedLanguages,
  isRTL,
  formatNumber,
  formatDate,
  formatRelativeTime,
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES
};

export default {
  init,
  t,
  getLanguage,
  setLanguage,
  getLanguageName,
  getSupportedLanguages,
  isRTL,
  formatNumber,
  formatDate,
  formatRelativeTime,
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES
};
