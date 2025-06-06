/**
 * History Manager
 * A utility for managing browser history with enhanced features
 */

import { debounce, throttle } from './helpers.js';
import { storage } from './storage.js';
import CONFIG from '../config.js';

// Default options
const DEFAULT_OPTIONS = {
  // Storage options
  persistStates: true,         // Whether to persist states in storage
  storageKey: 'history_states', // Key for storing states in storage
  maxStates: 50,               // Maximum number of states to keep in storage
  
  // Scroll restoration
  restoreScroll: true,         // Whether to restore scroll position
  scrollKey: '_scroll',         // Key for storing scroll position in state
  
  // Event handling
  debounceWait: 100,           // Debounce wait time for popstate events
  throttleWait: 100,           // Throttle wait time for scroll events
  
  // Callbacks
  onStateChange: null,         // Callback when state changes
  onStateAdd: null,            // Callback when a new state is added
  onStateRemove: null,         // Callback when a state is removed
  onStateReplace: null,        // Callback when a state is replaced
  onScrollRestore: null,       // Callback when scroll position is restored
  
  // Debugging
  debug: false                 // Enable debug logging
};

/**
 * History Manager class
 */
class HistoryManager {
  /**
   * Create a new HistoryManager instance
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    // Merge options with defaults
    this.options = { ...DEFAULT_OPTIONS, ...options };
    
    // State tracking
    this.states = [];
    this.currentIndex = -1;
    this.initialState = null;
    this.initialized = false;
    this.scrollPositions = new Map();
    this.listeners = new Map();
    
    // Bind methods
    this.pushState = this.pushState.bind(this);
    this.replaceState = this.replaceState.bind(this);
    this.go = this.go.bind(this);
    this.back = this.back.bind(this);
    this.forward = this.forward.bind(this);
    this._handlePopState = this._handlePopState.bind(this);
    this._handleBeforeUnload = this._handleBeforeUnload.bind(this);
    this._handleScroll = throttle(this._handleScroll.bind(this), this.options.throttleWait);
    
    // Initialize
    this._init();
  }
  
  /**
   * Initialize the history manager
   * @private
   */
  _init() {
    if (this.initialized) return;
    
    // Load saved states from storage
    if (this.options.persistStates) {
      this._loadStates();
    }
    
    // Save the initial state
    this.initialState = {
      url: window.location.href,
      state: { ...window.history.state },
      timestamp: Date.now()
    };
    
    // Add event listeners
    window.addEventListener('popstate', this._handlePopState);
    
    if (this.options.restoreScroll) {
      window.addEventListener('scroll', this._handleScroll, { passive: true });
      window.addEventListener('beforeunload', this._handleBeforeUnload);
    }
    
    this.initialized = true;
    this._log('History Manager initialized');
  }
  
  /**
   * Load states from storage
   * @private
   */
  _loadStates() {
    try {
      const saved = storage.localStorage.get(this.options.storageKey, []);
      if (Array.isArray(saved) && saved.length > 0) {
        this.states = saved;
        this.currentIndex = this.states.length - 1;
        this._log(`Loaded ${saved.length} states from storage`);
      }
    } catch (error) {
      console.error('Failed to load history states:', error);
    }
  }
  
  /**
   * Save states to storage
   * @private
   */
  _saveStates() {
    if (!this.options.persistStates) return;
    
    try {
      // Limit the number of states to save
      const statesToSave = this.states.slice(-this.options.maxStates);
      storage.localStorage.set(this.options.storageKey, statesToSave);
    } catch (error) {
      console.error('Failed to save history states:', error);
    }
  }
  
  /**
   * Handle popstate events
   * @private
   */
  _handlePopState(event) {
    this._log('Popstate event:', event.state);
    
    const previousState = this.states[this.currentIndex] || null;
    
    // Update current index based on the state
    if (event.state && event.state._historyId) {
      const index = this.states.findIndex(s => s.id === event.state._historyId);
      if (index !== -1) {
        this.currentIndex = index;
      }
    }
    
    const currentState = this.states[this.currentIndex] || null;
    
    // Restore scroll position if needed
    if (this.options.restoreScroll && currentState) {
      this._restoreScrollPosition(currentState);
    }
    
    // Call the state change callback
    if (typeof this.options.onStateChange === 'function') {
      this.options.onStateChange({
        currentState,
        previousState,
        event
      });
    }
    
    // Trigger event listeners
    this._emit('stateChange', { currentState, previousState, event });
  }
  
  /**
   * Handle scroll events
   * @private
   */
  _handleScroll() {
    if (this.currentIndex === -1 || !this.states[this.currentIndex]) return;
    
    const scrollPosition = {
      x: window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0,
      y: window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
    };
    
    // Update the current state with scroll position
    this.states[this.currentIndex].scroll = scrollPosition;
    
    // Update the scroll positions map
    const url = window.location.href.split('?')[0]; // Remove query string
    this.scrollPositions.set(url, scrollPosition);
    
    // Save states if persistence is enabled
    if (this.options.persistStates) {
      this._saveStates();
    }
  }
  
  /**
   * Handle beforeunload event
   * @private
   */
  _handleBeforeUnload() {
    // Save the current scroll position before unloading
    this._handleScroll();
  }
  
