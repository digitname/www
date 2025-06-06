/**
 * Cookie Utilities
 * Provides a simple interface for working with browser cookies
 */

/**
 * Set a cookie
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {Object} options - Cookie options
 * @param {number} options.days - Number of days until the cookie expires
 * @param {string} options.path - Cookie path (default: '/')
 * @param {string} options.domain - Cookie domain
 * @param {boolean} options.secure - If true, the cookie is only sent over HTTPS
 * @param {string} options.sameSite - SameSite attribute ('Strict', 'Lax', or 'None')
 */
function setCookie(name, value, options = {}) {
  const {
    days,
    path = '/',
    domain = '',
    secure = false,
    sameSite = 'Lax'
  } = options;
  
  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
  
  // Set expiration
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    cookieString += `; expires=${date.toUTCString()}`;
  }
  
  // Set path
  if (path) {
    cookieString += `; path=${path}`;
  }
  
  // Set domain
  if (domain) {
    cookieString += `; domain=${domain}`;
  }
  
  // Set secure flag
  if (secure) {
    cookieString += '; secure';
  }
  
  // Set SameSite attribute
  if (sameSite) {
    cookieString += `; SameSite=${sameSite}`;
    
    // If SameSite=None, the Secure attribute must also be set
    if (sameSite.toLowerCase() === 'none') {
      cookieString += '; secure';
    }
  }
  
  document.cookie = cookieString;
}

/**
 * Get a cookie value by name
 * @param {string} name - Cookie name
 * @returns {string|null} - Cookie value or null if not found
 */
function getCookie(name) {
  const nameEQ = `${encodeURIComponent(name)}=`;
  const cookies = document.cookie.split(';');
  
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1, cookie.length);
    }
    
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length, cookie.length));
    }
  }
  
  return null;
}

/**
 * Check if a cookie exists
 * @param {string} name - Cookie name
 * @returns {boolean} - True if the cookie exists
 */
function hasCookie(name) {
  return getCookie(name) !== null;
}

/**
 * Remove a cookie
 * @param {string} name - Cookie name
 * @param {Object} options - Cookie options
 * @param {string} options.path - Cookie path (must match the path used to set the cookie)
 * @param {string} options.domain - Cookie domain (must match the domain used to set the cookie)
 */
function removeCookie(name, options = {}) {
  // Set the cookie with an expiration date in the past
  setCookie(name, '', {
    ...options,
    days: -1
  });
}

/**
 * Get all cookies as an object
 * @returns {Object} - Object with cookie names as keys and values
 */
function getAllCookies() {
  const cookies = {};
  
  if (!document.cookie) {
    return cookies;
  }
  
  document.cookie.split(';').forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    try {
      cookies[decodeURIComponent(name)] = decodeURIComponent(value);
    } catch (e) {
      // If decoding fails, use the raw value
      cookies[name] = value;
    }
  });
  
  return cookies;
}

/**
 * Cookie consent manager
 */
class CookieConsent {
  constructor(options = {}) {
    this.options = {
      cookieName: 'cookie_consent',
      cookieExpiry: 365, // days
      cookiePath: '/',
      cookieDomain: '',
      cookieSameSite: 'Lax', // 'Strict', 'Lax', or 'None'
      cookieSecure: false,
      
      // UI elements
      container: null, // Container element or selector
      acceptButton: null, // Accept button element or selector
      rejectButton: null, // Reject button element or selector
      settingsButton: null, // Settings button element or selector
      settingsPanel: null, // Settings panel element or selector
      saveSettingsButton: null, // Save settings button element or selector
      
      // Cookie categories
      categories: {
        necessary: {
          name: 'Necessary',
          description: 'These cookies are essential for the website to function properly.',
          required: true,
          checked: true,
          disabled: true
        },
        analytics: {
          name: 'Analytics',
          description: 'These cookies help us understand how visitors interact with the website.',
          required: false,
          checked: true,
          disabled: false
        },
        marketing: {
          name: 'Marketing',
          description: 'These cookies are used to track visitors across websites.',
          required: false,
          checked: false,
          disabled: false
        },
        preferences: {
          name: 'Preferences',
          description: 'These cookies allow the website to remember choices you make.',
          required: false,
          checked: true,
          disabled: false
        }
      },
      
      // Callbacks
      onAccept: null,
      onReject: null,
      onSaveSettings: null,
      onInit: null,
      
      // Merge user options
      ...options
    };
    
    // Initialize
    this.initialized = false;
    this.consentGiven = false;
    this.selectedCategories = [];
    
    // Bind methods
    this.init = this.init.bind(this);
    this.showBanner = this.showBanner.bind(this);
    this.hideBanner = this.hideBanner.bind(this);
    this.showSettings = this.showSettings.bind(this);
    this.hideSettings = this.hideSettings.bind(this);
    this.acceptAll = this.acceptAll.bind(this);
    this.rejectAll = this.rejectAll.bind(this);
    this.saveSettings = this.saveSettings.bind(this);
    this.getConsent = this.getConsent.bind(this);
    this.setConsent = this.setConsent.bind(this);
    this.resetConsent = this.resetConsent.bind(this);
  }
  
