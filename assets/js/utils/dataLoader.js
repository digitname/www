/**
 * Data loading and caching utilities for the portfolio application
 */

import { handleApiError, showUserNotification } from './errorHandling.js';
import { validateData, normalizeData } from './dataValidation.js';

// Cache configuration
const CACHE_CONFIG = {
    ENABLED: true,
    PREFIX: 'portfolio_',
    TTL: 15 * 60 * 1000, // 15 minutes
    VERSION: 'v1'
};

/**
 * Fetches data from a URL with caching support
 * @param {string} url - URL to fetch data from
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} - Fetched data
 */
async function fetchWithCache(url, options = {}) {
    const cacheKey = `${CACHE_CONFIG.PREFIX}${CACHE_CONFIG.VERSION}_${btoa(url)}`;
    
    // Try to get from cache if enabled
    if (CACHE_CONFIG.ENABLED && 'caches' in window) {
        try {
            const cache = await caches.open('portfolio-cache');
            const cachedResponse = await cache.match(cacheKey);
            
            if (cachedResponse) {
                const cachedData = await cachedResponse.json();
                const cacheAge = Date.now() - (cachedData.timestamp || 0);
                
                // Return cached data if it's still fresh
                if (cacheAge < CACHE_CONFIG.TTL) {
                    console.debug(`[Cache] Using cached data for: ${url}`);
                    return cachedData.data;
                }
                
                console.debug(`[Cache] Cache expired for: ${url}`);
            }
        } catch (error) {
            console.warn('Cache access failed:', error);
        }
    }
    
    try {
        // Fetch fresh data
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {})
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Cache the response if caching is enabled
        if (CACHE_CONFIG.ENABLED && 'caches' in window) {
            try {
                const cache = await caches.open('portfolio-cache');
                const cacheData = {
                    data,
                    timestamp: Date.now(),
                    url
                };
                
                await cache.put(
                    cacheKey,
                    new Response(JSON.stringify(cacheData), {
                        headers: { 'Content-Type': 'application/json' }
                    })
                );
                
                console.debug(`[Cache] Cached data for: ${url}`);
            } catch (error) {
                console.warn('Failed to cache response:', error);
            }
        }
        
        return data;
    } catch (error) {
        console.error(`Failed to fetch data from ${url}:`, error);
        
        // Try to return stale data from cache if available
        if (CACHE_CONFIG.ENABLED && 'caches' in window) {
            try {
                const cache = await caches.open('portfolio-cache');
                const cachedResponse = await cache.match(cacheKey);
                
                if (cachedResponse) {
                    const cachedData = await cachedResponse.json();
                    console.warn(`[Cache] Using stale data due to fetch error: ${url}`);
                    return cachedData.data;
                }
            } catch (cacheError) {
                console.warn('Failed to access cache for fallback:', cacheError);
            }
        }
        
        throw error;
    }
}

/**
 * Loads portfolio data with validation and error handling
 * @param {string} dataUrl - URL to load data from
 * @param {Object} options - Options for data loading
 * @returns {Promise<Object>} - Loaded and validated data
 */
async function loadPortfolioData(dataUrl, options = {}) {
    const {
        validate = true,
        normalize = true,
        showLoading = true,
        showErrors = true
    } = options;
    
    if (showLoading) {
        showUserNotification('Loading portfolio data...', 'info');
    }
    
    try {
        // Fetch the data
        const data = await fetchWithCache(dataUrl);
        
        if (!data) {
            throw new Error('No data returned from server');
        }
        
        // Validate the data if needed
        if (validate) {
            const validationResult = validateData(data, 'PORTFOLIO_ITEM');
            
            if (!validationResult.isValid) {
                console.warn('Data validation warnings:', validationResult.errors);
                
                if (showErrors) {
                    showUserNotification(
                        'Some data validation issues were found. Check console for details.',
                        'warning'
                    );
                }
                
                // If data is invalid but we have some data, we can still try to use it
                if (!validationResult.data) {
                    throw new Error('Data validation failed');
                }
                
                return normalize ? normalizeData(validationResult.data) : validationResult.data;
            }
            
            return normalize ? normalizeData(validationResult.data) : validationResult.data;
        }
        
        return normalize ? normalizeData(data) : data;
    } catch (error) {
        console.error('Error loading portfolio data:', error);
        
        if (showErrors) {
            handleApiError(error, 'loadPortfolioData');
        }
        
        throw error;
    } finally {
        // Hide loading state if we showed it
        if (showLoading) {
            // This would be handled by your UI framework's loading state
        }
    }
}

/**
 * Clears the entire cache or specific entries
 * @param {string|RegExp} [pattern] - Pattern to match cache keys (optional)
 */
async function clearCache(pattern) {
    if (!('caches' in window)) return;
    
    try {
        const cache = await caches.open('portfolio-cache');
        const keys = await cache.keys();
        
        if (!pattern) {
            // Clear all cached items
            await Promise.all(keys.map(key => cache.delete(key)));
            console.log('All cache cleared');
        } else {
            // Clear matching items
            const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);
            const deletions = [];
            
            for (const request of keys) {
                if (regex.test(request.url)) {
                    deletions.push(cache.delete(request));
                }
            }
            
            await Promise.all(deletions);
            console.log(`Cleared ${deletions.length} cache entries matching ${pattern}`);
        }
    } catch (error) {
        console.error('Failed to clear cache:', error);
        throw error;
    }
}

export {
    fetchWithCache,
    loadPortfolioData,
    clearCache,
    CACHE_CONFIG
};
