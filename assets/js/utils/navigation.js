/**
 * Navigation Utilities
 * Provides helper functions for browser history and navigation
 */

/**
 * Navigate to a URL
 * @param {string} url - The URL to navigate to
 * @param {Object} options - Navigation options
 * @param {boolean} options.replace - If true, replace the current history entry
 * @param {Object} options.state - State object to associate with the history entry
 * @param {string} options.title - Title for the history entry
 */
function navigateTo(url, { replace = false, state = null, title = '' } = {}) {
  if (replace) {
    window.history.replaceState(state, title, url);
  } else {
    window.history.pushState(state, title, url);
  }
  
  // Dispatch a custom event for navigation
  const event = new CustomEvent('navigation', {
    detail: { url, state, replace }
  });
  window.dispatchEvent(event);
}

/**
 * Reload the current page
 * @param {boolean} force - If true, bypass the cache
 */
function reload(force = false) {
  if (force) {
    window.location.href = window.location.href;
  } else {
    window.location.reload();
  }
}

/**
 * Go back in history
 * @param {number} delta - Number of entries to go back (default: 1)
 */
function goBack(delta = 1) {
  window.history.go(-delta);
}

/**
 * Go forward in history
 * @param {number} delta - Number of entries to go forward (default: 1)
 */
function goForward(delta = 1) {
  window.history.go(delta);
}

/**
 * Get the current URL path
 * @returns {string} - The current path
 */
function getCurrentPath() {
  return window.location.pathname;
}

/**
 * Get the current URL search parameters
 * @returns {URLSearchParams} - The URL search parameters
 */
function getSearchParams() {
  return new URLSearchParams(window.location.search);
}

/**
 * Get a URL parameter by name
 * @param {string} name - The parameter name
 * @returns {string|null} - The parameter value or null if not found
 */
function getUrlParam(name) {
  const params = getSearchParams();
  return params.get(name);
}

/**
 * Get all URL parameters as an object
 * @returns {Object} - Object with parameter names as keys and values
 */
function getAllUrlParams() {
  const params = getSearchParams();
  const result = {};
  
  for (const [key, value] of params.entries()) {
    result[key] = value;
  }
  
  return result;
}

/**
 * Update URL parameters without reloading the page
 * @param {Object} params - Object with parameters to update
 * @param {boolean} replace - If true, replace the current history entry
 */
function updateUrlParams(params, replace = false) {
  const url = new URL(window.location);
  const searchParams = new URLSearchParams(url.search);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      searchParams.delete(key);
    } else {
      searchParams.set(key, value);
    }
  });
  
  url.search = searchParams.toString();
  navigateTo(url.toString(), { replace });
}

/**
 * Remove URL parameters
 * @param {string|string[]} paramNames - Parameter name or array of names to remove
 * @param {boolean} replace - If true, replace the current history entry
 */
function removeUrlParams(paramNames, replace = false) {
  const params = Array.isArray(paramNames) ? paramNames : [paramNames];
  const updates = {};
  
  params.forEach(param => {
    updates[param] = null;
  });
  
  updateUrlParams(updates, replace);
}

/**
 * Scroll to an element on the page
 * @param {string|HTMLElement} target - The target element or selector
 * @param {Object} options - Scroll options
 * @param {number} options.offset - Scroll offset in pixels
 * @param {string} options.behavior - Scroll behavior ('auto' or 'smooth')
 * @param {string} options.block - Vertical alignment ('start', 'center', 'end', 'nearest')
 * @param {string} options.inline - Horizontal alignment ('start', 'center', 'end', 'nearest')
 */
function scrollToElement(
  target,
  {
    offset = 0,
    behavior = 'smooth',
    block = 'start',
    inline = 'nearest'
  } = {}
) {
  const element = typeof target === 'string' ? document.querySelector(target) : target;
  
  if (!element) {
    console.warn(`Element not found: ${target}`);
    return;
  }
  
  const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
  const offsetPosition = elementPosition - offset;
  
  window.scrollTo({
    top: offsetPosition,
    behavior
  });
  
  // For browsers that don't support scroll options
  if (typeof window.scrollTo !== 'function' || !('scrollBehavior' in document.documentElement.style)) {
    element.scrollIntoView({
      block,
      inline,
      behavior
    });
  }
}

/**
 * Scroll to the top of the page
 * @param {Object} options - Scroll options
 * @param {string} options.behavior - Scroll behavior ('auto' or 'smooth')
 */
function scrollToTop({ behavior = 'smooth' } = {}) {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior
  });
}

/**
 * Scroll to the bottom of an element
 * @param {string|HTMLElement} target - The target element or selector
 * @param {Object} options - Scroll options
 * @param {string} options.behavior - Scroll behavior ('auto' or 'smooth')
 */
function scrollToBottom(target, { behavior = 'smooth' } = {}) {
  const element = typeof target === 'string' ? document.querySelector(target) : target;
  
  if (!element) {
    console.warn(`Element not found: ${target}`);
    return;
  }
  
  element.scrollTo({
    top: element.scrollHeight,
    behavior
  });
}

/**
 * Check if the current URL matches a pattern
 * @param {string|RegExp} pattern - The pattern to match against
 * @returns {boolean} - True if the URL matches the pattern
 */
function isCurrentUrl(pattern) {
  const url = window.location.href;
  
  if (pattern instanceof RegExp) {
    return pattern.test(url);
  }
  
  if (typeof pattern === 'string') {
    // Convert string pattern to a regex that matches anywhere in the URL
    const regex = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    return regex.test(url);
  }
  
  return false;
}

/**
 * Add a click handler for links that should be handled with the router
 * @param {string} selector - Selector for links to handle
 * @param {Function} handler - Handler function
 * @returns {Function} - Function to remove the event listener
 */
function handleLinkClicks(selector, handler) {
  const handleClick = (event) => {
    const link = event.target.closest(selector);
    
    if (link && link.href) {
      event.preventDefault();
      
      // Get the link's href and handle it
      const url = new URL(link.href);
      
      // Only handle same-origin URLs
      if (url.origin === window.location.origin) {
        handler({
          url: url.toString(),
          path: url.pathname,
          search: url.search,
          hash: url.hash,
          event
        });
      } else {
        // For external links, open in a new tab
        window.open(url, '_blank');
      }
    }
  };
  
  document.addEventListener('click', handleClick);
  
  // Return cleanup function
  return () => {
    document.removeEventListener('click', handleClick);
  };
}

export {
  navigateTo,
  reload,
  goBack,
  goForward,
  getCurrentPath,
  getSearchParams,
  getUrlParam,
  getAllUrlParams,
  updateUrlParams,
  removeUrlParams,
  scrollToElement,
  scrollToTop,
  scrollToBottom,
  isCurrentUrl,
  handleLinkClicks
};

export default {
  navigateTo,
  reload,
  goBack,
  goForward,
  getCurrentPath,
  getSearchParams,
  getUrlParam,
  getAllUrlParams,
  updateUrlParams,
  removeUrlParams,
  scrollToElement,
  scrollToTop,
  scrollToBottom,
  isCurrentUrl,
  handleLinkClicks
};
