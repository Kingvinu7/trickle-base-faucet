'use client'

import { motion } from 'framer-motion'
import { Droplets } from 'lucide-react'

export function Header() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="text-center space-y-4 glass rounded-3xl p-8 shadow-xl"
    >
      {/* Logo */}
      <motion.div
        initial={{ rotate: -10 }}
        animate={{ rotate: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mx-auto w-16 h-16 bg-gradient-to-br from-trickle-blue to-trickle-blue-light rounded-2xl flex items-center justify-center shadow-lg"
        role="img"
        aria-label="Trickle faucet logo"
      >
        <Droplets className="w-8 h-8 text-white" aria-hidden="true" />
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-4xl font-bold gradient-text"
        id="app-title"
      >
        Trickle
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="text-gray-600 leading-relaxed"
      >
        Get{' '}
        <span className="font-semibold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
          $0.1 worth of ETH
        </span>{' '}
        for gas fees on Base mainnet
      </motion.p>
      
      {/* Limited Time Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="inline-block"
      >
        <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-2 rounded-full shadow-lg animate-pulse">
          <div className="text-sm font-bold">⚡ 4X LIMITED TIME OFFER ⚡</div>
          <div className="text-xs font-medium mt-0.5">For Farcaster users only</div>
        </div>
      </motion.div>
    </motion.div>
  )
}