  /**
   * Initialize the cookie consent manager
   */
  init() {
    if (this.initialized) return;
    
    // Check if consent has already been given
    const consentData = this.getConsent();
    
    if (consentData) {
      this.consentGiven = true;
      this.selectedCategories = consentData.categories || [];
      
      // Call onInit callback
      if (typeof this.options.onInit === 'function') {
        this.options.onInit({
          consentGiven: true,
          categories: this.selectedCategories
        });
      }
      
      return;
    }
    
    // Set up UI elements
    this.setupUI();
    
    // Show the banner
    this.showBanner();
    
    this.initialized = true;
    
    // Call onInit callback
    if (typeof this.options.onInit === 'function') {
      this.options.onInit({
        consentGiven: false,
        categories: []
      });
    }
  }
  
  /**
   * Set up the UI elements
   * @private
   */
  setupUI() {
    // Get container element
    if (typeof this.options.container === 'string') {
      this.container = document.querySelector(this.options.container);
    } else {
      this.container = this.options.container;
    }
    
    if (!this.container) {
      console.error('Cookie consent container not found');
      return;
    }
    
    // Get button elements
    this.acceptButton = this.getElement(this.options.acceptButton, this.container);
    this.rejectButton = this.getElement(this.options.rejectButton, this.container);
    this.settingsButton = this.getElement(this.options.settingsButton, this.container);
    this.settingsPanel = this.getElement(this.options.settingsPanel, this.container);
    this.saveSettingsButton = this.getElement(this.options.saveSettingsButton, this.container);
    
    // Add event listeners
    if (this.acceptButton) {
      this.acceptButton.addEventListener('click', this.acceptAll);
    }
    
    if (this.rejectButton) {
      this.rejectButton.addEventListener('click', this.rejectAll);
    }
    
    if (this.settingsButton) {
      this.settingsButton.addEventListener('click', this.showSettings);
    }
    
    if (this.saveSettingsButton) {
      this.saveSettingsButton.addEventListener('click', this.saveSettings);
    }
    
    // Create category checkboxes if settings panel exists
    if (this.settingsPanel) {
      this.createCategoryCheckboxes();
    }
  }
  
  /**
   * Get an element by selector or return the element if it's already a DOM element
   * @private
   */
  getElement(selector, parent = document) {
    if (!selector) return null;
    
    if (typeof selector === 'string') {
      return parent.querySelector(selector);
    }
    
    if (selector instanceof HTMLElement) {
      return selector;
    }
    
    return null;
  }
  
  /**
   * Create checkboxes for cookie categories in the settings panel
   * @private
   */
  createCategoryCheckboxes() {
    const categoriesContainer = this.settingsPanel.querySelector('.cookie-categories');
    
    if (!categoriesContainer) return;
    
    // Clear existing content
    categoriesContainer.innerHTML = '';
    
    // Create checkboxes for each category
    Object.entries(this.options.categories).forEach(([key, category]) => {
      // Skip if category is required and disabled
      if (category.required && category.disabled) return;
      
      const categoryId = `cookie-category-${key}`;
      
      const categoryElement = document.createElement('div');
      categoryElement.className = 'cookie-category';
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = categoryId;
      checkbox.name = 'cookie-category';
      checkbox.value = key;
      checkbox.checked = category.checked || false;
      checkbox.disabled = category.disabled || false;
      
      const label = document.createElement('label');
      label.htmlFor = categoryId;
      
      const title = document.createElement('span');
      title.className = 'cookie-category-title';
      title.textContent = category.name;
      
      const description = document.createElement('p');
      description.className = 'cookie-category-description';
      description.textContent = category.description;
      
      label.appendChild(title);
      label.appendChild(description);
      
      categoryElement.appendChild(checkbox);
      categoryElement.appendChild(label);
      
      categoriesContainer.appendChild(categoryElement);
    });
  }
  
