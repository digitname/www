/**
 * Form Utilities
 * Provides helper functions for form validation and submission
 */

// Default validation messages
const DEFAULT_MESSAGES = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  url: 'Please enter a valid URL',
  number: 'Please enter a valid number',
  min: 'Value must be at least {0}',
  max: 'Value must be at most {0}',
  minLength: 'Must be at least {0} characters',
  maxLength: 'Must be at most {0} characters',
  pattern: 'Invalid format',
  match: 'Values do not match',
  custom: 'Invalid value'
};

// Validation patterns
const PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  url: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
  phone: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
  numeric: /^\d+$/,
  alpha: /^[a-zA-Z]+$/,
  alphanumeric: /^[a-zA-Z0-9]+$/
};

/**
 * Form Validator Class
 */
class FormValidator {
  constructor(form, options = {}) {
    this.form = form;
    this.options = {
      errorClass: 'error',
      errorElement: 'div',
      errorPlacement: 'after',
      messages: { ...DEFAULT_MESSAGES, ...options.messages },
      ...options
    };
    this.errors = new Map();
    this.fields = new Map();
    
    this.init();
  }
  
  /**
   * Initialize the form validator
   */
  init() {
    // Find all form fields with validation attributes
    const fields = this.form.querySelectorAll('[data-validate]');
    
    fields.forEach(field => {
      const fieldName = field.name || field.id;
      if (!fieldName) return;
      
      // Store field reference and validation rules
      const rules = this.parseValidationRules(field);
      this.fields.set(fieldName, { field, rules });
      
      // Add event listeners for real-time validation
      field.addEventListener('blur', () => this.validateField(fieldName));
      field.addEventListener('input', () => this.clearError(fieldName));
    });
    
    // Add form submit handler
    this.form.addEventListener('submit', (e) => {
      if (!this.validate()) {
        e.preventDefault();
        this.focusFirstError();
      }
    });
  }
  
  /**
   * Parse validation rules from data attributes
   * @param {HTMLElement} field - The form field
   * @returns {Object} - Validation rules
   */
  parseValidationRules(field) {
    const rules = {};
    const validateAttr = field.getAttribute('data-validate');
    
    if (!validateAttr) return rules;
    
    // Parse rules from data-validate attribute (e.g., "required|email|min:5")
    validateAttr.split('|').forEach(rule => {
      const [name, param] = rule.split(':');
      rules[name] = param || true;
    });
    
    // Add pattern if specified
    if (field.pattern) {
      rules.pattern = field.pattern;
    }
    
    // Add min/max length
    if (field.minLength) {
      rules.minLength = field.minLength;
    }
    
    if (field.maxLength) {
      rules.maxLength = field.maxLength;
    }
    
    // Add min/max for number inputs
    if (field.type === 'number' || field.type === 'range') {
      if (field.min) {
        rules.min = field.min;
      }
      
      if (field.max) {
        rules.max = field.max;
      }
    }
    
    // Add required if specified
    if (field.required) {
      rules.required = true;
    }
    
    // Add custom validation message if specified
    const errorMessage = field.getAttribute('data-error-message');
    if (errorMessage) {
      rules.message = errorMessage;
    }
    
    // Add match field if specified
    const matchField = field.getAttribute('data-match');
    if (matchField) {
      rules.match = matchField;
    }
    
    return rules;
  }
  
