/**
 * Animation Utilities
 * Provides helper functions for common animations and transitions
 */

/**
 * Fade in an element
 * @param {HTMLElement} element - The element to fade in
 * @param {number} duration - Animation duration in milliseconds
 * @param {Function} callback - Optional callback when animation completes
 */
export function fadeIn(element, duration = 300, callback) {
  if (!element) return;
  
  element.style.opacity = '0';
  element.style.display = 'block';
  element.style.transition = `opacity ${duration}ms ease`;
  
  // Trigger reflow
  void element.offsetHeight;
  
  element.style.opacity = '1';
  
  if (callback) {
    setTimeout(callback, duration);
  }
}

/**
 * Fade out an element
 * @param {HTMLElement} element - The element to fade out
 * @param {number} duration - Animation duration in milliseconds
 * @param {Function} callback - Optional callback when animation completes
 */
export function fadeOut(element, duration = 300, callback) {
  if (!element) return;
  
  element.style.transition = `opacity ${duration}ms ease`;
  element.style.opacity = '0';
  
  setTimeout(() => {
    element.style.display = 'none';
    if (callback) callback();
  }, duration);
}

/**
 * Toggle fade on an element
 * @param {HTMLElement} element - The element to toggle
 * @param {number} duration - Animation duration in milliseconds
 * @param {Function} callback - Optional callback when animation completes
 */
export function fadeToggle(element, duration = 300, callback) {
  if (!element) return;
  
  if (window.getComputedStyle(element).display === 'none') {
    fadeIn(element, duration, callback);
  } else {
    fadeOut(element, duration, callback);
  }
}

/**
 * Slide down an element
 * @param {HTMLElement} element - The element to slide down
 * @param {number} duration - Animation duration in milliseconds
 * @param {Function} callback - Optional callback when animation completes
 */
export function slideDown(element, duration = 300, callback) {
  if (!element) return;
  
  element.style.overflow = 'hidden';
  element.style.display = 'block';
  
  const height = element.offsetHeight;
  element.style.height = '0';
  
  // Trigger reflow
  void element.offsetHeight;
  
  element.style.transition = `height ${duration}ms ease`;
  element.style.height = `${height}px`;
  
  if (callback) {
    setTimeout(callback, duration);
  }
}

/**
 * Slide up an element
 * @param {HTMLElement} element - The element to slide up
 * @param {number} duration - Animation duration in milliseconds
 * @param {Function} callback - Optional callback when animation completes
 */
export function slideUp(element, duration = 300, callback) {
  if (!element) return;
  
  element.style.overflow = 'hidden';
  element.style.height = `${element.offsetHeight}px`;
  
  // Trigger reflow
  void element.offsetHeight;
  
  element.style.transition = `height ${duration}ms ease`;
  element.style.height = '0';
  
  setTimeout(() => {
    element.style.display = 'none';
    element.style.height = '';
    element.style.overflow = '';
    if (callback) callback();
  }, duration);
}

/**
 * Toggle slide on an element
 * @param {HTMLElement} element - The element to toggle
 * @param {number} duration - Animation duration in milliseconds
 * @param {Function} callback - Optional callback when animation completes
 */
export function slideToggle(element, duration = 300, callback) {
  if (!element) return;
  
  if (window.getComputedStyle(element).display === 'none') {
    slideDown(element, duration, callback);
  } else {
    slideUp(element, duration, callback);
  }
}

/**
 * Animate an element's properties
 * @param {HTMLElement} element - The element to animate
 * @param {Object} properties - CSS properties to animate
 * @param {number} duration - Animation duration in milliseconds
 * @param {string} easing - CSS easing function
 * @param {Function} callback - Optional callback when animation completes
 */
export function animate(element, properties, duration = 300, easing = 'ease', callback) {
  if (!element) return;
  
  element.style.transition = `all ${duration}ms ${easing}`;
  
  // Apply properties
  Object.entries(properties).forEach(([property, value]) => {
    element.style[property] = value;
  });
  
  if (callback) {
    setTimeout(callback, duration);
  }
}

/**
 * Add a CSS class with animation end detection
 * @param {HTMLElement} element - The element to add class to
 * @param {string} className - The class name to add
 * @param {Function} callback - Optional callback when animation ends
 */
export function addClassWithAnimation(element, className, callback) {
  if (!element) return;
  
  const handleAnimationEnd = () => {
    element.removeEventListener('animationend', handleAnimationEnd);
    if (callback) callback();
  };
  
  element.addEventListener('animationend', handleAnimationEnd);
  element.classList.add(className);
}

/**
 * Remove a CSS class with animation end detection
 * @param {HTMLElement} element - The element to remove class from
 * @param {string} className - The class name to remove
 * @param {Function} callback - Optional callback when animation ends
 */
export function removeClassWithAnimation(element, className, callback) {
  if (!element) return;
  
  const handleAnimationEnd = () => {
    element.removeEventListener('animationend', handleAnimationEnd);
    if (callback) callback();
  };
  
  element.addEventListener('animationend', handleAnimationEnd);
  element.classList.remove(className);
}

/**
 * Toggle a CSS class with animation end detection
 * @param {HTMLElement} element - The element to toggle class on
 * @param {string} className - The class name to toggle
 * @param {Function} callback - Optional callback when animation ends
 */
export function toggleClassWithAnimation(element, className, callback) {
  if (!element) return;
  
  const handleAnimationEnd = () => {
    element.removeEventListener('animationend', handleAnimationEnd);
    if (callback) callback();
  };
  
  element.addEventListener('animationend', handleAnimationEnd);
  element.classList.toggle(className);
}

/**
 * Create a simple scroll-to-top button
 * @param {Object} options - Configuration options
 * @param {number} options.offset - Scroll offset from top to show button
 * @param {number} options.duration - Scroll duration in milliseconds
 * @param {string} options.buttonClass - CSS class for the button
 * @param {string} options.icon - HTML for the button icon
 * @returns {HTMLElement} - The created button element
 */
export function createScrollToTopButton({
  offset = 300,
  duration = 500,
  buttonClass = 'scroll-to-top',
  icon = '↑'
} = {}) {
  const button = document.createElement('button');
  button.className = buttonClass;
  button.innerHTML = icon;
  button.setAttribute('aria-label', 'Scroll to top');
  button.style.display = 'none';
  
  document.body.appendChild(button);
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  const toggleButton = () => {
    if (window.pageYOffset > offset) {
      button.style.display = 'block';
      fadeIn(button, 200);
    } else {
      fadeOut(button, 200, () => {
        button.style.display = 'none';
      });
    }
  };
  
  button.addEventListener('click', scrollToTop);
  window.addEventListener('scroll', toggleButton);
  
  // Initial check
  toggleButton();
  
  return button;
}

export default {
  fadeIn,
  fadeOut,
  fadeToggle,
  slideDown,
  slideUp,
  slideToggle,
  animate,
  addClassWithAnimation,
  removeClassWithAnimation,
  toggleClassWithAnimation,
  createScrollToTopButton
};
