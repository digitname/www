/**
 * Debounce function to limit the rate at which a function can fire
 * @param {Function} func - The function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to limit the rate at which a function can fire
 * @param {Function} func - The function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} - Throttled function
 */
export function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Check if element is in viewport
 * @param {HTMLElement} el - The element to check
 * @returns {boolean} - True if element is in viewport
 */
export function isInViewport(el) {
  if (!el) return false;
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Smooth scroll to element
 * @param {string} selector - CSS selector of the element to scroll to
 * @param {Object} options - Scroll options
 */
export function smoothScroll(selector, options = {}) {
  const defaultOptions = {
    behavior: 'smooth',
    block: 'start',
    ...options
  };
  
  const element = document.querySelector(selector);
  if (element) {
    element.scrollIntoView(defaultOptions);
  }
}

/**
 * Toggle CSS class on element
 * @param {HTMLElement} element - The target element
 * @param {string} className - The class name to toggle
 * @param {boolean} force - Force add or remove the class
 */
export function toggleClass(element, className, force) {
  if (!element) return;
  
  if (force === undefined) {
    element.classList.toggle(className);
  } else if (force) {
    element.classList.add(className);
  } else {
    element.classList.remove(className);
  }
}

/**
 * Format date string
 * @param {string|Date} date - The date to format
 * @param {string} locale - Locale string (default: 'en-US')
 * @returns {string} - Formatted date string
 */
export function formatDate(date, locale = 'en-US') {
  if (!date) return '';
  
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  return new Date(date).toLocaleDateString(locale, options);
}

/**
 * Generate a unique ID
 * @returns {string} - A unique ID string
 */
export function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Check if device is mobile
 * @returns {boolean} - True if device is mobile
 */
export function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Load external script
 * @param {string} url - URL of the script to load
 * @returns {Promise} - Promise that resolves when script is loaded
 */
export function loadScript(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/**
 * Load external stylesheet
 * @param {string} href - URL of the stylesheet to load
 * @returns {Promise} - Promise that resolves when stylesheet is loaded
 */
export function loadStylesheet(href) {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = resolve;
    link.onerror = reject;
    document.head.appendChild(link);
  });
}

/**
 * Get URL parameters
 * @param {string} name - Parameter name to get
 * @returns {string|null} - Parameter value or null if not found
 */
export function getUrlParameter(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

/**
 * Set URL parameter without page reload
 * @param {string} name - Parameter name
 * @param {string} value - Parameter value
 */
export function setUrlParameter(name, value) {
  const url = new URL(window.location);
  url.searchParams.set(name, value);
  window.history.pushState({}, '', url);
}
