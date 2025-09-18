import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format wallet address for display (show first 6 and last 4 characters)
 */
export function formatAddress(address: string): string {
  if (!address) return ''
  if (address.length < 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

/**
 * Format transaction hash for display
 */
export function formatTxHash(txHash: string): string {
  if (!txHash) return ''
  if (txHash.length < 10) return txHash
  return `${txHash.slice(0, 10)}...`
}

/**
 * Generate explorer URL for transaction
 */
export function getExplorerUrl(txHash: string, explorerUrl = 'https://basescan.org'): string {
  return `${explorerUrl}/tx/${txHash}`
}

/**
 * Format time remaining for cooldown
 */
export function formatTimeRemaining(timestamp: number): string {
  const now = Date.now()
  const remaining = timestamp - now
  
  if (remaining <= 0) return 'Available now'
  
  const hours = Math.floor(remaining / (1000 * 60 * 60))
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`
  } else {
    return `${minutes}m remaining`
  }
}

/**
 * Format number with thousands separators
 */
export function formatNumber(num: number): string {
  if (typeof num !== 'number') return '0'
  return num.toLocaleString()
}

/**
 * Parse error message from various sources
 */
export function parseError(error: unknown): string {
  if (typeof error === 'string') {
    return error
  }
  
  if (error && typeof error === 'object') {
    if ('message' in error && typeof error.message === 'string') {
      const message = error.message.toLowerCase()
      
      // Handle common Web3 errors
      if (message.includes('user rejected') || message.includes('user denied')) {
        return 'Transaction was cancelled by user'
      }
      
      if (message.includes('insufficient funds')) {
        return 'Insufficient funds for gas fees'
      }
      
      if (message.includes('network')) {
        return 'Network error. Please check your connection'
      }
      
      if (message.includes('cooldown') || message.includes('wait')) {
        return 'Please wait before claiming again'
      }
      
      return error.message
    }
    
    if ('reason' in error && typeof error.reason === 'string') {
      return error.reason
    }
  }
  
  return 'An unexpected error occurred'
}

/**
 * Validate Ethereum address format
 */
export function isValidAddress(address: string): boolean {
  if (!address) return false
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

/**
 * Validate transaction hash format
 */
export function isValidTxHash(txHash: string): boolean {
  if (!txHash) return false
  return /^0x[a-fA-F0-9]{64}$/.test(txHash)
}

/**
 * Create a delay/sleep function
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}