  /**
   * Show the cookie consent banner
   */
  showBanner() {
    if (this.container) {
      this.container.style.display = 'block';
      this.container.setAttribute('aria-hidden', 'false');
    }
    
    // Hide settings panel if it's visible
    this.hideSettings();
  }
  
  /**
   * Hide the cookie consent banner
   */
  hideBanner() {
    if (this.container) {
      this.container.style.display = 'none';
      this.container.setAttribute('aria-hidden', 'true');
    }
  }
  
  /**
   * Show the cookie settings panel
   */
  showSettings() {
    if (this.settingsPanel) {
      this.settingsPanel.style.display = 'block';
      this.settingsPanel.setAttribute('aria-hidden', 'false');
    }
  }
  
  /**
   * Hide the cookie settings panel
   */
  hideSettings() {
    if (this.settingsPanel) {
      this.settingsPanel.style.display = 'none';
      this.settingsPanel.setAttribute('aria-hidden', 'true');
    }
  }
  
  /**
   * Accept all cookie categories
   */
  acceptAll() {
    const categories = Object.keys(this.options.categories)
      .filter(key => !this.options.categories[key].disabled);
    
    this.setConsent(categories);
    this.hideBanner();
    
    // Call onAccept callback
    if (typeof this.options.onAccept === 'function') {
      this.options.onAccept({
        categories
      });
    }
  }
  
  /**
   * Reject all non-essential cookie categories
   */
  rejectAll() {
    const categories = Object.keys(this.options.categories)
      .filter(key => this.options.categories[key].required);
    
    this.setConsent(categories);
    this.hideBanner();
    
    // Call onReject callback
    if (typeof this.options.onReject === 'function') {
      this.options.onReject({
        categories: []
      });
    }
  }
  
  /**
   * Save the selected cookie settings
   */
  saveSettings() {
    const checkboxes = this.settingsPanel.querySelectorAll('input[name="cookie-category"]:checked');
    const categories = Array.from(checkboxes).map(checkbox => checkbox.value);
    
    // Always include required categories
    Object.entries(this.options.categories).forEach(([key, category]) => {
      if (category.required && !categories.includes(key)) {
        categories.push(key);
      }
    });
    
    this.setConsent(categories);
    this.hideSettings();
    this.hideBanner();
    
    // Call onSaveSettings callback
    if (typeof this.options.onSaveSettings === 'function') {
      this.options.onSaveSettings({
        categories
      });
    }
  }
  
  /**
   * Get the current consent data from the cookie
   * @returns {Object|null} - Consent data or null if not set
   */
  getConsent() {
    const cookieValue = getCookie(this.options.cookieName);
    
    if (!cookieValue) {
      return null;
    }
    
    try {
      return JSON.parse(cookieValue);
    } catch (e) {
      console.error('Error parsing consent cookie:', e);
      return null;
    }
  }
  
  /**
   * Set the consent data in a cookie
   * @param {string[]} categories - Array of accepted category keys
   */
  setConsent(categories) {
    this.consentGiven = true;
    this.selectedCategories = categories;
    
    const consentData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      categories
    };
    
    setCookie(
      this.options.cookieName,
      JSON.stringify(consentData),
      {
        days: this.options.cookieExpiry,
        path: this.options.cookiePath,
        domain: this.options.cookieDomain,
        secure: this.options.cookieSecure,
        sameSite: this.options.cookieSameSite
      }
    );
  }
  
  /**
   * Reset the consent and show the banner again
   */
  resetConsent() {
    removeCookie(this.options.cookieName, {
      path: this.options.cookiePath,
      domain: this.options.cookieDomain
    });
    
    this.consentGiven = false;
    this.selectedCategories = [];
    
    this.showBanner();
  }
  
  /**
   * Check if a specific cookie category is allowed
   * @param {string} category - The category key to check
   * @returns {boolean} - True if the category is allowed
   */
  isAllowed(category) {
    if (!this.consentGiven) {
      return this.options.categories[category]?.required || false;
    }
    
    return this.selectedCategories.includes(category);
  }
}

export {
  setCookie,
  getCookie,
  hasCookie,
  removeCookie,
  getAllCookies,
  CookieConsent
};

export default {
  set: setCookie,
  get: getCookie,
  has: hasCookie,
  remove: removeCookie,
  getAll: getAllCookies,
  CookieConsent
};
