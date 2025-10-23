'use client'

import { useState } from 'react'
import { useAccount, useSwitchChain } from 'wagmi'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check, Network } from 'lucide-react'
import { networks, getNetworkName } from '@/lib/reownConfig'
import { Button } from './ui/button'

export function NetworkSelector() {
  const { chain, isConnected } = useAccount()
  const { switchChain, isPending } = useSwitchChain()
  const [isOpen, setIsOpen] = useState(false)

  if (!isConnected) return null

  const currentNetwork = chain
    ? networks.find(n => n.id === chain.id)
    : null

  const handleSwitch = async (chainId: number) => {
    try {
      await switchChain({ chainId })
      setIsOpen(false)
    } catch (error) {
      console.error('Failed to switch network:', error)
    }
  }

  return (
    <div className="relative">
      {/* Current Network Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="flex items-center gap-2 bg-white/80 backdrop-blur-sm hover:bg-white/90 border-2 border-gray-200"
        disabled={isPending}
      >
        <Network className="w-4 h-4" />
        <span className="font-medium">
          {isPending ? 'Switching...' : currentNetwork?.name || 'Unknown Network'}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 right-0 w-64 bg-white rounded-xl shadow-2xl border-2 border-gray-200 overflow-hidden z-50"
          >
            <div className="p-2">
              <div className="text-xs font-semibold text-gray-500 px-3 py-2 uppercase tracking-wide">
                Select Network
              </div>
              
              {networks.map((network) => {
                const isActive = chain?.id === network.id
                const isTestnet = 'testnet' in network && network.testnet

                return (
                  <button
                    key={network.id}
                    onClick={() => handleSwitch(network.id)}
                    disabled={isActive || isPending}
                    className={`
                      w-full flex items-center justify-between px-3 py-2.5 rounded-lg
                      transition-all duration-150
                      ${isActive 
                        ? 'bg-blue-50 text-blue-700 cursor-default' 
                        : 'hover:bg-gray-50 text-gray-700'
                      }
                      ${isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      {/* Network Icon/Indicator */}
                      <div className={`
                        w-2.5 h-2.5 rounded-full
                        ${isActive ? 'bg-green-500' : 'bg-gray-300'}
                      `} />
                      
                      <div className="text-left">
                        <div className="font-medium flex items-center gap-2">
                          {network.name}
                          {isTestnet && (
                            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                              Testnet
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          Chain ID: {network.id}
                        </div>
                      </div>
                    </div>

                    {isActive && (
                      <Check className="w-4 h-4 text-blue-600" />
                    )}
                  </button>
                )
              })}
            </div>

            <div className="border-t border-gray-200 p-2 bg-gray-50">
              <div className="text-xs text-gray-500 px-3 py-1">
                💡 Tip: Switch networks to use different faucets
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
