'use client'

import { FaucetCard } from '@/components/faucet-card'
import { StatsCards } from '@/components/stats-cards'
import { HallOfFame } from '@/components/hall-of-fame'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useStats } from '@/hooks/use-stats'
import { motion } from 'framer-motion'
import { useAccount } from 'wagmi'
import { useEffect } from 'react'

export default function HomePage() {
  const { data: stats, isLoading: statsLoading } = useStats()
  const { address, isConnected } = useAccount()

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

          {/* Main Faucet Card */}
          <FaucetCard />

          {/* Hall of Fame - Recent Claimers */}
          <HallOfFame />

          {/* Footer */}
          <Footer />
        </motion.div>
      </div>
    </div>
  )
}