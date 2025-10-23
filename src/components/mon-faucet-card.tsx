'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAccount } from 'wagmi'
import { Coins, Loader2, CheckCircle, AlertCircle, Sparkles } from 'lucide-react'
import { useMonClaim } from '@/hooks/use-mon-claim'
import { useMonStats } from '@/hooks/use-mon-stats'
import { useFarcasterMiniappContext } from '@/components/farcaster-miniapp-provider'
import { useFollowCheck } from '@/hooks/use-follow-check'
import { useSpamLabelCheck } from '@/hooks/use-spam-label-check'
import { formatAddress } from '@/lib/utils'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { MON_CONFIG, FARCASTER_CONFIG } from '@/config/constants'

export function MonFaucetCard() {
  const { address, isConnected } = useAccount()
  const { isAllowedPlatform, farcasterUser } = useFarcasterMiniappContext()
  
  const [claimProgress, setClaimProgress] = useState(0)
  
  const { data: monStats, isLoading: statsLoading, refetch: refetchStats } = useMonStats(address)
  const { mutate: claimMon, isPending: isClaimPending } = useMonClaim(farcasterUser || undefined)
  const { data: followCheck } = useFollowCheck(farcasterUser?.fid, FARCASTER_CONFIG.followRequired)
  const { data: spamLabelCheck } = useSpamLabelCheck(farcasterUser?.fid, FARCASTER_CONFIG.spamLabelRequired)

  const isFollowing = followCheck?.isFollowing ?? (!FARCASTER_CONFIG.followRequired)
  const hasSpamLabel2 = spamLabelCheck?.hasSpamLabel2 ?? (!FARCASTER_CONFIG.spamLabelRequired)
  
  const canClaim = isConnected && 
                   !isClaimPending && 
                   !statsLoading && 
                   isAllowedPlatform && 
                   isFollowing && 
                   hasSpamLabel2 &&
                   monStats?.canClaimNow

  const handleClaim = async () => {
    if (!address || !canClaim) {
      console.log('Cannot claim MON:', { address, canClaim, monStats })
      return
    }

    console.log('Starting MON claim process for address:', address)
    setClaimProgress(25)

    try {
      claimMon(address, {
        onSuccess: (txHash) => {
          console.log('MON claim successful:', txHash)
          setClaimProgress(100)
          toast.success(
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <div>
                <div className="font-medium">MON claimed successfully!</div>
                <div className="text-sm text-gray-500">
                  Transaction: {formatAddress(txHash)}
                </div>
              </div>
            </div>
          )
          refetchStats()
          setTimeout(() => setClaimProgress(0), 3000)
        },
        onError: (error) => {
          console.error('MON claim failed:', error)
          toast.error(error.message || 'MON claim failed. Please try again.')
          setClaimProgress(0)
        }
      })
      
      setClaimProgress(50)
    } catch (error) {
      console.error('Failed to initiate MON claim:', error)
      toast.error('Failed to initiate MON claim. Please try again.')
      setClaimProgress(0)
    }
  }

  // Don't show if MON faucet is not enabled
  if (!MON_CONFIG.enabled) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.9 }}
      className="glass rounded-3xl p-6 shadow-xl space-y-6"
    >
      <AnimatePresence mode="wait">
        {!isConnected ? (
          // Not Connected State
          <motion.div
            key="not-connected"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center space-y-4"
          >
            <div className="flex items-center justify-center p-4 bg-purple-50 rounded-2xl">
              <Sparkles className="w-5 h-5 text-purple-500 mr-2" />
              <span className="text-purple-700 font-medium">
                Connect wallet to claim MON
              </span>
            </div>
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
            {/* MON Info Banner */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 rounded-2xl p-4 border-2 border-purple-200 shadow-md"
            >
              <div className="flex items-center justify-center space-x-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <div className="text-center">
                  <div className="font-bold text-purple-900 text-base">
                    Claim MON Testnet Tokens
                  </div>
                  <div className="text-sm text-purple-700 mt-1">
                    Get <span className="font-semibold">{MON_CONFIG.claimAmount} MON</span> per claim • Up to <span className="font-semibold">{MON_CONFIG.maxClaimsPerDay} claims</span> per day
                  </div>
                </div>
                <Sparkles className="w-5 h-5 text-purple-500" />
              </div>
            </motion.div>

            {/* MON Stats Display */}
            {statsLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span className="text-gray-600">Loading MON stats...</span>
              </div>
            ) : monStats ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100">
                  <div className="text-xs text-purple-600 font-medium mb-1">Claims Today</div>
                  <div className="text-2xl font-bold text-purple-900">
                    {monStats.claimsMadeToday}/{MON_CONFIG.maxClaimsPerDay}
                  </div>
                  <div className="text-xs text-purple-600 mt-1">
                    {monStats.remainingClaims} remaining
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-4 border border-pink-100">
                  <div className="text-xs text-pink-600 font-medium mb-1">MON Claimed</div>
                  <div className="text-2xl font-bold text-pink-900">
                    {monStats.monClaimedToday.toFixed(1)}/{MON_CONFIG.dailyLimit}
                  </div>
                  <div className="text-xs text-pink-600 mt-1">
                    {monStats.remainingMON.toFixed(1)} MON left
                  </div>
                </div>
              </div>
            ) : null}

            {/* Daily Limit Reached Message */}
            {monStats && !monStats.canClaimNow && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <div className="flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-amber-500 mr-2" />
                  <div className="text-center">
                    <div className="font-medium text-amber-800">
                      Daily Limit Reached
                    </div>
                    <div className="text-sm text-amber-600">
                      You've used all {MON_CONFIG.maxClaimsPerDay} claims for today. Come back tomorrow!
                    </div>
                  </div>
                </div>
              </div>
            )}

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
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!isAllowedPlatform ? (
                <>
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Platform Restricted
                </>
              ) : statsLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Checking...
                </>
              ) : isClaimPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Claiming...
                </>
              ) : !monStats?.canClaimNow ? (
                <>
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Daily Limit Reached
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Claim {MON_CONFIG.claimAmount} MON
                </>
              )}
            </Button>

            <div className="text-center text-xs text-gray-500">
              {MON_CONFIG.network} • Max {MON_CONFIG.dailyLimit} MON per day
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
