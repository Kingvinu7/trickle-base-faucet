'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Clock, User } from 'lucide-react'
import { formatDistance } from 'date-fns'

interface Claim {
  address: string
  txHash: string
  timestamp: string
  farcasterUser?: {
    fid: number
    username: string
    displayName: string
  }
}

export function HallOfFame() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchClaims = async () => {
    try {
      const response = await fetch('/api/log-claim')
      const data = await response.json()
      
      if (data.success && data.claims) {
        setClaims(data.claims)
      }
    } catch (error) {
      console.error('Failed to fetch claims:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Initial fetch
    fetchClaims()
    
    // Poll every 30 seconds for new claims
    const interval = setInterval(fetchClaims, 30000)
    
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-6 shadow-xl"
      >
        <div className="flex items-center justify-center space-x-2 text-gray-500">
          <Clock className="w-5 h-5 animate-spin" />
          <span>Loading Hall of Fame...</span>
        </div>
      </motion.div>
    )
  }

  if (claims.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-6 shadow-xl"
      >
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <h2 className="text-2xl font-bold text-gray-900">Hall of Fame</h2>
        </div>
        <div className="text-center text-gray-500 py-8">
          <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No claims yet. Be the first!</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-3xl p-6 shadow-xl"
    >
      <div className="flex items-center justify-center space-x-3 mb-6">
        <Trophy className="w-6 h-6 text-yellow-500" />
        <h2 className="text-2xl font-bold text-gray-900">Hall of Fame</h2>
        <Trophy className="w-6 h-6 text-yellow-500" />
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        <AnimatePresence mode="popLayout">
          {claims.map((claim, index) => (
            <motion.div
              key={claim.txHash}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100 hover:border-blue-300 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  {/* Rank Badge */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    index === 0 ? 'bg-yellow-400 text-yellow-900' :
                    index === 1 ? 'bg-gray-300 text-gray-700' :
                    index === 2 ? 'bg-orange-400 text-orange-900' :
                    'bg-blue-200 text-blue-700'
                  }`}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                  </div>
                  
                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <p className="font-semibold text-gray-900 truncate">
                        {claim.farcasterUser?.displayName || 'Anonymous'}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600">
                      @{claim.farcasterUser?.username || 'unknown'}
                    </p>
                  </div>
                </div>
                
                {/* Time */}
                <div className="flex items-center space-x-2 text-sm text-gray-500 flex-shrink-0">
                  <Clock className="w-4 h-4" />
                  <span>
                    {formatDistance(new Date(claim.timestamp), new Date(), { addSuffix: true })}
                  </span>
                </div>
              </div>
              
              {/* Transaction Hash */}
              <div className="mt-2 pt-2 border-t border-blue-200">
                <a
                  href={`https://basescan.org/tx/${claim.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 font-mono truncate block"
                >
                  {claim.txHash}
                </a>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-200 text-center">
        <p className="text-sm text-gray-500">
          Showing latest {claims.length} claim{claims.length !== 1 ? 's' : ''} from Farcaster users
        </p>
      </div>
    </motion.div>
  )
}
