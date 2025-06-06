/**
 * Error handling utilities for the portfolio application
 */

/**
 * Handles API errors and displays appropriate user feedback
 * @param {Error} error - The error object
 * @param {string} context - Additional context about where the error occurred
 * @returns {Object} - Standardized error response
 */
function handleApiError(error, context = '') {
    console.error(`[${new Date().toISOString()}] API Error (${context}):`, error);
    
    let userMessage = 'An unexpected error occurred';
    let statusCode = 500;
    let errorDetails = {};
    
    // Handle different types of errors
    if (error.response) {
        // Server responded with a status code outside 2xx
        statusCode = error.response.status;
        errorDetails = error.response.data || {};
        
        switch (statusCode) {
            case 400:
                userMessage = 'Invalid request. Please check your input.';
                break;
            case 401:
                userMessage = 'Authentication required. Please log in.';
                break;
            case 403:
                userMessage = 'You do not have permission to perform this action.';
                break;
            case 404:
                userMessage = 'The requested resource was not found.';
                break;
            case 429:
                userMessage = 'Too many requests. Please try again later.';
                break;
            case 500:
                userMessage = 'Server error. Please try again later.';
                break;
            default:
                userMessage = `An error occurred (${statusCode})`;
        }
    } else if (error.request) {
        // Request was made but no response received
        userMessage = 'No response from server. Please check your connection.';
        errorDetails = { noResponse: true };
    } else {
        // Something else happened in setting up the request
        userMessage = `Request setup error: ${error.message}`;
    }
    
    // Show error to user
    showUserNotification(userMessage, 'error');
    
    // Return standardized error object
    return {
        success: false,
        status: statusCode,
        message: userMessage,
        error: error.message,
        details: errorDetails,
        context: context || 'unknown'
    };
}

/**
 * Validates required data fields
 * @param {Object} data - Data object to validate
 * @param {Array} requiredFields - Array of required field names
 * @returns {Object} - Validation result
 */
function validateRequiredFields(data, requiredFields) {
    const missingFields = [];
    const invalidFields = [];
    
    requiredFields.forEach(field => {
        const value = data[field];
        if (value === undefined || value === null || value === '') {
            missingFields.push(field);
        } else if (Array.isArray(value) && value.length === 0) {
            invalidFields.push(`${field} cannot be empty`);
        } else if (typeof value === 'object' && Object.keys(value).length === 0) {
            invalidFields.push(`${field} cannot be an empty object`);
        }
    });
    
    const isValid = missingFields.length === 0 && invalidFields.length === 0;
    
    return {
        isValid,
        missingFields,
        invalidFields,
        message: !isValid 
            ? `Validation failed: ${missingFields.length ? `Missing fields: ${missingFields.join(', ')}. ` : ''}${invalidFields.join('. ')}`
            : 'Validation successful'
    };
}

/**
 * Safely parses JSON with error handling
 * @param {string} jsonString - JSON string to parse
 * @param {string} context - Context for error messages
 * @returns {Object} - Parsed object or error object
 */
function safeJsonParse(jsonString, context = 'parseJSON') {
    try {
        return {
            success: true,
            data: JSON.parse(jsonString)
        };
    } catch (error) {
        const errorMessage = `Failed to parse JSON in ${context}: ${error.message}`;
        console.error(errorMessage, { jsonString });
        return {
            success: false,
            error: errorMessage,
            context
        };
    }
}

/**
 * Shows a user notification (toast/snackbar)
 * @param {string} message - Message to display
 * @param {string} type - Type of notification (error, success, warning, info)
 */
function showUserNotification(message, type = 'info') {
    // Check if we have a notification system available
    if (window.showNotification) {
        window.showNotification(message, type);
        return;
    }
    
    // Fallback to console if no notification system
    const logMethod = {
        error: console.error,
        warning: console.warn,
        success: console.log,
        info: console.info
    }[type] || console.log;
    
    logMethod(`[${type.toUpperCase()}] ${message}`);
    
    // Create a simple toast notification if in browser
    if (typeof document !== 'undefined') {
        const toast = document.createElement('div');
        toast.className = `toast-notification toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 24px;
            border-radius: 4px;
            color: white;
            background-color: ${{
                error: '#dc3545',
                success: '#28a745',
                warning: '#ffc107',
                info: '#17a2b8'
            }[type] || '#6c757d'};
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(toast);
        
        // Auto-remove after delay
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => toast.remove(), 300);
        }, 5000);
        
        // Add click to dismiss
        toast.addEventListener('click', () => toast.remove());
    }
}

/**
 * Handles missing data scenarios
 * @param {*} data - Data to check
 * @param {string} context - Context for error messages
 * @param {*} defaultValue - Default value to return if data is invalid
 * @returns {*} - Valid data or default value
 */
function handleMissingData(data, context = 'data', defaultValue = null) {
    if (data === undefined || data === null) {
        const error = new Error(`${context} is ${data === undefined ? 'undefined' : 'null'}`);
        console.error(error);
        showUserNotification(`Missing required data: ${context}`, 'error');
        return defaultValue;
    }
    
    if (Array.isArray(data) && data.length === 0) {
        console.warn(`Empty array provided for ${context}`);
        return defaultValue;
    }
    
    if (typeof data === 'object' && Object.keys(data).length === 0) {
        console.warn(`Empty object provided for ${context}`);
        return defaultValue;
    }
    
    return data;
}

// Add animation styles if not already present
if (typeof document !== 'undefined' && !document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// Export all functions
export {
    handleApiError,
    validateRequiredFields,
    safeJsonParse,
    showUserNotification,
    handleMissingData
};
