'use client'

import { FaucetCard } from '@/components/faucet-card'
import { MonFaucetCard } from '@/components/mon-faucet-card'
import { StatsCards } from '@/components/stats-cards'
import { HallOfFame } from '@/components/hall-of-fame'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useStats } from '@/hooks/use-stats'
import { motion } from 'framer-motion'
import { useAccount } from 'wagmi'
import { useState, useEffect } from 'react'
import { MON_CONFIG } from '@/config/constants'
import { Coins, Sparkles } from 'lucide-react'

type FaucetType = 'base' | 'mon'

export default function HomePage() {
  const { data: stats, isLoading: statsLoading } = useStats()
  const { address, isConnected } = useAccount()
  const [selectedFaucet, setSelectedFaucet] = useState<FaucetType>('base')

  useEffect(() => {
    if (isConnected && address) {
      console.log('User connected:', address)
    }
  }, [isConnected, address])

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

          {/* Faucet Selector Tabs - Only show if MON is enabled */}
          {MON_CONFIG.enabled && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="glass rounded-2xl p-2 shadow-lg"
            >
              <div className="grid grid-cols-2 gap-2">
                {/* Base ETH Tab */}
                <button
                  onClick={() => setSelectedFaucet('base')}
                  className={`relative px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${
                    selectedFaucet === 'base'
                      ? 'bg-gradient-to-r from-trickle-blue to-trickle-blue-light text-white shadow-lg scale-105'
                      : 'bg-white/50 text-gray-600 hover:bg-white/70'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <Coins className={`w-6 h-6 ${selectedFaucet === 'base' ? 'text-white' : 'text-blue-500'}`} />
                    <div>
                      <div className="text-sm font-bold">Base ETH</div>
                      <div className={`text-xs ${selectedFaucet === 'base' ? 'text-blue-100' : 'text-gray-500'}`}>
                        $0.03 • 24h cooldown
                      </div>
                    </div>
                  </div>
                  {selectedFaucet === 'base' && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-trickle-blue to-trickle-blue-light rounded-xl -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>

                {/* MON Token Tab */}
                <button
                  onClick={() => setSelectedFaucet('mon')}
                  className={`relative px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${
                    selectedFaucet === 'mon'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                      : 'bg-white/50 text-gray-600 hover:bg-white/70'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <Sparkles className={`w-6 h-6 ${selectedFaucet === 'mon' ? 'text-white' : 'text-purple-500'}`} />
                    <div>
                      <div className="text-sm font-bold">MON Token</div>
                      <div className={`text-xs ${selectedFaucet === 'mon' ? 'text-purple-100' : 'text-gray-500'}`}>
                        0.1 MON • 10x/day
                      </div>
                    </div>
                  </div>
                  {selectedFaucet === 'mon' && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* Faucet Cards - Show selected one */}
          {MON_CONFIG.enabled ? (
            <>
              {selectedFaucet === 'base' && <FaucetCard />}
              {selectedFaucet === 'mon' && <MonFaucetCard />}
            </>
          ) : (
            <FaucetCard />
          )}

          {/* Hall of Fame - Recent Claimers */}
          <HallOfFame />

          {/* Footer */}
          <Footer />
        </motion.div>
      </div>
    </div>
  )
}