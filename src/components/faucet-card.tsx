'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAccount, useDisconnect, useSwitchChain } from 'wagmi'
import { useAppKit } from '@reown/appkit/react'
import { Wallet, Coins, LogOut, AlertCircle, CheckCircle, Loader2, Sparkles, UserPlus, ExternalLink } from 'lucide-react'
import { base } from '@reown/appkit/networks'
import { useFaucetClaim } from '@/hooks/use-faucet-claim'
import { useEligibility } from '@/hooks/use-eligibility'
import { useFarcasterMiniappContext } from '@/components/farcaster-miniapp-provider'
import { useFollowCheck } from '@/hooks/use-follow-check'
import { useSpamLabelCheck } from '@/hooks/use-spam-label-check'
import { formatAddress } from '@/lib/utils'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { FARCASTER_CONFIG } from '@/config/constants'

export function FaucetCard() {
  const { address, isConnected, chain } = useAccount()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()
  const { open } = useAppKit()
  const { isAllowedPlatform, isInFarcaster, farcasterUser } = useFarcasterMiniappContext()
  
  const [claimProgress, setClaimProgress] = useState(0)
  
  const { data: eligibility, isLoading: eligibilityLoading, refetch: refetchEligibility } = useEligibility(address, isAllowedPlatform)
  const { mutate: claimTokens, isPending: isClaimPending } = useFaucetClaim(farcasterUser || undefined)
  const { data: followCheck, isLoading: followCheckLoading, refetch: refetchFollow } = useFollowCheck(farcasterUser?.fid, FARCASTER_CONFIG.followRequired)
  const { data: spamLabelCheck, isLoading: spamLabelCheckLoading, refetch: refetchSpamLabel } = useSpamLabelCheck(farcasterUser?.fid, FARCASTER_CONFIG.spamLabelRequired)

  const isWrongNetwork = isConnected && chain?.id !== base.id
  const isFollowing = followCheck?.isFollowing ?? (!FARCASTER_CONFIG.followRequired) // Default to true if follow not required
  const hasSpamLabel2 = spamLabelCheck?.hasSpamLabel2 ?? (!FARCASTER_CONFIG.spamLabelRequired) // Default to true if spam label not required
  // Allow claiming if eligibility is undefined (API issues) or true, but not when explicitly false with a real cooldown message
  const hasRealCooldown = eligibility?.eligible === false && 
    (eligibility?.message?.includes('Please wait') || 
     eligibility?.message?.includes('more hours before claiming') || 
     eligibility?.message?.includes('hours before claiming again'))
  const canClaim = !isWrongNetwork && !isClaimPending && !eligibilityLoading && !hasRealCooldown && isAllowedPlatform && isFollowing && hasSpamLabel2
  
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
                      This faucet is only available for <span className="font-semibold">Farcaster</span> users. Please access it through the Farcaster app to claim your ETH.
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Wallet Info */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-1">Connected Wallet</div>
                <div className="font-mono font-semibold text-trickle-blue">
                  {formatAddress(address!)}
                </div>
              </div>
            </div>

            {/* Spam Label Requirement - Only show if spam label is required and user is in Farcaster */}
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
                    <span className="text-sm text-gray-600">Checking spam label...</span>
                  </div>
                ) : spamLabelCheck?.apiError ? (
                  <div className="flex items-center justify-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                    <div className="text-sm text-amber-800">
                      Spam label check temporarily unavailable - You can still claim!
                    </div>
                  </div>
                ) : hasSpamLabel2 ? (
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div className="text-sm font-semibold text-green-800">
                      Verified User ✓
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-bold text-red-900 mb-1">
                          Verification Required
                        </div>
                        <div className="text-sm text-red-700 mb-3">
                          Your account needs spam label 2 to claim ETH. This helps us prevent abuse and ensure fair distribution.
                        </div>
                        <div className="text-xs text-red-600">
                          Learn more about{' '}
                          <a 
                            href="https://github.com/merkle-team/labels" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="underline hover:text-red-800"
                          >
                            Merkle Team labels
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Follow Requirement - Only show if follow is required and user is in Farcaster */}
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
                          To claim ETH, please follow <span className="font-semibold">@{FARCASTER_CONFIG.targetUsername}</span> on Farcaster
                        </div>
                        <Button
                          onClick={() => {
                            window.open(FARCASTER_CONFIG.targetProfileUrl, '_blank')
                            toast.info('After following, come back and refresh to claim!')
                            // Refetch after 3 seconds
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
                        
                        // Check the result after refetch
                        if (result.data?.isFollowing) {
                          toast.success('✓ Following confirmed! You can now claim ETH.')
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

            {/* Info Banner - Only show for allowed platforms */}
            {isAllowedPlatform && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 rounded-2xl p-4 border-2 border-blue-200 shadow-md"
            >
              <div className="flex items-center justify-center space-x-2">
                <Coins className="w-5 h-5 text-blue-500" />
                <div className="text-center">
                  <div className="font-bold text-blue-900 text-base">
                    Claim ETH for Gas Fees
                  </div>
                  <div className="text-sm text-blue-700 mt-1">
                    Get <span className="font-semibold">$0.03</span> worth of ETH • Once per 24 hours
                  </div>
                </div>
                <Coins className="w-5 h-5 text-blue-500" />
              </div>
            </motion.div>
            )}

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
              {!isAllowedPlatform ? (
                <>
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Platform Restricted
                </>
              ) : eligibilityLoading ? (
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