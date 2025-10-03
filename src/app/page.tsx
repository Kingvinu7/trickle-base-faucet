'use client'

import { FaucetCard } from '@/components/faucet-card'
import { StatsCards } from '@/components/stats-cards'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useStats } from '@/hooks/use-stats'
import { useFarcasterMiniappContext } from '@/components/farcaster-miniapp-provider'
import { motion } from 'framer-motion'

export default function HomePage() {
  const { data: stats, isLoading: statsLoading } = useStats()
  const { isReady, error, isInFarcaster } = useFarcasterMiniappContext()

  return (
    <div className="min-h-screen animated-gradient">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto space-y-6"
        >
          {/* Header */}
          <Header />
          
          {/* Farcaster Miniapp Status */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isReady ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <span className="text-sm text-blue-800">
                {isReady ? 'Farcaster Miniapp Ready' : 'Initializing...'}
              </span>
              {error && (
                <span className="text-sm text-red-600 ml-2">
                  Error: {error}
                </span>
              )}
            </div>
            <div className="text-xs text-blue-600 mt-1">
              {isInFarcaster ? 'Running in Farcaster' : 'Development Mode'}
            </div>
          </div>
          
          {/* AppKit Button Example */}
          <div className="text-center">
            <appkit-button />
          </div>

          {/* Stats */}
          <StatsCards 
            totalClaims={stats?.totalClaims || 0}
            dailyClaims={stats?.claimsLast24h || 0}
            isLoading={statsLoading}
          />

          {/* Main Faucet Card */}
          <FaucetCard />

          {/* Footer */}
          <Footer />
        </motion.div>
      </div>
    </div>
  )
}