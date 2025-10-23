'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAccount, useSwitchChain } from 'wagmi'
import { Coins, Loader2, CheckCircle, AlertCircle, Sparkles, UserPlus, ExternalLink } from 'lucide-react'
import { useMonClaim } from '@/hooks/use-mon-claim'
import { useMonStats } from '@/hooks/use-mon-stats'
import { useFarcasterMiniappContext } from '@/components/farcaster-miniapp-provider'
import { useFollowCheck } from '@/hooks/use-follow-check'
import { useSpamLabelCheck } from '@/hooks/use-spam-label-check'
import { formatAddress } from '@/lib/utils'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { MON_CONFIG, FARCASTER_CONFIG, monadTestnet } from '@/config/constants'

export function MonFaucetCard() {
  const { address, isConnected, chain } = useAccount()
  const { switchChain } = useSwitchChain()
  const { isAllowedPlatform, farcasterUser } = useFarcasterMiniappContext()
  
  const [claimProgress, setClaimProgress] = useState(0)
  
  const { data: monStats, isLoading: statsLoading, refetch: refetchStats } = useMonStats(address)
  const { mutate: claimMon, isPending: isClaimPending } = useMonClaim(farcasterUser || undefined)
  const { data: followCheck, isLoading: followCheckLoading, refetch: refetchFollow } = useFollowCheck(farcasterUser?.fid, FARCASTER_CONFIG.followRequired)
  const { data: spamLabelCheck, isLoading: spamLabelCheckLoading } = useSpamLabelCheck(farcasterUser?.fid, FARCASTER_CONFIG.spamLabelRequired)

  const isFollowing = followCheck?.isFollowing ?? (!FARCASTER_CONFIG.followRequired)
  const hasSpamLabel2 = spamLabelCheck?.hasSpamLabel2 ?? (!FARCASTER_CONFIG.spamLabelRequired)
  const isWrongNetwork = isConnected && chain?.id !== monadTestnet.id
  
  // Debug logging
  console.log('MON Faucet Network Check:', {
    isConnected,
    currentChainId: chain?.id,
    currentChainName: chain?.name,
    expectedChainId: monadTestnet.id,
    expectedChainName: monadTestnet.name,
    isWrongNetwork
  })
  
  // Allow claim if all requirements met, even if contract is not deployed yet
  // Contract will handle the actual claim validation
  const canClaim = isConnected && 
                   !isClaimPending && 
                   !statsLoading && 
                   isAllowedPlatform && 
                   isFollowing && 
                   hasSpamLabel2 &&
                   !isWrongNetwork &&
                   (monStats?.canClaimNow ?? true) // Default to true if stats not available
  
  const handleSwitchNetwork = async () => {
    try {
      console.log('Manual switch to Monad Testnet (10143)...')
      await switchChain({ chainId: monadTestnet.id })
      toast.success('Switched to Monad Testnet')
    } catch (error: any) {
      console.error('Manual switch failed:', error)
      
      // If network not found, try to add it
      if (error?.code === 4902 || error?.message?.includes('Unrecognized chain')) {
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
            toast.success('Added Monad Testnet! Please switch to it.')
          }
        } catch (addError) {
          console.error('Failed to add network:', addError)
          toast.error('Please add Monad Testnet manually:\nChain ID: 10143\nRPC: https://testnet-rpc.monad.xyz')
        }
      } else {
        toast.error('Failed to switch network. Please switch manually in your wallet.')
      }
    }
  }

  const handleClaim = async () => {
    if (!address || !canClaim) {
      console.log('Cannot claim MON:', { 
        address, 
        canClaim, 
        isConnected,
        isClaimPending,
        statsLoading,
        isAllowedPlatform,
        isFollowing,
        hasSpamLabel2,
        monStatsCanClaim: monStats?.canClaimNow,
        monStats 
      })
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

            {/* Wrong Network Notice */}
            {isWrongNetwork && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-4 border-2 border-orange-200"
              >
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-bold text-orange-900 mb-1">
                      Wrong Network
                    </div>
                    <div className="text-sm text-orange-700 mb-3">
                      Please switch to <span className="font-semibold">Monad Testnet</span> to claim MON tokens
                    </div>
                    <Button
                      onClick={handleSwitchNetwork}
                      className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white"
                    >
                      Switch to Monad Testnet
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Platform Restriction Notice */}
            {!isAllowedPlatform && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-4 border-2 border-red-200"
              >
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-red-900 mb-1">
                      Access Restricted
                    </div>
                    <div className="text-sm text-red-700">
                      This faucet is only available for <span className="font-semibold">Farcaster</span> users. Please access it through the Farcaster app to claim MON.
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Neynar Score Requirement */}
            {FARCASTER_CONFIG.spamLabelRequired && isAllowedPlatform && farcasterUser && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl p-4 border-2 ${
                  hasSpamLabel2 
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                    : 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200'
                }`}
              >
                {spamLabelCheckLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                    <span className="text-sm text-gray-600">Checking account reputation...</span>
                  </div>
                ) : spamLabelCheck?.apiError || spamLabelCheck?.quotaExceeded ? (
                  <div className="flex items-center justify-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                    <div className="text-sm text-amber-800">
                      Reputation check temporarily unavailable - You can still claim!
                    </div>
                  </div>
                ) : hasSpamLabel2 ? (
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div className="text-sm font-semibold text-green-800">
                      Verified Account ✓
                      {spamLabelCheck?.score && (
                        <span className="text-xs ml-1 text-green-600">
                          (Score: {spamLabelCheck.score.toFixed(2)})
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-bold text-red-900 mb-1">
                          Reputation Too Low
                        </div>
                        <div className="text-sm text-red-700 mb-2">
                          Your account needs a minimum Neynar score of {spamLabelCheck?.minimumScore || 0.5} to claim MON.
                          {spamLabelCheck?.score !== undefined && (
                            <span className="block mt-1">
                              Current score: <span className="font-semibold">{spamLabelCheck.score.toFixed(2)}</span>
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-red-600">
                          Neynar score reflects your account's activity and reputation. Active engagement on Farcaster will improve your score over time.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Follow Requirement */}
            {FARCASTER_CONFIG.followRequired && isAllowedPlatform && farcasterUser && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl p-4 border-2 ${
                  isFollowing 
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                    : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'
                }`}
              >
                {followCheckLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                    <span className="text-sm text-gray-600">Checking follow status...</span>
                  </div>
                ) : followCheck?.quotaExceeded ? (
                  <div className="flex items-center justify-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                    <div className="text-sm text-amber-800">
                      Follow check temporarily unavailable - You can still claim!
                    </div>
                  </div>
                ) : isFollowing ? (
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div className="text-sm font-semibold text-green-800">
                      Following @{FARCASTER_CONFIG.targetUsername} ✓
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <UserPlus className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-bold text-purple-900 mb-1">
                          Follow Required
                        </div>
                        <div className="text-sm text-purple-700 mb-3">
                          To claim MON, please follow <span className="font-semibold">@{FARCASTER_CONFIG.targetUsername}</span> on Farcaster
                        </div>
                        <Button
                          onClick={() => {
                            window.open(FARCASTER_CONFIG.targetProfileUrl, '_blank')
                            toast.info('After following, come back and refresh to claim!')
                            setTimeout(() => {
                              refetchFollow()
                            }, 3000)
                          }}
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Follow @{FARCASTER_CONFIG.targetUsername}
                          <ExternalLink className="w-3 h-3 ml-2" />
                        </Button>
                      </div>
                    </div>
                    <Button
                      onClick={async () => {
                        toast.info('Checking follow status...')
                        const result = await refetchFollow()
                        
                        if (result.data?.isFollowing) {
                          toast.success('✓ Following confirmed! You can now claim MON.')
                        } else if (result.data?.quotaExceeded || result.data?.apiError) {
                          toast.warning('Follow check unavailable, but you can still claim!')
                        } else {
                          toast.error(`You're not following @${FARCASTER_CONFIG.targetUsername}. Please follow and try again.`)
                        }
                      }}
                      variant="outline"
                      className="w-full text-sm"
                    >
                      I've followed - Check again
                    </Button>
                  </div>
                )}
              </motion.div>
            )}

            {/* MON Stats Display */}
            {isAllowedPlatform && isFollowing && hasSpamLabel2 && (
              <>
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
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                  <div className="flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-blue-500 mr-2" />
                    <div className="text-center text-sm text-blue-700">
                      Contract stats unavailable. You can still try claiming!
                    </div>
                  </div>
                </div>
              )}
              </>
            )}

            {/* Daily Limit Reached Message - Only show if user actually reached the limit */}
            {monStats && !monStats.canClaimNow && monStats.remainingClaims === 0 && (
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
              {isWrongNetwork ? (
                <>
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Wrong Network
                </>
              ) : !isAllowedPlatform ? (
                <>
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Platform Restricted
                </>
              ) : !isFollowing ? (
                <>
                  <UserPlus className="w-5 h-5 mr-2" />
                  Follow Required
                </>
              ) : !hasSpamLabel2 ? (
                <>
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Low Reputation Score
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
              ) : monStats && !monStats.canClaimNow && monStats.remainingClaims === 0 ? (
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
