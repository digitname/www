/**
 * Responsive Utilities
 * Provides helper functions for responsive design and viewport management
 */

// Viewport breakpoints (match your CSS breakpoints)
const BREAKPOINTS = {
  xs: 0,      // Extra small devices (portrait phones)
  sm: 576,   // Small devices (landscape phones)
  md: 768,   // Medium devices (tablets)
  lg: 992,   // Large devices (desktops)
  xl: 1200,  // Extra large devices (large desktops)
  xxl: 1400  // Extra extra large devices
};

// Device type detection
const DEVICE_TYPES = {
  MOBILE: 'mobile',
  TABLET: 'tablet',
  DESKTOP: 'desktop'
};

/**
 * Get current viewport width
 * @returns {number} - Viewport width in pixels
 */
export function getViewportWidth() {
  return Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
}

/**
 * Get current viewport height
 * @returns {number} - Viewport height in pixels
 */
export function getViewportHeight() {
  return Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
}

/**
 * Check if viewport matches a breakpoint
 * @param {string} breakpoint - Breakpoint name (e.g., 'sm', 'md', 'lg')
 * @returns {boolean} - True if viewport matches or is larger than breakpoint
 */
export function isBreakpoint(breakpoint) {
  const bp = BREAKPOINTS[breakpoint];
  return bp !== undefined && getViewportWidth() >= bp;
}

/**
 * Get current breakpoint name
 * @returns {string} - Current breakpoint name
 */
export function getCurrentBreakpoint() {
  return Object.entries(BREAKPOINTS)
    .sort((a, b) => b[1] - a[1])
    .find(([_, width]) => getViewportWidth() >= width)[0];
}

/**
 * Detect device type based on viewport width
 * @returns {string} - Device type (mobile, tablet, desktop)
 */
export function getDeviceType() {
  const width = getViewportWidth();
  
  if (width < BREAKPOINTS.sm) return DEVICE_TYPES.MOBILE;
  if (width < BREAKPOINTS.lg) return DEVICE_TYPES.TABLET;
  return DEVICE_TYPES.DESKTOP;
}

/**
 * Check if device is mobile
 * @returns {boolean} - True if device is mobile
 */
export function isMobile() {
  return getDeviceType() === DEVICE_TYPES.MOBILE;
}

/**
 * Check if device is tablet
 * @returns {boolean} - True if device is tablet
 */
export function isTablet() {
  return getDeviceType() === DEVICE_TYPES.TABLET;
}

/**
 * Check if device is desktop
 * @returns {boolean} - True if device is desktop
 */
export function isDesktop() {
  return getDeviceType() === DEVICE_TYPES.DESKTOP;
}

/**
 * Check if device has touch support
 * @returns {boolean} - True if device supports touch
 */
export function isTouchDevice() {
  return 'ontouchstart' in window || 
         (window.DocumentTouch && document instanceof window.DocumentTouch) || 
         navigator.maxTouchPoints > 0 || 
         window.navigator.msMaxTouchPoints > 0;
}

/**
 * Check if device is in portrait orientation
 * @returns {boolean} - True if device is in portrait mode
 */
export function isPortrait() {
  return window.matchMedia('(orientation: portrait)').matches;
}

/**
 * Check if device is in landscape orientation
 * @returns {boolean} - True if device is in landscape mode
 */
export function isLandscape() {
  return window.matchMedia('(orientation: landscape)').matches;
}

/**
 * Add a viewport change listener
 * @param {Function} callback - Function to call on viewport change
 * @param {number} throttleTime - Throttle time in milliseconds
 * @returns {Function} - Function to remove the event listener
 */