  /**
   * Restore scroll position for a state
   * @private
   */
  _restoreScrollPosition(state) {
    if (!state || !this.options.restoreScroll) return;
    
    const scrollPosition = state.scroll || { x: 0, y: 0 };
    
    // Use requestAnimationFrame for smoother scrolling
    requestAnimationFrame(() => {
      window.scrollTo(scrollPosition.x, scrollPosition.y);
      
      if (typeof this.options.onScrollRestore === 'function') {
        this.options.onScrollRestore(scrollPosition, state);
      }
      
      this._emit('scrollRestore', { scrollPosition, state });
    });
  }
  
  /**
   * Generate a unique ID for a state
   * @private
   */
  _generateStateId() {
    return `state_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Log debug messages
   * @private
   */
  _log(...args) {
    if (this.options.debug) {
      console.log('[HistoryManager]', ...args);
    }
  }
  
  /**
   * Add a state to the history
   * @param {Object} state - The state object to store
   * @param {string} title - The title of the state (ignored by most browsers)
   * @param {string} url - The URL to associate with the state
   * @returns {Object} The added state
   */
  pushState(state = {}, title = '', url = null) {
    const id = this._generateStateId();
    const timestamp = Date.now();
    
    // Create the history state with our metadata
    const historyState = {
      ...state,
      _historyId: id,
      _timestamp: timestamp
    };
    
    // Add to browser history
    window.history.pushState(historyState, title, url);
    
    // Create our enhanced state object
    const enhancedState = {
      id,
      url: url || window.location.href,
      state: { ...state },
      timestamp,
      title: title || document.title
    };
    
    // Add to our states array
    this.states.push(enhancedState);
    this.currentIndex = this.states.length - 1;
    
    // Save states if persistence is enabled
    if (this.options.persistStates) {
      this._saveStates();
    }
    
    this._log('Pushed state:', enhancedState);
    
    // Call the state add callback
    if (typeof this.options.onStateAdd === 'function') {
      this.options.onStateAdd(enhancedState);
    }
    
    // Trigger event listeners
    this._emit('stateAdd', enhancedState);
    
    return enhancedState;
  }
  
  /**
   * Replace the current state in the history
   * @param {Object} state - The state object to store
   * @param {string} title - The title of the state (ignored by most browsers)
   * @param {string} url - The URL to associate with the state
   * @returns {Object} The replaced state
   */
  replaceState(state = {}, title = '', url = null) {
    if (this.currentIndex === -1) {
      return this.pushState(state, title, url);
    }
    
    const id = this.states[this.currentIndex].id;
    const timestamp = Date.now();
    
    // Create the history state with our metadata
    const historyState = {
      ...state,
      _historyId: id,
      _timestamp: timestamp
    };
    
    // Replace in browser history
    window.history.replaceState(historyState, title, url);
    
    // Create our enhanced state object
    const enhancedState = {
      id,
      url: url || window.location.href,
      state: { ...state },
      timestamp,
      title: title || document.title
    };
    
    // Replace in our states array
    this.states[this.currentIndex] = enhancedState;
    
    // Save states if persistence is enabled
    if (this.options.persistStates) {
      this._saveStates();
    }
    
    this._log('Replaced state:', enhancedState);
    
    // Call the state replace callback
    if (typeof this.options.onStateReplace === 'function') {
      this.options.onStateReplace(enhancedState);
    }
    
    // Trigger event listeners
    this._emit('stateReplace', enhancedState);
    
    return enhancedState;
  }
  
  /**
   * Navigate through the history
   * @param {number} delta - The number of steps to move in the history
   */
  go(delta) {
    window.history.go(delta);
  }
  
  /**
   * Go back one step in the history
   */
  back() {
    this.go(-1);
  }
  
  /**
   * Go forward one step in the history
   */
  forward() {
    this.go(1);
  }
  
  /**
   * Get the current state
   * @returns {Object|null} The current state or null if none exists
   */
  getCurrentState() {
    return this.states[this.currentIndex] || null;
  }
  
  /**
   * Get all states
   * @returns {Array} An array of all states
   */
  getAllStates() {
    return [...this.states];
  }
  
  /**
   * Clear all states
   */
  clearStates() {
    this.states = [];
    this.currentIndex = -1;
    
    if (this.options.persistStates) {
      storage.localStorage.remove(this.options.storageKey);
    }
    
    this._log('Cleared all states');
  }
  
  /**
   * Add an event listener
   * @param {string} event - The event name
   * @param {Function} callback - The callback function
   * @returns {Function} A function to remove the event listener
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    this.listeners.get(event).add(callback);
    
    // Return a function to remove the listener
    return () => {
      if (this.listeners.has(event)) {
        this.listeners.get(event).delete(callback);
      }
    };
  }
  
  /**
   * Remove an event listener
   * @param {string} event - The event name
   * @param {Function} callback - The callback function to remove
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }
  
  /**
   * Emit an event
   * @private
   */
  _emit(event, data) {
    if (this.listeners.has(event)) {
      for (const callback of this.listeners.get(event)) {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} handler:`, error);
        }
      }
    }
  }
  
  /**
   * Destroy the history manager and clean up event listeners
   */
  destroy() {
    window.removeEventListener('popstate', this._handlePopState);
    
    if (this.options.restoreScroll) {
      window.removeEventListener('scroll', this._handleScroll);
      window.removeEventListener('beforeunload', this._handleBeforeUnload);
    }
    
    this.listeners.clear();
    this.initialized = false;
    
    this._log('History Manager destroyed');
  }
}

// Create a default instance
export const historyManager = new HistoryManager({
  debug: process.env.NODE_ENV !== 'production'
});

export default HistoryManager;
