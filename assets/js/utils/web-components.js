/**
 * Web Components Utilities
 * Provides helper functions for working with Web Components
 */

// Check if Web Components are supported
const isSupported = () => {
  return 'customElements' in window && 
         'attachShadow' in Element.prototype &&
         'getRootNode' in Element.prototype &&
         (document.head.createShadowRoot || document.head.attachShadow);
};

/**
 * Define a new custom element
 * @param {string} name - The custom element name (must contain a hyphen)
 * @param {HTMLElement} elementClass - The class that extends HTMLElement
 * @param {Object} options - Custom element definition options
 * @param {boolean} options.extends - The built-in element to extend
 * @returns {boolean} - True if the element was defined successfully
 */
const define = (name, elementClass, options = {}) => {
  if (!name.includes('-')) {
    console.error('Custom element names must contain a hyphen (-)');
    return false;
  }
  
  if (customElements.get(name)) {
    console.warn(`Custom element ${name} is already defined`);
    return false;
  }
  
  try {
    customElements.define(name, elementClass, options);
    return true;
  } catch (error) {
    console.error(`Failed to define custom element ${name}:`, error);
    return false;
  }
};

/**
 * Check if a custom element is defined
 * @param {string} name - The custom element name
 * @returns {boolean} - True if the element is defined
 */
const isDefined = (name) => {
  return customElements.get(name) !== undefined;
};

/**
 * Wait for a custom element to be defined
 * @param {string} name - The custom element name
 * @param {number} timeout - Maximum time to wait in milliseconds
 * @returns {Promise<boolean>} - Resolves to true when defined, or false if timed out
 */
const whenDefined = (name, timeout = 10000) => {
  if (isDefined(name)) {
    return Promise.resolve(true);
  }
  
  return new Promise((resolve) => {
    let timedOut = false;
    let timer = null;
    
    const cleanup = () => {
      if (timer) clearTimeout(timer);
      customElements.removeEventListener('customElements:define', checkElement);
    };
    
    const checkElement = (event) => {
      if (event.detail === name) {
        cleanup();
        resolve(true);
      }
    };
    
    // Listen for the custom element definition
    customElements.addEventListener('customElements:define', checkElement);
    
    // Set up timeout
    if (timeout > 0) {
      timer = setTimeout(() => {
        timedOut = true;
        cleanup();
        resolve(false);
      }, timeout);
    }
    
    // Check again in case the element was defined before we added the listener
    if (isDefined(name)) {
      cleanup();
      resolve(true);
    }
  });
};

/**
 * Create a shadow root with default settings
 * @param {HTMLElement} host - The host element
 * @param {Object} options - Shadow root options
 * @param {string} options.mode - Shadow DOM mode ('open' or 'closed')
 * @param {boolean} options.delegatesFocus - Whether to delegate focus
 * @param {string} options.styles - CSS styles to inject
 * @param {string} options.template - HTML template content
 * @returns {ShadowRoot} - The created shadow root
 */
const createShadowRoot = (host, options = {}) => {
  const {
    mode = 'open',
    delegatesFocus = false,
    styles = '',
    template = ''
  } = options;
  
  // Create shadow root
  const shadowRoot = host.attachShadow({
    mode,
    delegatesFocus
  });
  
  // Add styles if provided
  if (styles) {
    const style = document.createElement('style');
    style.textContent = styles;
    shadowRoot.appendChild(style);
  }
  
  // Add template content if provided
  if (template) {
    const templateEl = document.createElement('template');
    templateEl.innerHTML = template;
    shadowRoot.appendChild(document.importNode(templateEl.content, true));
  }
  
  return shadowRoot;
};

/**
 * Base class for custom elements with common functionality
 */
class BaseElement extends HTMLElement {
  constructor() {
    super();
    this._initialized = false;
    this._disconnected = false;
    this._updating = false;
    this._updateQueued = false;
    this._observers = [];
    this._eventListeners = [];
    this._shadowRoot = null;
    this._styles = '';
    this._template = '';
  }
  
