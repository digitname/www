class Logger {
  constructor() {
    this.queue = [];
    this.maxRetries = 3;
    this.retryDelay = 5000; // 5 seconds
    this.endpoint = '/api/logs';
    this.isSending = false;
    this.isOnline = typeof window !== 'undefined' ? window.navigator.onLine : true;
    
    // Initialize
    this._setupEventListeners();
  }

  _setupEventListeners() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this._processQueue();
      });
      
      window.addEventListener('offline', () => {
        this.isOnline = false;
      });

      // Track page visibility changes
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this._processQueue();
        }
      });
    }
  }

  _getContext() {
    return {
      url: window.location.href,
      userAgent: window.navigator.userAgent,
      timestamp: new Date().toISOString(),
      sessionId: this._getSessionId(),
      level: 'info',
      service: 'frontend',
      environment: process.env.NODE_ENV || 'development',
    };
  }

  _getSessionId() {
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }

  _enqueue(level, message, data = {}) {
    const logEntry = {
      level,
      message,
      ...data,
      ...this._getContext(),
    };

    this.queue.push(logEntry);
    this._processQueue();
  }

  async _processQueue() {
    if (!this.isOnline || this.isSending || this.queue.length === 0) {
      return;
    }

    this.isSending = true;

    try {
      while (this.queue.length > 0) {
        const batch = this.queue.splice(0, 10); // Process in batches of 10
        
        try {
          await this._sendToServer(batch);
        } catch (error) {
          console.error('Failed to send logs:', error);
          // Re-add failed batch to the queue
          this.queue.unshift(...batch);
          break;
        }
      }
    } finally {
      this.isSending = false;
    }
  }

  async _sendToServer(batch, retryCount = 0) {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(batch),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      if (retryCount < this.maxRetries) {
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * (retryCount + 1)));
        return this._sendToServer(batch, retryCount + 1);
      }
      throw error;
    }
  }

  // Public methods
  debug(message, data = {}) {
    this._enqueue('debug', message, data);
  }

  info(message, data = {}) {
    this._enqueue('info', message, data);
  }

  warn(message, data = {}) {
    this._enqueue('warn', message, data);
  }

  error(message, error = null, data = {}) {
    const errorData = error ? {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }
    } : {};
    
    this._enqueue('error', message, { ...data, ...errorData });
  }

  // Web Vitals
  trackWebVitals(metric) {
    this.info(`Web Vitals: ${metric.name}`, {
      metric: {
        name: metric.name,
        value: metric.value,
        id: metric.id,
        delta: metric.delta,
        entries: metric.entries,
      }
    });
  }

  // User interactions
  trackInteraction(action, element, data = {}) {
    this.info(`User interaction: ${action}`, {
      action,
      element: {
        id: element.id,
        tagName: element.tagName,
        className: element.className,
        text: element.textContent?.substring(0, 100),
      },
      ...data
    });
  }
}

// Create singleton instance
const logger = new Logger();

// Export methods
export const log = {
  debug: (message, data) => logger.debug(message, data),
  info: (message, data) => logger.info(message, data),
  warn: (message, data) => logger.warn(message, data),
  error: (message, error, data) => logger.error(message, error, data),
  trackWebVitals: (metric) => logger.trackWebVitals(metric),
  trackInteraction: (action, element, data) => 
    logger.trackInteraction(action, element, data),
};

// Auto-initialize Web Vitals if available
if (typeof window !== 'undefined' && window.__METRICS__) {
  window.__METRICS__.onReport((metric) => {
    logger.trackWebVitals(metric);
  });
}

export default logger;