  /**
   * Validate a single field
   * @param {string} fieldName - The name of the field to validate
   * @returns {boolean} - True if valid, false otherwise
   */
  validateField(fieldName) {
    const fieldData = this.fields.get(fieldName);
    if (!fieldData) return true;
    
    const { field, rules } = fieldData;
    const value = this.getValue(field);
    let isValid = true;
    
    // Clear previous error
    this.clearError(fieldName);
    
    // Skip validation for empty fields that aren't required
    if (!rules.required && (value === '' || value === null || value === undefined)) {
      return true;
    }
    
    // Check each validation rule
    for (const [rule, param] of Object.entries(rules)) {
      let ruleValid = true;
      
      switch (rule) {
        case 'required':
          ruleValid = this.validateRequired(value);
          break;
          
        case 'email':
          ruleValid = this.validateEmail(value);
          break;
          
        case 'url':
          ruleValid = this.validateUrl(value);
          break;
          
        case 'number':
          ruleValid = this.validateNumber(value);
          break;
          
        case 'min':
          ruleValid = this.validateMin(value, param);
          break;
          
        case 'max':
          ruleValid = this.validateMax(value, param);
          break;
          
        case 'minLength':
          ruleValid = this.validateMinLength(value, param);
          break;
          
        case 'maxLength':
          ruleValid = this.validateMaxLength(value, param);
          break;
          
        case 'pattern':
          ruleValid = this.validatePattern(value, param);
          break;
          
        case 'match':
          ruleValid = this.validateMatch(value, param);
          break;
          
        // Skip message and other non-rule properties
        case 'message':
          continue;
          
        default:
          // Check for custom validation function
          if (typeof this.options[rule] === 'function') {
            ruleValid = this.options[rule](value, param, field);
          }
      }
      
      if (!ruleValid) {
        isValid = false;
        const message = rules.message || this.options.messages[rule] || this.options.messages.custom;
        this.addError(fieldName, this.formatMessage(message, param));
        break;
      }
    }
    
    return isValid;
  }
  
  /**
   * Validate the entire form
   * @returns {boolean} - True if form is valid, false otherwise
   */
  validate() {
    let isValid = true;
    this.clearAllErrors();
    
    for (const fieldName of this.fields.keys()) {
      if (!this.validateField(fieldName)) {
        isValid = false;
      }
    }
    
    return isValid;
  }
  
  /**
   * Add an error message for a field
   * @param {string} fieldName - The name of the field
   * @param {string} message - The error message
   */
  addError(fieldName, message) {
    const fieldData = this.fields.get(fieldName);
    if (!fieldData) return;
    
    const { field } = fieldData;
    
    // Add error class to field
    field.classList.add(this.options.errorClass);
    
    // Create error element if it doesn't exist
    let errorElement = field.nextElementSibling;
    const errorId = `${field.id || field.name}_error`;
    
    if (!errorElement || !errorElement.classList.contains(this.options.errorClass)) {
      errorElement = document.createElement(this.options.errorElement);
      errorElement.className = this.options.errorClass;
      errorElement.id = errorId;
      
      // Insert error message after the field
      field.parentNode.insertBefore(errorElement, field.nextSibling);
    }
    
    // Set error message
    errorElement.textContent = message;
    
    // Update ARIA attributes
    field.setAttribute('aria-invalid', 'true');
    field.setAttribute('aria-describedby', errorId);
    
    // Store error
    this.errors.set(fieldName, {
      field,
      message,
      element: errorElement
    });
  }
  
  /**
   * Clear error for a specific field
   * @param {string} fieldName - The name of the field
   */
  clearError(fieldName) {
    const error = this.errors.get(fieldName);
    if (!error) return;
    
    const { field, element } = error;
    
    // Remove error class
    field.classList.remove(this.options.errorClass);
    
    // Remove error element if it exists
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
    }
    
    // Update ARIA attributes
    field.removeAttribute('aria-invalid');
    field.removeAttribute('aria-describedby');
    