  /**
   * Lifecycle: Called when the element is added to the DOM
   */
  connectedCallback() {
    if (this._initialized) return;
    
    this._disconnected = false;
    this._initialized = true;
    
    // Create shadow DOM
    this._shadowRoot = createShadowRoot(this, {
      mode: this.getAttribute('shadow') === 'closed' ? 'closed' : 'open',
      styles: this._styles,
      template: this._template
    });
    
    // Initialize the component
    this.initialize();
    
    // Observe attributes
    this._observeAttributes();
    
    // Trigger first render
    this.update();
  }
  
  /**
   * Lifecycle: Called when the element is removed from the DOM
   */
  disconnectedCallback() {
    this._disconnected = true;
    this._cleanup();
    this.destroy();
  }
  
  /**
   * Lifecycle: Called when an observed attribute changes
   * @param {string} name - The attribute name
   * @param {string} oldValue - The old attribute value
   * @param {string} newValue - The new attribute value
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    
    // Convert kebab-case to camelCase for property names
    const propName = name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    
    // Convert string values to appropriate types
    let value = newValue;
    if (newValue === 'true') value = true;
    else if (newValue === 'false') value = false;
    else if (newValue === 'null') value = null;
    else if (newValue === 'undefined') value = undefined;
    else if (!isNaN(Number(newValue))) value = Number(newValue);
    
    // Update the property
    this[propName] = value;
    
    // Queue an update
    this.queueUpdate();
  }
  
  /**
   * Initialize the component
   * Override this method in subclasses
   */
  initialize() {}
  
  /**
   * Update the component
   * Override this method in subclasses
   */
  update() {}
  
  /**
   * Clean up resources
   * Override this method in subclasses
   */
  destroy() {}
  
  /**
   * Queue an update (debounced)
   */
  queueUpdate() {
    if (this._updating) {
      this._updateQueued = true;
      return;
    }
    
    this._updating = true;
    
    // Use microtask to batch updates
    Promise.resolve().then(() => {
      if (!this._disconnected) {
        this.update();
      }
      this._updating = false;
      
      if (this._updateQueued) {
        this._updateQueued = false;
        this.queueUpdate();
      }
    });
  }
  
  /**
   * Observe attributes
   * @private
   */
  _observeAttributes() {
    const observed = this.constructor.observedAttributes || [];n    
    // Create a MutationObserver to watch for attribute changes
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes') {
          const name = mutation.attributeName;
          const oldValue = mutation.oldValue;
          const newValue = this.getAttribute(name);
          this.attributeChangedCallback(name, oldValue, newValue);
        }
      }
    });
    
    // Start observing
    observer.observe(this, {
      attributes: true,
      attributeOldValue: true,
      attributeFilter: observed
    });
    
    this._observers.push(observer);
  }
  
  /**
   * Add an event listener and track it for cleanup
   * @param {EventTarget} target - The target to add the listener to
   * @param {string} type - The event type
   * @param {Function} listener - The event listener
   * @param {Object} options - Event listener options
   */
  addAutoEventListener(target, type, listener, options) {
    target.addEventListener(type, listener, options);
    this._eventListeners.push({ target, type, listener, options });
  }
  
  /**
   * Clean up resources
   * @private
   */
  _cleanup() {
    // Disconnect observers
    for (const observer of this._observers) {
      observer.disconnect();
    }
    this._observers = [];
    
    // Remove event listeners
    for (const { target, type, listener, options } of this._eventListeners) {
      target.removeEventListener(type, listener, options);
    }
    this._eventListeners = [];
  }
  
  /**
   * Dispatch a custom event
   * @param {string} name - The event name
   * @param {Object} detail - The event detail
   * @param {Object} options - Event options
   * @returns {boolean} - True if the event was not cancelled
   */
  dispatch(name, detail = {}, options = {}) {
    const event = new CustomEvent(name, {
      bubbles: options.bubbles !== false,
      cancelable: options.cancelable !== false,
      composed: options.composed !== false,
      detail
    });
    
    return this.dispatchEvent(event);
  }
}

// Export the utilities
export {
  isSupported,
  define,
  isDefined,
  whenDefined,
  createShadowRoot,
  BaseElement
};

export default {
  isSupported,
  define,
  isDefined,
  whenDefined,
  createShadowRoot,
  BaseElement
};
