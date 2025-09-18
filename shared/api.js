// Shared API functions for all platforms

import { API_CONFIG } from './constants.js';
import { parseError } from './utils.js';

/**
 * Base API class with common functionality
 */
class ApiClient {
    constructor(baseUrl = API_CONFIG.baseUrl, timeout = API_CONFIG.timeout) {
        this.baseUrl = baseUrl;
        this.timeout = timeout;
    }

    /**
     * Make HTTP request with timeout and error handling
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Request options
     * @returns {Promise<any>} Response data
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        
        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            
            throw new Error(parseError(error));
        }
    }

    /**
     * GET request
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Request options
     * @returns {Promise<any>} Response data
     */
    async get(endpoint, options = {}) {
        return this.request(endpoint, {
            method: 'GET',
            ...options
        });
    }

    /**
     * POST request
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request body data
     * @param {Object} options - Request options
     * @returns {Promise<any>} Response data
     */
    async post(endpoint, data = {}, options = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
            ...options
        });
    }
}

// Create default API client instance
const apiClient = new ApiClient();

/**
 * Check if address is eligible to claim tokens
 * @param {string} address - Wallet address
 * @returns {Promise<Object>} Eligibility result
 */
export async function checkEligibility(address) {
    if (!address) {
        throw new Error('Address is required');
    }

    try {
        const response = await apiClient.post(API_CONFIG.endpoints.checkEligibility, {
            address: address.toLowerCase()
        });

        return {
            eligible: response.eligible || false,
            message: response.message || '',
            nextClaimTime: response.nextClaimTime || null,
            hoursRemaining: response.hoursRemaining || 0
        };
    } catch (error) {
        throw new Error(`Eligibility check failed: ${parseError(error)}`);
    }
}

/**
 * Log a successful claim transaction
 * @param {string} address - Wallet address
 * @param {string} txHash - Transaction hash
 * @returns {Promise<Object>} Log result
 */
export async function logClaim(address, txHash) {
    if (!address || !txHash) {
        throw new Error('Address and transaction hash are required');
    }

    try {
        const response = await apiClient.post(API_CONFIG.endpoints.logClaim, {
            address: address.toLowerCase(),
            txHash: txHash
        });

        return {
            success: response.success || false,
            message: response.message || 'Claim logged successfully'
        };
    } catch (error) {
        // Don't throw error for logging failures, just log them
        console.error('Failed to log claim:', parseError(error));
        return {
            success: false,
            message: 'Failed to log claim'
        };
    }
}

/**
 * Get faucet statistics from database
 * @returns {Promise<Object>} Statistics data
 */
export async function getStats() {
    try {
        const response = await apiClient.get(API_CONFIG.endpoints.stats);

        return {
            totalClaims: response.totalClaims || 0,
            claimsLast24h: response.claimsLast24h || 0,
            source: response.source || 'database'
        };
    } catch (error) {
        console.error('Failed to fetch stats:', parseError(error));
        return {
            totalClaims: 0,
            claimsLast24h: 0,
            source: 'error'
        };
    }
}

/**
 * Get faucet statistics from blockchain
 * @returns {Promise<Object>} Statistics data
 */
export async function getBlockchainStats() {
    try {
        const response = await apiClient.get(API_CONFIG.endpoints.blockchainStats);

        return {
            totalClaims: response.totalClaims || 0,
            claimsLast24h: response.claimsLast24h || 0,
            source: response.source || 'blockchain',
            contractAddress: response.contractAddress,
            currentBlock: response.currentBlock
        };
    } catch (error) {
        console.error('Failed to fetch blockchain stats:', parseError(error));
        // Fallback to database stats
        return await getStats();
    }
}

/**
 * Get combined statistics (tries blockchain first, falls back to database)
 * @returns {Promise<Object>} Statistics data
 */
export async function getCombinedStats() {
    try {
        // Try blockchain stats first
        const blockchainStats = await getBlockchainStats();
        
        // If blockchain stats are available and valid, use them
        if (blockchainStats.source === 'blockchain' && blockchainStats.totalClaims >= 0) {
            return blockchainStats;
        }
        
        // Otherwise fall back to database stats
        return await getStats();
    } catch (error) {
        console.error('Failed to fetch combined stats:', parseError(error));
        return {
            totalClaims: 0,
            claimsLast24h: 0,
            source: 'error'
        };
    }
}

/**
 * Health check for the API
 * @returns {Promise<Object>} Health status
 */
export async function healthCheck() {
    try {
        const response = await apiClient.get('/health');
        
        return {
            status: response.status || 'unknown',
            timestamp: response.timestamp || new Date().toISOString(),
            version: response.version || 'unknown'
        };
    } catch (error) {
        return {
            status: 'error',
            timestamp: new Date().toISOString(),
            error: parseError(error)
        };
    }
}

/**
 * Custom API client for different environments
 * @param {string} baseUrl - Custom base URL
 * @param {number} timeout - Request timeout
 * @returns {ApiClient} Custom API client instance
 */
export function createApiClient(baseUrl, timeout = API_CONFIG.timeout) {
    return new ApiClient(baseUrl, timeout);
}

/**
 * Retry wrapper for API calls
 * @param {Function} apiCall - API function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} delay - Delay between retries in ms
 * @returns {Promise<any>} API response
 */
export async function withRetry(apiCall, maxRetries = 3, delay = 1000) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await apiCall();
        } catch (error) {
            lastError = error;
            
            if (attempt === maxRetries) {
                throw lastError;
            }
            
            // Exponential backoff
            const backoffDelay = delay * Math.pow(2, attempt - 1);
            await new Promise(resolve => setTimeout(resolve, backoffDelay));
        }
    }
    
    throw lastError;
}

/**
 * Batch API requests
 * @param {Array<Function>} requests - Array of API request functions
 * @param {number} batchSize - Number of concurrent requests
 * @returns {Promise<Array>} Array of results
 */
export async function batchRequests(requests, batchSize = 5) {
    const results = [];
    
    for (let i = 0; i < requests.length; i += batchSize) {
        const batch = requests.slice(i, i + batchSize);
        const batchResults = await Promise.allSettled(batch.map(request => request()));
        results.push(...batchResults);
    }
    
    return results;
}

// Export the default API client for direct use
export { apiClient };