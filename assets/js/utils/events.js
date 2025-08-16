/**
 * Event handling utilities
 * Provides a simple event emitter pattern implementation
 */

export class EventEmitter {
  constructor() {
    this.events = {};
  }

  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {Function} listener - Callback function
   * @returns {Function} Unsubscribe function
   */
  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
    return () => this.off(event, listener);
  }

  /**
   * Unsubscribe from an event
   * @param {string} event - Event name
   * @param {Function} listener - Callback function to remove
   */
  off(event, listener) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(l => l !== listener);
  }

  /**
   * Emit an event with data
   * @param {string} event - Event name
   * @param  {...any} args - Arguments to pass to listeners
   */
  emit(event, ...args) {
    if (!this.events[event]) return;
    this.events[event].forEach(listener => {
      try {
        listener(...args);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }

  /**
   * Subscribe to an event that only fires once
   * @param {string} event - Event name
   * @param {Function} listener - Callback function
   */
  once(event, listener) {
    const onceWrapper = (...args) => {
      this.off(event, onceWrapper);
      listener(...args);
    };
    this.on(event, onceWrapper);
  }
}

// Create a default event emitter instance
export const events = new EventEmitter();

// Export utility functions
export const on = (event, listener) => events.on(event, listener);
export const off = (event, listener) => events.off(event, listener);
export const emit = (event, ...args) => events.emit(event, ...args);
export const once = (event, listener) => events.once(event, listener);

// Add to window for debugging in development
const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
if (isDev) {
  window.EventEmitter = EventEmitter;
  window.events = events;
}
