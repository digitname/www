/**
 * Feature detection utilities
 * Provides methods to detect browser features and capabilities
 */

// Cache feature detection results
const featureCache = new Map();

/**
 * Check if a CSS feature is supported
 * @param {string} property - CSS property to check
 * @param {string} value - CSS value to test
 * @returns {boolean}
 */
export function supportsCss(property, value) {
  const cacheKey = `css:${property}:${value}`;
  if (featureCache.has(cacheKey)) {
    return featureCache.get(cacheKey);
  }

  try {
    const style = document.createElement('div').style;
    
    // Test standard property
    style[property] = value;
    if (style[property] === value) {
      featureCache.set(cacheKey, true);
      return true;
    }

    // Test vendor-prefixed properties
    const prefixes = ['Webkit', 'Moz', 'ms', 'O'];
    const prop = property.charAt(0).toUpperCase() + property.slice(1);
    
    for (const prefix of prefixes) {
      const prefixedProp = prefix + prop;
      style[prefixedProp] = value;
      if (style[prefixedProp] === value) {
        featureCache.set(cacheKey, true);
        return true;
      }
    }
  } catch (e) {
    // If any error occurs, assume not supported
  }

  featureCache.set(cacheKey, false);
  return false;
}

/**
 * Check if a JavaScript API is available
 * @param {string} api - API to check (e.g., 'IntersectionObserver')
 * @returns {boolean}
 */
export function supportsApi(api) {
  const cacheKey = `api:${api}`;
  if (featureCache.has(cacheKey)) {
    return featureCache.get(cacheKey);
  }

  const parts = api.split('.');
  let current = window;
  
  for (const part of parts) {
    if (!current[part]) {
      featureCache.set(cacheKey, false);
      return false;
    }
    current = current[part];
  }

  featureCache.set(cacheKey, true);
  return true;
}

/**
 * Check if WebP images are supported
 * @returns {Promise<boolean>}
 */
export function supportsWebP() {
  const cacheKey = 'webp';
  if (featureCache.has(cacheKey)) {
    return Promise.resolve(featureCache.get(cacheKey));
  }

  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const result = img.width === 1 && img.height === 1;
      featureCache.set(cacheKey, result);
      resolve(result);
    };
    img.onerror = () => {
      featureCache.set(cacheKey, false);
      resolve(false);
    };
    img.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
  });
}

/**
 * Check if the browser supports WebGL
 * @returns {boolean}
 */
export function supportsWebGL() {
  const cacheKey = 'webgl';
  if (featureCache.has(cacheKey)) {
    return featureCache.get(cacheKey);
  }

  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    const result = !!(gl && gl instanceof WebGLRenderingContext);
    featureCache.set(cacheKey, result);
    return result;
  } catch (e) {
    featureCache.set(cacheKey, false);
    return false;
  }
}

// Add to window for debugging in development
import { isDevelopment } from './env.js';

if (isDevelopment()) {
  window.featureDetection = {
    supportsCss,
    supportsApi,
    supportsWebP,
    supportsWebGL
  };
}
