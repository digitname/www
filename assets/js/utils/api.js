/**
 * API Utility
 * Provides a simple interface for making HTTP requests
 */

// Default headers for all requests
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

/**
 * Make an HTTP request
 * @param {string} url - The URL to make the request to
 * @param {Object} options - Request options
 * @returns {Promise<Object>} - Response data
 */
async function request(url, options = {}) {
  const {
    method = 'GET',
    headers = {},
    body = null,
    timeout = 10000,
    credentials = 'same-origin',
    ...rest
  } = options;

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method,
      headers: {
        ...DEFAULT_HEADERS,
        ...headers
      },
      body: body ? JSON.stringify(body) : null,
      credentials,
      signal: controller.signal,
      ...rest
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = new Error(`HTTP error! status: ${response.status}`);
      error.status = response.status;
      error.response = response;
      throw error;
    }

    // Handle different response types
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    if (contentType && contentType.includes('text/')) {
      return await response.text();
    }
    
    return await response.blob();
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      error.message = 'Request timed out';
      error.status = 408;
    }
    
    throw error;
  }
}

/**
 * Make a GET request
 * @param {string} url - The URL to make the request to
 * @param {Object} options - Request options
 * @returns {Promise<Object>} - Response data
 */
function get(url, options = {}) {
  return request(url, { ...options, method: 'GET' });
}

/**
 * Make a POST request
 * @param {string} url - The URL to make the request to
 * @param {Object} data - The data to send
 * @param {Object} options - Request options
 * @returns {Promise<Object>} - Response data
 */
function post(url, data = {}, options = {}) {
  return request(url, {
    ...options,
    method: 'POST',
    body: data
  });
}

/**
 * Make a PUT request
 * @param {string} url - The URL to make the request to
 * @param {Object} data - The data to send
 * @param {Object} options - Request options
 * @returns {Promise<Object>} - Response data
 */
function put(url, data = {}, options = {}) {
  return request(url, {
    ...options,
    method: 'PUT',
    body: data
  });
}

/**
 * Make a PATCH request
 * @param {string} url - The URL to make the request to
 * @param {Object} data - The data to send
 * @param {Object} options - Request options
 * @returns {Promise<Object>} - Response data
 */
function patch(url, data = {}, options = {}) {
  return request(url, {
    ...options,
    method: 'PATCH',
    body: data
  });
}

/**
 * Make a DELETE request
 * @param {string} url - The URL to make the request to
 * @param {Object} options - Request options
 * @returns {Promise<Object>} - Response data
 */
function del(url, options = {}) {
  return request(url, { ...options, method: 'DELETE' });
}

/**
 * Upload a file using FormData
 * @param {string} url - The URL to upload the file to
 * @param {File|File[]} files - The file(s) to upload
 * @param {Object} data - Additional form data
 * @param {Object} options - Request options
 * @returns {Promise<Object>} - Response data
 */
async function upload(url, files, data = {}, options = {}) {
  const formData = new FormData();
  
  // Add files to form data
  if (Array.isArray(files)) {
    files.forEach((file, index) => {
      formData.append(`file${index}`, file);
    });
  } else {
    formData.append('file', files);
  }
  
  // Add additional data to form data
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });
  
  return request(url, {
    ...options,
    method: 'POST',
    body: formData,
    headers: {
      // Let the browser set the Content-Type with the correct boundary
      ...(options.headers || {})
    }
  });
}

/**
 * Set default headers for all requests
 * @param {Object} headers - Headers to set
 */
function setDefaultHeaders(headers) {
  Object.assign(DEFAULT_HEADERS, headers);
}

/**
 * Get default headers
 * @returns {Object} - Current default headers
 */
function getDefaultHeaders() {
  return { ...DEFAULT_HEADERS };
}

export {
  request,
  get,
  post,
  put,
  patch,
  del,
  upload,
  setDefaultHeaders,
  getDefaultHeaders
};

export default {
  request,
  get,
  post,
  put,
  patch,
  delete: del,
  upload,
  setDefaultHeaders,
  getDefaultHeaders
};
