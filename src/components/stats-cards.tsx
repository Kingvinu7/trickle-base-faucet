'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Users } from 'lucide-react'
import { memo } from 'react'

interface StatsCardsProps {
  totalClaims: number
  dailyClaims: number
  isLoading?: boolean
}

export const StatsCards = memo(function StatsCards({ totalClaims, dailyClaims, isLoading }: StatsCardsProps) {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="grid grid-cols-2 gap-4"
    >
      {/* Total Claims */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="glass rounded-2xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <div className="flex items-center justify-center mb-2">
          <Users className="w-5 h-5 text-trickle-blue mr-2" />
        </div>
        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        ) : (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6, type: 'spring' }}
              className="text-2xl font-bold text-trickle-blue mb-1"
            >
              {formatNumber(totalClaims)}
            </motion.div>
            <div className="text-xs text-gray-500 font-medium">
              Last 24h
            </div>
          </>
        )}
      </motion.div>

      {/* Daily Claims */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="glass rounded-2xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <div className="flex items-center justify-center mb-2">
          <TrendingUp className="w-5 h-5 text-trickle-blue mr-2" />
        </div>
        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        ) : (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.7, type: 'spring' }}
              className="text-2xl font-bold text-trickle-blue mb-1"
            >
              {formatNumber(dailyClaims)}
            </motion.div>
            <div className="text-xs text-gray-500 font-medium">
              Recent
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  )
})