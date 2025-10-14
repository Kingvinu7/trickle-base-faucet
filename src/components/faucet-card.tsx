'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAccount, useDisconnect, useSwitchChain } from 'wagmi'
import { useAppKit } from '@reown/appkit/react'
import { Wallet, Coins, LogOut, AlertCircle, CheckCircle, Loader2, Sparkles } from 'lucide-react'
import { base } from '@reown/appkit/networks'
import { useFaucetClaim } from '@/hooks/use-faucet-claim'
import { useEligibility } from '@/hooks/use-eligibility'
import { formatAddress } from '@/lib/utils'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

export function FaucetCard() {
  const { address, isConnected, chain } = useAccount()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()
  const { open } = useAppKit()
  
  const [claimProgress, setClaimProgress] = useState(0)
  
  const { data: eligibility, isLoading: eligibilityLoading, refetch: refetchEligibility } = useEligibility(address)
  const { mutate: claimTokens, isPending: isClaimPending } = useFaucetClaim()

  const isWrongNetwork = isConnected && chain?.id !== base.id
  // Allow claiming if eligibility is undefined (API issues) or true, but not when explicitly false with a real cooldown message
  const hasRealCooldown = eligibility?.eligible === false && 
    (eligibility?.message?.includes('Please wait') || 
     eligibility?.message?.includes('more hours before claiming') || 
     eligibility?.message?.includes('hours before claiming again'))
  const canClaim = !isWrongNetwork && !isClaimPending && !eligibilityLoading && !hasRealCooldown
  
  const handleConnect = async () => {
    try {
      open()
    } catch (error) {
      console.error('Wallet connection error:', error)
      toast.error('Failed to open wallet modal. Please try again.')
    }
  }

  const handleDisconnect = () => {
    disconnect()
    toast.success('Wallet disconnected')
  }

  const handleSwitchNetwork = async () => {
    try {
      await switchChain({ chainId: base.id })
      toast.success('Switched to Base network')
    } catch (error) {
      toast.error('Failed to switch network')
    }
  }

  const handleClaim = async () => {
    if (!address || !canClaim) {
      console.log('Cannot claim:', { address, canClaim, eligibility })
      return
    }

    console.log('Starting claim process for address:', address)
    setClaimProgress(25)

    try {
      claimTokens(address, {
        onSuccess: (txHash) => {
          console.log('Claim successful:', txHash)
          setClaimProgress(100)
          toast.success(
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <div>
                <div className="font-medium">Claim successful!</div>
                <div className="text-sm text-gray-500">
                  Transaction: {formatAddress(txHash)}
                </div>
              </div>
            </div>
          )
          refetchEligibility()
          setTimeout(() => setClaimProgress(0), 3000)
        },
        onError: (error) => {
          console.error('Claim failed:', error)
          toast.error(error.message || 'Claim failed. Please try again.')
          setClaimProgress(0)
        }
      })
      
      // Update progress to show transaction is being prepared
      setClaimProgress(50)
    } catch (error) {
      console.error('Failed to initiate claim:', error)
      toast.error('Failed to initiate claim. Please try again.')
      setClaimProgress(0)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className="glass rounded-3xl p-6 shadow-xl space-y-6"
    >
      <AnimatePresence mode="wait">
        {!isConnected ? (
          // Connect Wallet State
          <motion.div
            key="connect"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center space-y-4"
          >
            <Button
              onClick={handleConnect}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-trickle-blue to-trickle-blue-light hover:shadow-lg transition-all duration-300"
            >
              <Wallet className="w-5 h-5 mr-2" />
              Connect Wallet
            </Button>
          </motion.div>
        ) : isWrongNetwork ? (
          // Wrong Network State
          <motion.div
            key="wrong-network"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center space-y-4"
          >
            <div className="flex items-center justify-center p-4 bg-orange-50 rounded-2xl">
              <AlertCircle className="w-5 h-5 text-orange-500 mr-2" />
              <span className="text-orange-700 font-medium">
                Please switch to Base network
              </span>
            </div>
            
            <Button
              onClick={handleSwitchNetwork}
              variant="outline"
              className="w-full h-12"
            >
              Switch to Base
            </Button>
            
            <Button
              onClick={handleDisconnect}
              variant="ghost"
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Disconnect
            </Button>
          </motion.div>
        ) : (
          // Connected State
          <motion.div
            key="connected"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="space-y-6"
          >
            {/* Wallet Info */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-1">Connected Wallet</div>
                <div className="font-mono font-semibold text-trickle-blue">
                  {formatAddress(address!)}
                </div>
              </div>
            </div>

            {/* Limited Time Promo Banner */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="relative overflow-hidden"
            >
              <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 rounded-2xl p-4 border-2 border-amber-200 shadow-md">
                <div className="flex items-center justify-center space-x-2">
                  <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                  <div className="text-center">
                    <div className="font-bold text-amber-900 text-lg">
                      🎉 4x More ETH - Limited Time! 🎉
                    </div>
                    <div className="text-sm text-amber-700 mt-1">
                      Now claiming <span className="font-semibold">$0.1</span> instead of $0.025
                    </div>
                  </div>
                  <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                </div>
              </div>
              {/* Animated shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-shimmer pointer-events-none" />
            </motion.div>

            {/* Eligibility Status */}
            {eligibilityLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span className="text-gray-600">Checking eligibility...</span>
              </div>
            ) : eligibility && !eligibility.eligible ? (
              <div className={`border rounded-2xl p-4 ${
                eligibility?.message?.includes('Connection issue') || 
                eligibility?.message?.includes('Unable to verify') ||
                eligibility?.message?.includes('Please try again') ||
                eligibility?.message?.includes('Error checking') ||
                !eligibility?.message
                  ? 'bg-blue-50 border-blue-200' // Connection issues get blue styling
                  : 'bg-yellow-50 border-yellow-200' // Actual cooldown gets yellow styling
              }`}>
                <div className="flex items-center justify-center">
                  <AlertCircle className={`w-5 h-5 mr-2 ${
                    eligibility?.message?.includes('Connection issue') || 
                eligibility?.message?.includes('Unable to verify') ||
                eligibility?.message?.includes('Please try again') ||
                eligibility?.message?.includes('Error checking') ||
                !eligibility?.message
                      ? 'text-blue-500'
                      : 'text-yellow-500'
                  }`} />
                  <div className="text-center">
                    <div className={`font-medium ${
                      eligibility?.message?.includes('Connection issue') || 
                eligibility?.message?.includes('Unable to verify') ||
                eligibility?.message?.includes('Please try again') ||
                eligibility?.message?.includes('Error checking') ||
                !eligibility?.message
                        ? 'text-blue-800'
                        : 'text-yellow-800'
                    }`}>
                      {eligibility?.message?.includes('Connection issue') || eligibility?.message?.includes('Unable to verify')
                        ? 'Connection Issue'
                        : 'Cooldown Active'
                      }
                    </div>
                    <div className={`text-sm ${
                      eligibility?.message?.includes('Connection issue') || 
                eligibility?.message?.includes('Unable to verify') ||
                eligibility?.message?.includes('Please try again') ||
                eligibility?.message?.includes('Error checking') ||
                !eligibility?.message
                        ? 'text-blue-600'
                        : 'text-yellow-600'
                    }`}>
                      {eligibility?.message || 'Please wait before claiming again'}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Progress Bar */}
            {claimProgress > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <Progress value={claimProgress} className="h-2" />
                <div className="text-center text-sm text-gray-600">
                  {claimProgress < 100 ? 'Processing...' : 'Complete!'}
                </div>
              </motion.div>
            )}

            {/* Claim Button */}
            <Button
              onClick={handleClaim}
              disabled={!canClaim}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-trickle-blue to-trickle-blue-light hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {eligibilityLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Checking...
                </>
              ) : isClaimPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : canClaim ? (
                <>
                  <Coins className="w-5 h-5 mr-2" />
                  Claim ETH
                </>
              ) : hasRealCooldown ? (
                <>
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Cooldown Active
                </>
              ) : isWrongNetwork ? (
                <>
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Wrong Network
                </>
              ) : (
                <>
                  <Coins className="w-5 h-5 mr-2" />
                  Claim ETH
                </>
              )}
            </Button>

            {/* Disconnect Button */}
            <Button
              onClick={handleDisconnect}
              variant="ghost"
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Disconnect Wallet
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}