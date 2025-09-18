'use client'

import { motion } from 'framer-motion'
import { Clock, Fuel, Heart } from 'lucide-react'

export function Footer() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1 }}
      className="text-center space-y-3"
    >
      {/* Info */}
      <div className="flex items-center justify-center space-x-4 text-white/80 text-sm">
        <div className="flex items-center space-x-1">
          <Clock className="w-4 h-4" />
          <span>24 hour cooldown</span>
        </div>
        <div className="w-1 h-1 bg-white/50 rounded-full"></div>
        <div className="flex items-center space-x-1">
          <Fuel className="w-4 h-4" />
          <span>You pay gas fees</span>
        </div>
      </div>

      {/* Network */}
      <div className="text-white/60 text-sm">
        Powered by Base Network
      </div>

      {/* Made with love */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 1.2, type: 'spring' }}
        className="flex items-center justify-center space-x-1 text-white/50 text-xs"
      >
        <span>Built with</span>
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
          }}
          transition={{ 
            duration: 1,
            repeat: Infinity,
            repeatDelay: 2
          }}
        >
          <Heart className="w-3 h-3 fill-red-400 text-red-400" />
        </motion.div>
        <span>for the Base ecosystem</span>
      </motion.div>
    </motion.div>
  )
}