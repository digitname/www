/**
 * Storage Utility
 * Provides a unified interface for localStorage and sessionStorage with additional features
 */

const PREFIX = 'digitname_';

class Storage {
  /**
   * Create a new Storage instance
   * @param {Storage} storage - The storage implementation (localStorage or sessionStorage)
   */
  constructor(storage = window.localStorage) {
    this.storage = storage;
  }

  /**
   * Get a namespaced key
   * @private
   */
  _getKey(key) {
    return `${PREFIX}${key}`;
  }

  /**
   * Set an item in storage
   * @param {string} key - The key to set
   * @param {*} value - The value to store (will be JSON stringified)
   * @returns {boolean} - True if successful
   */
  set(key, value) {
    try {
      const stringValue = JSON.stringify({
        value,
        timestamp: Date.now()
      });
      this.storage.setItem(this._getKey(key), stringValue);
      return true;
    } catch (error) {
      console.error('Storage set error:', error);
      return false;
    }
  }

  /**
   * Get an item from storage
   * @param {string} key - The key to get
   * @param {*} defaultValue - Default value if key doesn't exist
   * @returns {*|null} - The stored value or null if not found
   */
  get(key, defaultValue = null) {
    try {
      const item = this.storage.getItem(this._getKey(key));
      if (!item) return defaultValue;

      const { value } = JSON.parse(item);
      return value !== undefined ? value : defaultValue;
    } catch (error) {
      console.error('Storage get error:', error);
      return defaultValue;
    }
  }

  /**
   * Remove an item from storage
   * @param {string} key - The key to remove
   * @returns {boolean} - True if successful
   */
  remove(key) {
    try {
      this.storage.removeItem(this._getKey(key));
      return true;
    } catch (error) {
      console.error('Storage remove error:', error);
      return false;
    }
  }

  /**
   * Clear all items with the prefix from storage
   * @returns {boolean} - True if successful
   */
  clear() {
    try {
      Object.keys(this.storage).forEach(key => {
        if (key.startsWith(PREFIX)) {
          this.storage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.error('Storage clear error:', error);
      return false;
    }
  }

  /**
   * Check if a key exists in storage
   * @param {string} key - The key to check
   * @returns {boolean} - True if key exists
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Get the number of items in storage with the prefix
   * @returns {number} - Number of items
   */
  size() {
    return Object.keys(this.storage).filter(key => key.startsWith(PREFIX)).length;
  }

  /**
   * Get all keys in storage with the prefix
   * @returns {string[]} - Array of keys
   */
  keys() {
    return Object.keys(this.storage)
      .filter(key => key.startsWith(PREFIX))
      .map(key => key.substring(PREFIX.length));
  }

  /**
   * Get all key-value pairs in storage with the prefix
   * @returns {Object} - Object with key-value pairs
   */
  getAll() {
    return this.keys().reduce((obj, key) => {
      obj[key] = this.get(key);
      return obj;
    }, {});
  }

  /**
   * Get the timestamp when an item was stored
   * @param {string} key - The key to check
   * @returns {number|null} - Timestamp or null if not found
   */
  getTimestamp(key) {
    try {
      const item = this.storage.getItem(this._getKey(key));
      if (!item) return null;

      const { timestamp } = JSON.parse(item);
      return timestamp || null;
    } catch (error) {
      console.error('Storage getTimestamp error:', error);
      return null;
    }
  }

  /**
   * Check if an item is expired
   * @param {string} key - The key to check
   * @param {number} ttl - Time to live in milliseconds
   * @returns {boolean} - True if expired or not found
   */
  isExpired(key, ttl) {
    const timestamp = this.getTimestamp(key);
    if (!timestamp) return true;
    return Date.now() - timestamp > ttl;
  }

  /**
   * Remove expired items from storage
   * @param {number} ttl - Time to live in milliseconds
   * @returns {string[]} - Array of removed keys
   */
  removeExpired(ttl) {
    const removed = [];
    this.keys().forEach(key => {
      if (this.isExpired(key, ttl)) {
        this.remove(key);
        removed.push(key);
      }
    });
    return removed;
  }
}

// Create default instances
export const localStorage = new Storage(window.localStorage);
export const sessionStorage = new Storage(window.sessionStorage);

export default {
  localStorage,
  sessionStorage,
  Storage
};
