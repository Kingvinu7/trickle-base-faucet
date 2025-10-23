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
import { MON_CONFIG, monadTestnet } from '@/config/constants'
import { Coins, Sparkles } from 'lucide-react'
import { base } from '@reown/appkit/networks'
import { useSwitchChain } from 'wagmi'
import { toast } from 'sonner'

type FaucetType = 'base' | 'mon'

export default function HomePage() {
  const { data: stats, isLoading: statsLoading } = useStats()
  const { address, isConnected, chain } = useAccount()
  const { switchChain } = useSwitchChain()
  const [selectedFaucet, setSelectedFaucet] = useState<FaucetType>('base')

  useEffect(() => {
    if (isConnected && address) {
      console.log('User connected:', address)
    }
  }, [isConnected, address])

  // Handle faucet selection and chain switching
  const handleFaucetSelect = async (faucet: FaucetType) => {
    setSelectedFaucet(faucet)
    
    if (!isConnected) return
    
    try {
      if (faucet === 'base' && chain?.id !== base.id) {
        await switchChain({ chainId: base.id })
        toast.success('Switched to Base network')
      } else if (faucet === 'mon' && chain?.id !== monadTestnet.id) {
        console.log('Attempting to switch to Monad Testnet (10143)...')
        
        // Try to switch to Monad Testnet
        try {
          await switchChain({ chainId: monadTestnet.id })
          toast.success('Switched to Monad Testnet')
        } catch (switchError: any) {
          console.error('Switch failed:', switchError)
          
          // If network not found, try to add it first
          if (switchError?.code === 4902 || switchError?.message?.includes('Unrecognized chain')) {
            console.log('Network not in wallet, attempting to add...')
            
            // Try to add the network to wallet
            try {
              if (typeof window !== 'undefined' && (window as any).ethereum) {
                await (window as any).ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [{
                    chainId: '0x279f', // 10143 in hex
                    chainName: 'Monad Testnet',
                    nativeCurrency: {
                      name: 'MON',
                      symbol: 'MON',
                      decimals: 18
                    },
                    rpcUrls: ['https://testnet-rpc.monad.xyz'],
                    blockExplorerUrls: ['https://explorer.monad.xyz']
                  }]
                })
                toast.success('Added Monad Testnet! Switching now...')
                
                // Try switching again after adding
                await switchChain({ chainId: monadTestnet.id })
                toast.success('Switched to Monad Testnet')
              }
            } catch (addError) {
              console.error('Failed to add network:', addError)
              toast.error('Please add Monad Testnet to your wallet manually')
            }
          } else {
            throw switchError
          }
        }
      }
    } catch (error: any) {
      console.error('Failed to switch chain:', error)
      toast.error('Failed to switch network. Please add and switch to Monad Testnet manually in your wallet.')
    }
  }

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
              className="space-y-3"
            >
              {/* Instruction Text */}
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-800">
                  Select Your Preferred Token
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Choose which token you'd like to claim
                </p>
              </div>

              {/* Tab Selector */}
              <div className="glass rounded-2xl p-2 shadow-lg">
              <div className="grid grid-cols-2 gap-2">
                {/* Base ETH Tab */}
                <button
                  onClick={() => handleFaucetSelect('base')}
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

                {/* Monad Testnet Tab */}
                <button
                  onClick={() => handleFaucetSelect('mon')}
                  className={`relative px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${
                    selectedFaucet === 'mon'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                      : 'bg-white/50 text-gray-600 hover:bg-white/70'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <Sparkles className={`w-6 h-6 ${selectedFaucet === 'mon' ? 'text-white' : 'text-purple-500'}`} />
                    <div>
                      <div className="text-sm font-bold">Monad Testnet</div>
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