    // Remove from errors map
    this.errors.delete(fieldName);
  }
  
  /**
   * Clear all errors
   */
  clearAllErrors() {
    for (const fieldName of this.errors.keys()) {
      this.clearError(fieldName);
    }
    this.errors.clear();
  }
  
  /**
   * Focus the first field with an error
   */
  focusFirstError() {
    const firstError = this.errors.values().next().value;
    if (firstError && firstError.field) {
      firstError.field.focus();
    }
  }
  
  /**
   * Get the value of a form field
   * @param {HTMLElement} field - The form field
   * @returns {*} - The field value
   */
  getValue(field) {
    switch (field.type) {
      case 'checkbox':
        return field.checked;
        
      case 'radio':
        const form = field.form;
        if (!form) return '';
        const selected = form.querySelector(`input[name="${field.name}"]:checked`);
        return selected ? selected.value : '';
        
      case 'file':
        return field.files.length > 0 ? field.files : null;
        
      case 'select-multiple':
        return Array.from(field.selectedOptions).map(option => option.value);
        
      default:
        return field.value.trim();
    }
  }
  
  /**
   * Format a validation message with parameters
   * @param {string} message - The message template
   * @param {*} param - The parameter to insert
   * @returns {string} - The formatted message
   */
  formatMessage(message, param) {
    if (!message) return '';
    return message.replace(/\{0\}/g, param);
  }
  
  // Validation methods
  validateRequired(value) {
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return value !== '' && value !== null && value !== undefined && value !== false;
  }
  
  validateEmail(value) {
    return PATTERNS.email.test(value);
  }
  
  validateUrl(value) {
    return PATTERNS.url.test(value);
  }
  
  validateNumber(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
  }
  
  validateMin(value, min) {
    const num = parseFloat(value);
    return !isNaN(num) && num >= parseFloat(min);
  }
  
  validateMax(value, max) {
    const num = parseFloat(value);
    return !isNaN(num) && num <= parseFloat(max);
  }
  
  validateMinLength(value, minLength) {
    return String(value).length >= parseInt(minLength, 10);
  }
  
  validateMaxLength(value, maxLength) {
    return String(value).length <= parseInt(maxLength, 10);
  }
  
  validatePattern(value, pattern) {
    const regex = new RegExp(pattern);
    return regex.test(value);
  }
  
  validateMatch(value, otherFieldName) {
    const otherField = this.form.querySelector(`[name="${otherFieldName}"]`);
    if (!otherField) return true;
    return value === this.getValue(otherField);
  }
}

/**
 * Initialize form validation
 * @param {string|HTMLElement} form - The form element or selector
 * @param {Object} options - Validation options
 * @returns {FormValidator} - The form validator instance
 */
function initFormValidation(form, options = {}) {
  const formElement = typeof form === 'string' ? document.querySelector(form) : form;
  if (!formElement) return null;
  
  return new FormValidator(formElement, options);
}

/**
 * Serialize form data to an object
 * @param {HTMLFormElement} form - The form element
 * @returns {Object} - The serialized form data
 */
function serializeForm(form) {
  if (!form || !(form instanceof HTMLFormElement)) return {};
  
  const formData = new FormData(form);
  const data = {};
  
  for (const [key, value] of formData.entries()) {
    // Handle array fields (e.g., checkboxes with the same name)
    if (key in data) {
      if (!Array.isArray(data[key])) {
        data[key] = [data[key]];
      }
      data[key].push(value);
    } else {
      data[key] = value;
    }
  }
  
  return data;
}

/**
 * Submit a form via AJAX
 * @param {HTMLFormElement} form - The form element
 * @param {Object} options - AJAX options
 * @returns {Promise} - A promise that resolves with the response
 */
async function submitForm(form, options = {}) {
  const {
    url = form.action,
    method = form.method || 'POST',
    dataType = 'json',
    beforeSend = () => {},
    success = () => {},
    error = () => {},
    complete = () => {},
    ...rest
  } = options;
  
  try {
    // Call beforeSend callback
    beforeSend(form);
    
    // Get form data
    const formData = new FormData(form);
    
    // Create fetch options
    const fetchOptions = {
      method,
      body: formData,
      ...rest
    };
    
    // Send the request
    const response = await fetch(url, fetchOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Parse response
    let responseData;
    if (dataType === 'json') {
      responseData = await response.json();
    } else if (dataType === 'text') {
      responseData = await response.text();
    } else if (dataType === 'blob') {
      responseData = await response.blob();
    } else {
      responseData = await response.text();
    }
    
    // Call success callback
    success(responseData, response, form);
    
    return responseData;
  } catch (error) {
    // Call error callback
    error(error, form);
    throw error;
  } finally {
    // Call complete callback
    complete(form);
  }
}

export {
  FormValidator,
  initFormValidation,
  serializeForm,
  submitForm,
  PATTERNS,
  DEFAULT_MESSAGES as MESSAGES
};

export default {
  FormValidator,
  initFormValidation,
  serializeForm,
  submitForm,
  PATTERNS,
  MESSAGES: DEFAULT_MESSAGES
};