export function onViewportChange(callback, throttleTime = 100) {
  let timeoutId;
  let lastWidth = getViewportWidth();
  
  const handleResize = () => {
    const currentWidth = getViewportWidth();
    
    if (currentWidth !== lastWidth) {
      lastWidth = currentWidth;
      callback({
        width: currentWidth,
        height: getViewportHeight(),
        breakpoint: getCurrentBreakpoint(),
        deviceType: getDeviceType(),
        isPortrait: isPortrait(),
        isLandscape: isLandscape()
      });
    }
  };
  
  const throttledHandler = () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(handleResize, throttleTime);
  };
  
  window.addEventListener('resize', throttledHandler, { passive: true });
  
  // Return cleanup function
  return () => {
    window.removeEventListener('resize', throttledHandler);
    clearTimeout(timeoutId);
  };
}

/**
 * Get the current scroll position
 * @returns {{x: number, y: number}} - Scroll position object
 */
export function getScrollPosition() {
  return {
    x: window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0,
    y: window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
  };
}

/**
 * Check if an element is in the viewport
 * @param {HTMLElement} element - The element to check
 * @param {number} offset - Offset in pixels
 * @returns {boolean} - True if element is in viewport
 */
export function isElementInViewport(element, offset = 0) {
  if (!element) return false;
  
  const rect = element.getBoundingClientRect();
  const viewportHeight = getViewportHeight();
  const viewportWidth = getViewportWidth();
  
  return (
    rect.top >= -offset && 
    rect.left >= -offset && 
    rect.bottom <= (viewportHeight + offset) && 
    rect.right <= (viewportWidth + offset)
  );
}

/**
 * Add a scroll listener that fires when an element enters the viewport
 * @param {HTMLElement} element - The element to observe
 * @param {Function} callback - Function to call when element enters viewport
 * @param {Object} options - Options object
 * @param {number} options.offset - Offset in pixels
 * @param {boolean} options.once - If true, callback will be called only once
 * @returns {Function} - Function to remove the event listener
 */
export function onElementInViewport(element, callback, { offset = 0, once = true } = {}) {
  if (!element) return () => {};
  
  let hasFired = false;
  
  const checkViewport = () => {
    if (hasFired && once) return;
    
    if (isElementInViewport(element, offset)) {
      callback(element);
      
      if (once) {
        hasFired = true;
        window.removeEventListener('scroll', checkViewport, { passive: true });
      }
    }
  };
  
  // Initial check
  checkViewport();
  
  // Add scroll listener
  window.addEventListener('scroll', checkViewport, { passive: true });
  
  // Return cleanup function
  return () => {
    window.removeEventListener('scroll', checkViewport, { passive: true });
  };
}

/**
 * Enable smooth scrolling for anchor links
 * @param {string} selector - Selector for anchor links (default: 'a[href^="#"]')
 * @param {Object} options - Options object
 * @param {number} options.offset - Scroll offset in pixels
 * @param {number} options.duration - Scroll duration in milliseconds
 */
export function enableSmoothScrolling(selector = 'a[href^="#"]', { offset = 0, duration = 500 } = {}) {
  document.querySelectorAll(selector).forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      
      // Skip if it's not an anchor link
      if (href === '#' || !href.startsWith('#')) return;
      
      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        e.preventDefault();
        
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;
        
        function animation(currentTime) {
          if (!startTime) startTime = currentTime;
          const timeElapsed = currentTime - startTime;
          const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
          window.scrollTo(0, run);
          
          if (timeElapsed < duration) {
            requestAnimationFrame(animation);
          } else {
            window.scrollTo(0, targetPosition);
          }
        }
        
        // Easing function
        function easeInOutQuad(t, b, c, d) {
          t /= d / 2;
          if (t < 1) return c / 2 * t * t + b;
          t--;
          return -c / 2 * (t * (t - 2) - 1) + b;
        }
        
        requestAnimationFrame(animation);
      }
    });
  });
}

export default {
  BREAKPOINTS,
  DEVICE_TYPES,
  getViewportWidth,
  getViewportHeight,
  isBreakpoint,
  getCurrentBreakpoint,
  getDeviceType,
  isMobile,
  isTablet,
  isDesktop,
  isTouchDevice,
  isPortrait,
  isLandscape,
  onViewportChange,
  getScrollPosition,
  isElementInViewport,
  onElementInViewport,
  enableSmoothScrolling
};
