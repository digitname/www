/**
 * Data validation utilities for the portfolio application
 */

// Schema definitions for different data types
const SCHEMAS = {
    PORTFOLIO_ITEM: {
        required: ['domain', 'url'],
        optional: [
            'title', 'description', 'theme', 'technologies', 'keywords',
            'thumbnail', 'category', 'date', 'featured', 'github', 'demo',
            'screenshots', 'tags', 'status', 'role', 'company', 'duration'
        ],
        defaults: {
            technologies: [],
            keywords: [],
            tags: [],
            screenshots: [],
            featured: false,
            status: 'completed',
            date: () => new Date().toISOString().split('T')[0] // Default to today
        },
        validators: {
            domain: (value) => ({
                isValid: typeof value === 'string' && value.length > 0,
                message: 'Domain must be a non-empty string'
            }),
            url: (value) => ({
                isValid: typeof value === 'string' && value.startsWith('http'),
                message: 'URL must be a valid HTTP/HTTPS URL'
            }),
            technologies: (value) => ({
                isValid: Array.isArray(value) && value.every(item => typeof item === 'string'),
                message: 'Technologies must be an array of strings'
            }),
            date: (value) => ({
                isValid: !isNaN(Date.parse(value)),
                message: 'Date must be a valid date string'
            })
        }
    }
};

/**
 * Validates data against a schema
 * @param {Object} data - Data to validate
 * @param {string} schemaName - Name of the schema to validate against
 * @returns {Object} - Validation result
 */
function validateData(data, schemaName = 'PORTFOLIO_ITEM') {
    const schema = SCHEMAS[schemaName];
    if (!schema) {
        return {
            isValid: false,
            errors: [`Unknown schema: ${schemaName}`]
        };
    }

    const errors = [];
    const result = { ...data };
    
    // Apply defaults for missing optional fields
    Object.entries(schema.defaults || {}).forEach(([key, defaultValue]) => {
        if (result[key] === undefined || result[key] === null) {
            result[key] = typeof defaultValue === 'function' 
                ? defaultValue() 
                : defaultValue;
        }
    });
    
    // Check required fields
    schema.required.forEach(field => {
        if (result[field] === undefined || result[field] === null || result[field] === '') {
            errors.push(`Missing required field: ${field}`);
        }
    });
    
    // Validate field types and constraints
    Object.entries(result).forEach(([key, value]) => {
        const validator = (schema.validators || {})[key];
        if (validator) {
            const validation = validator(value);
            if (!validation.isValid) {
                errors.push(`${key}: ${validation.message}`);
            }
        }
    });
    
    // Check for unknown fields
    const allAllowedFields = [...schema.required, ...(schema.optional || [])];
    Object.keys(result).forEach(key => {
        if (!allAllowedFields.includes(key)) {
            console.warn(`Unexpected field in ${schemaName}: ${key}`);
        }
    });
    
    return {
        isValid: errors.length === 0,
        data: errors.length === 0 ? result : null,
        errors: errors.length > 0 ? errors : null,
        schema: schemaName
    };
}

/**
 * Normalizes data to ensure consistent structure
 * @param {Array|Object} data - Data to normalize
 * @param {string} schemaName - Schema to use for normalization
 * @returns {Array|Object} - Normalized data
 */
function normalizeData(data, schemaName = 'PORTFOLIO_ITEM') {
    if (Array.isArray(data)) {
        return data.map(item => {
            const { isValid, data: normalized } = validateData(item, schemaName);
            return isValid ? normalized : null;
        }).filter(Boolean);
    }
    
    const { isValid, data: normalized } = validateData(data, schemaName);
    return isValid ? normalized : null;
}

/**
 * Sanitizes input to prevent XSS and other injection attacks
 * @param {string} input - Input to sanitize
 * @returns {string} - Sanitized input
 */
function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    // Basic XSS prevention
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

/**
 * Sanitizes an object's string properties
 * @param {Object} obj - Object to sanitize
 * @returns {Object} - Sanitized object
 */
function sanitizeObject(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    
    const result = {};
    Object.entries(obj).forEach(([key, value]) => {
        if (typeof value === 'string') {
            result[key] = sanitizeInput(value);
        } else if (Array.isArray(value)) {
            result[key] = value.map(item => 
                typeof item === 'string' ? sanitizeInput(item) : item
            );
        } else if (value && typeof value === 'object') {
            result[key] = sanitizeObject(value);
        } else {
            result[key] = value;
        }
    });
    
    return result;
}

export {
    validateData,
    normalizeData,
    sanitizeInput,
    sanitizeObject,
    SCHEMAS
};
