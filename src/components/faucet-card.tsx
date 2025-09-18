'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAccount, useDisconnect, useSwitchChain } from 'wagmi'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { Wallet, Coins, LogOut, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { base } from 'wagmi/chains'
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
  const { open } = useWeb3Modal()
  
  const [claimProgress, setClaimProgress] = useState(0)
  
  const { data: eligibility, isLoading: eligibilityLoading, refetch: refetchEligibility } = useEligibility(address)
  const { mutate: claimTokens, isPending: isClaimPending } = useFaucetClaim()

  const isWrongNetwork = isConnected && chain?.id !== base.id
  const canClaim = eligibility?.eligible && !isWrongNetwork && !isClaimPending
  
  const handleConnect = async () => {
    try {
      await open()
    } catch (error) {
      toast.error('Failed to open wallet modal')
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
    if (!address || !canClaim) return

    // Simulate progress steps
    const progressSteps = [
      { progress: 25, message: 'Checking eligibility...' },
      { progress: 50, message: 'Preparing transaction...' },
      { progress: 75, message: 'Please confirm in wallet...' },
      { progress: 90, message: 'Transaction sent...' },
      { progress: 100, message: 'Success!' }
    ]

    let currentStep = 0
    const progressInterval = setInterval(() => {
      if (currentStep < progressSteps.length) {
        const step = progressSteps[currentStep]
        setClaimProgress(step.progress)
        if (currentStep === 0) {
          // Start the actual claim process
          claimTokens(address, {
            onSuccess: (txHash) => {
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
              setTimeout(() => setClaimProgress(0), 2000)
            },
            onError: (error) => {
              toast.error(error.message)
              setClaimProgress(0)
            }
          })
        }
        currentStep++
      } else {
        clearInterval(progressInterval)
      }
    }, 1000)
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

            {/* Eligibility Status */}
            {eligibilityLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span className="text-gray-600">Checking eligibility...</span>
              </div>
            ) : !eligibility?.eligible ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
                <div className="flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
                  <div className="text-center">
                    <div className="font-medium text-yellow-800">
                      Cooldown Active
                    </div>
                    <div className="text-sm text-yellow-600">
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
              {isClaimPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : canClaim ? (
                <>
                  <Coins className="w-5 h-5 mr-2" />
                  Claim ETH
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 mr-2" />
                  {!eligibility?.eligible ? 'Cooldown Active' : 'Cannot Claim'}
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