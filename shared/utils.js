// Shared utility functions across all platforms

/**
 * Format wallet address for display (show first 6 and last 4 characters)
 * @param {string} address - The wallet address
 * @returns {string} Formatted address
 */
export function formatAddress(address) {
    if (!address) return '';
    if (address.length < 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Validate Ethereum address format
 * @param {string} address - The address to validate
 * @returns {boolean} Whether the address is valid
 */
export function isValidAddress(address) {
    if (!address) return false;
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Format transaction hash for display
 * @param {string} txHash - The transaction hash
 * @returns {string} Formatted transaction hash
 */
export function formatTxHash(txHash) {
    if (!txHash) return '';
    if (txHash.length < 10) return txHash;
    return `${txHash.slice(0, 10)}...`;
}

/**
 * Generate explorer URL for transaction
 * @param {string} txHash - The transaction hash
 * @param {string} explorerUrl - The explorer base URL
 * @returns {string} Full explorer URL
 */
export function getExplorerUrl(txHash, explorerUrl = 'https://basescan.org') {
    return `${explorerUrl}/tx/${txHash}`;
}

/**
 * Format time remaining for cooldown
 * @param {number} timestamp - Unix timestamp when next claim is available
 * @returns {string} Formatted time remaining
 */
export function formatTimeRemaining(timestamp) {
    const now = Date.now();
    const remaining = timestamp - now;
    
    if (remaining <= 0) return 'Available now';
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
        return `${hours}h ${minutes}m remaining`;
    } else {
        return `${minutes}m remaining`;
    }
}

/**
 * Format number with thousands separators
 * @param {number} num - The number to format
 * @returns {string} Formatted number
 */
export function formatNumber(num) {
    if (typeof num !== 'number') return '0';
    return num.toLocaleString();
}

/**
 * Create a delay/sleep function
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} Promise that resolves after delay
 */
export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Debounce function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Parse error message from various sources
 * @param {Error|string|Object} error - The error to parse
 * @returns {string} User-friendly error message
 */
export function parseError(error) {
    if (typeof error === 'string') {
        return error;
    }
    
    if (error?.message) {
        // Handle common Web3 errors
        const message = error.message.toLowerCase();
        
        if (message.includes('user rejected') || message.includes('user denied')) {
            return 'Transaction was cancelled by user';
        }
        
        if (message.includes('insufficient funds')) {
            return 'Insufficient funds for gas fees';
        }
        
        if (message.includes('network')) {
            return 'Network error. Please check your connection';
        }
        
        if (message.includes('cooldown') || message.includes('wait')) {
            return 'Please wait before claiming again';
        }
        
        return error.message;
    }
    
    if (error?.reason) {
        return error.reason;
    }
    
    return 'An unexpected error occurred';
}

/**
 * Validate transaction hash format
 * @param {string} txHash - The transaction hash to validate
 * @returns {boolean} Whether the hash is valid
 */
export function isValidTxHash(txHash) {
    if (!txHash) return false;
    return /^0x[a-fA-F0-9]{64}$/.test(txHash);
}

/**
 * Convert Wei to ETH
 * @param {string|number} wei - Wei amount
 * @returns {string} ETH amount
 */
export function weiToEth(wei) {
    if (!wei) return '0';
    const ethValue = parseFloat(wei) / Math.pow(10, 18);
    return ethValue.toFixed(6);
}

/**
 * Convert ETH to Wei
 * @param {string|number} eth - ETH amount
 * @returns {string} Wei amount
 */
export function ethToWei(eth) {
    if (!eth) return '0';
    const weiValue = parseFloat(eth) * Math.pow(10, 18);
    return weiValue.toString();
}

/**
 * Check if running in mobile environment
 * @returns {boolean} Whether running on mobile
 */
export function isMobile() {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Check if running in iOS environment
 * @returns {boolean} Whether running on iOS
 */
export function isIOS() {
    if (typeof window === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

/**
 * Check if running in Android environment
 * @returns {boolean} Whether running on Android
 */
export function isAndroid() {
    if (typeof window === 'undefined') return false;
    return /Android/.test(navigator.userAgent);
}

/**
 * Generate deep link URL for mobile wallets
 * @param {string} wcUri - WalletConnect URI
 * @param {string} walletName - Name of the wallet app
 * @returns {string} Deep link URL
 */
export function generateDeepLink(wcUri, walletName = 'metamask') {
    const encodedUri = encodeURIComponent(wcUri);
    
    const deepLinks = {
        metamask: `metamask://wc?uri=${encodedUri}`,
        trust: `trust://wc?uri=${encodedUri}`,
        rainbow: `rainbow://wc?uri=${encodedUri}`,
        coinbase: `cbwallet://wc?uri=${encodedUri}`,
        walletconnect: `wc://wc?uri=${encodedUri}`
    };
    
    return deepLinks[walletName.toLowerCase()] || deepLinks.walletconnect;
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Whether copy was successful
 */
export async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            const success = document.execCommand('copy');
            document.body.removeChild(textArea);
            return success;
        }
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        return false;
    }
}

/**
 * Storage utilities for different platforms
 */
export const storage = {
    /**
     * Set item in storage
     * @param {string} key - Storage key
     * @param {any} value - Value to store
     */
    setItem(key, value) {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                localStorage.setItem(key, JSON.stringify(value));
            }
        } catch (error) {
            console.error('Failed to save to storage:', error);
        }
    },
    
    /**
     * Get item from storage
     * @param {string} key - Storage key
     * @param {any} defaultValue - Default value if not found
     * @returns {any} Stored value or default
     */
    getItem(key, defaultValue = null) {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            }
        } catch (error) {
            console.error('Failed to read from storage:', error);
        }
        return defaultValue;
    },
    
    /**
     * Remove item from storage
     * @param {string} key - Storage key
     */
    removeItem(key) {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                localStorage.removeItem(key);
            }
        } catch (error) {
            console.error('Failed to remove from storage:', error);
        }
    }
};