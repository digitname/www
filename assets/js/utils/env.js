/**
 * Environment and Feature Flag Utilities
 * Provides environment detection and feature flag functionality
 */

import { Storage } from './storage.js';
import CONFIG from '../config.js';

// Environment detection
const env = {
  // Check if running in production
  isProduction: CONFIG.ENV.IS_PRODUCTION,
  
  // Check if running in development
  isDevelopment: CONFIG.ENV.IS_DEVELOPMENT,
  
  // Check if running on localhost
  isLocalhost: window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1',
  
  // Check if running on a mobile device
  isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
  
  // Check if running on iOS
  isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream,
  
  // Check if running on Android
  isAndroid: /Android/i.test(navigator.userAgent),
  
  // Check if running on Windows
  isWindows: /Win/i.test(navigator.platform),
  
  // Check if running on Mac
  isMac: /Mac/i.test(navigator.platform),
  
  // Check if running on Linux
  isLinux: /Linux/i.test(navigator.platform),
  
  // Check if running in a WebView
  isWebView: (() => {
    // @ts-ignore
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    return (userAgent.includes('WebView') || 
           (window.hasOwnProperty('ReactNativeWebView') && 
           /(android|iphone|ipod|ipad)/i.test(navigator.userAgent)));
  })(),
  
  // Check if running in a PWA
  isPWA: window.matchMedia('(display-mode: standalone)').matches || 
         window.navigator.standalone ||
         document.referrer.includes('android-app://'),
  
  // Check if running in an iframe
  isIframe: window.self !== window.top,
  
  // Check if touch is supported
  isTouch: 'ontouchstart' in window || 
           (window.DocumentTouch && document instanceof DocumentTouch) ||
           navigator.maxTouchPoints > 0 ||
           // @ts-ignore
           navigator.msMaxTouchPoints > 0
};

// Feature flags with local storage override support
class FeatureFlags {
  constructor() {
    this.storage = new Storage('feature_flags');
    this.flags = { ...CONFIG.FEATURES };
  }

  /**
   * Check if a feature is enabled
   * @param {string} feature - The feature name
   * @returns {boolean} - True if the feature is enabled
   */
  isEnabled(feature) {
    // Check for local storage override first
    const override = this.storage.get(feature);
    if (override !== null) {
      return override === 'true';
    }
    
    // Check config
    return !!this.flags[feature];
  }
  
  /**
   * Enable a feature flag
   * @param {string} feature - The feature name
   * @param {boolean} persist - Whether to persist the change
   */
  enable(feature, persist = false) {
    this.flags[feature] = true;
    if (persist) {
      this.storage.set(feature, 'true');
    }
  }
  
  /**
   * Disable a feature flag
   * @param {string} feature - The feature name
   * @param {boolean} persist - Whether to persist the change
   */
  disable(feature, persist = false) {
    this.flags[feature] = false;
    if (persist) {
      this.storage.set(feature, 'false');
    }
  }
  
  /**
   * Toggle a feature flag
   * @param {string} feature - The feature name
   * @param {boolean} persist - Whether to persist the change
   */
  toggle(feature, persist = false) {
    if (this.isEnabled(feature)) {
      this.disable(feature, persist);
    } else {
      this.enable(feature, persist);
    }
  }
  
  /**
   * Reset a feature flag to its default value
   * @param {string} feature - The feature name
   */
  reset(feature) {
    if (feature in CONFIG.FEATURES) {
      this.flags[feature] = CONFIG.FEATURES[feature];
      this.storage.remove(feature);
    }
  }
  
  /**
   * Reset all feature flags to their default values
   */
  resetAll() {
    this.flags = { ...CONFIG.FEATURES };
    this.storage.clear();
  }
  
  /**
   * Get all feature flags
   * @returns {Object} - Object with all feature flags
   */
  getAll() {
    return { ...this.flags };
  }
  
  /**
   * Get all overridden feature flags
   * @returns {Object} - Object with overridden feature flags
   */
  getOverrides() {
    const overrides = {};
    
    Object.keys(this.flags).forEach(key => {
      const storedValue = this.storage.get(key);
      if (storedValue !== null && storedValue !== String(CONFIG.FEATURES[key])) {
        overrides[key] = storedValue === 'true';
      }
    });
    
    return overrides;
  }
}

// Create a singleton instance
const featureFlags = new FeatureFlags();

// Export the environment and feature flags
export { env, featureFlags };

// Export as default for backward compatibility
export default {
  env,
  feature: featureFlags,
  isEnabled: (feature) => featureFlags.isEnabled(feature),
  enable: (feature, persist = false) => featureFlags.enable(feature, persist),
  disable: (feature, persist = false) => featureFlags.disable(feature, persist),
  toggle: (feature, persist = false) => featureFlags.toggle(feature, persist),
  reset: (feature) => featureFlags.reset(feature),
  resetAll: () => featureFlags.resetAll(),
  getAll: () => featureFlags.getAll(),
  getOverrides: () => featureFlags.getOverrides()
};
