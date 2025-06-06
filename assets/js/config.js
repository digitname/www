/**
 * Application Configuration
 * Centralized configuration for the application
 */

// Environment detection
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = !isProduction;

// API Configuration
const API_CONFIG = {
  BASE_URL: isProduction ? 'https://api.digitname.com' : 'http://localhost:3000',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  VERSION: 'v1',
  ENDPOINTS: {
    PROJECTS: '/projects',
    CONTACT: '/contact',
    SUBSCRIBE: '/subscribe'
  }
};

// Analytics Configuration
const ANALYTICS_CONFIG = {
  ENABLED: isProduction,
  TRACKING_ID: isProduction ? 'UA-XXXXX-Y' : 'TEST-XXXXX-Y',
  SAMPLE_RATE: 100, // 100% of users
  SITE_SPEED_SAMPLE_RATE: 10, // 10% of pageviews
  ANONYMIZE_IP: true,
  FORCE_SSL: true
};

// Feature Flags
const FEATURE_FLAGS = {
  DARK_MODE: true,
  OFFLINE_SUPPORT: true,
  NOTIFICATIONS: true,
  ANALYTICS: isProduction,
  SERVICE_WORKER: 'serviceWorker' in navigator && isProduction,
  WEB_PUSH: 'PushManager' in window && isProduction
};

// UI Configuration
const UI_CONFIG = {
  THEMES: {
    LIGHT: 'light',
    DARK: 'dark',
    SYSTEM: 'system'
  },
  DEFAULT_THEME: 'system',
  TRANSITION_DURATION: 300, // ms
  TOAST_DURATION: 5000, // ms
  LAZY_LOAD_OFFSET: 200 // pixels
};

// Local Storage Keys
const STORAGE_KEYS = {
  THEME: 'app_theme',
  TOKEN: 'auth_token',
  USER: 'user_data',
  SETTINGS: 'app_settings',
  CACHE_PREFIX: 'cache_',
  CACHE_TIMESTAMP: 'cache_timestamp_'
};

// Cookie Configuration
const COOKIE_CONFIG = {
  PATH: '/',
  DOMAIN: isProduction ? '.digitname.com' : '',
  SECURE: isProduction,
  SAME_SITE: 'Lax',
  MAX_AGE: 60 * 60 * 24 * 30, // 30 days
  SESSION: 'session',
  PERSISTENT: 'persistent'
};

// Error Messages
const ERROR_MESSAGES = {
  NETWORK: 'Network error. Please check your connection and try again.',
  SERVER: 'Server error. Please try again later.',
  TIMEOUT: 'Request timed out. Please try again.',
  UNAUTHORIZED: 'You need to be logged in to perform this action.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please check your input and try again.',
  UNKNOWN: 'An unknown error occurred. Please try again.'
};

// Success Messages
const SUCCESS_MESSAGES = {
  SAVED: 'Your changes have been saved.',
  DELETED: 'The item has been deleted.',
  SENT: 'Your message has been sent. We\'ll get back to you soon!',
  SUBSCRIBED: 'Thank you for subscribing!',
  UPDATED: 'Your information has been updated.'
};

// Export configuration
const CONFIG = {
  ENV: {
    IS_PRODUCTION: isProduction,
    IS_DEVELOPMENT: isDevelopment,
    NODE_ENV: process.env.NODE_ENV || 'development'
  },
  API: API_CONFIG,
  ANALYTICS: ANALYTICS_CONFIG,
  FEATURES: FEATURE_FLAGS,
  UI: UI_CONFIG,
  STORAGE: STORAGE_KEYS,
  COOKIE: COOKIE_CONFIG,
  MESSAGES: {
    ERROR: ERROR_MESSAGES,
    SUCCESS: SUCCESS_MESSAGES
  },
  // Helper methods
  getApiUrl: (endpoint) => {
    const base = API_CONFIG.BASE_URL.endsWith('/') 
      ? API_CONFIG.BASE_URL.slice(0, -1) 
      : API_CONFIG.BASE_URL;
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${base}/api/${API_CONFIG.VERSION}${path}`;
  },
  // Add feature detection methods
  supports: {
    webp: async () => {
      if (!self.createImageBitmap) return false;
      const webpData = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=';
      const blob = await fetch(webpData).then(r => r.blob());
      return createImageBitmap(blob).then(() => true, () => false);
    },
    avif: async () => {
      if (!self.createImageBitmap) return false;
      const avifData = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEQAABAAEAAAAAAUoAAAAK';
      const blob = await fetch(avifData).then(r => r.blob());
      return createImageBitmap(blob).then(() => true, () => false);
    }
  }
};

// Freeze the config object to prevent modifications
Object.freeze(CONFIG);

export default CONFIG;
