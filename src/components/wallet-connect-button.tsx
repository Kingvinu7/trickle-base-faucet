'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Button } from './ui/button'
import { Wallet, LogOut } from 'lucide-react'
import { useEffect } from 'react'

export function WalletConnectButton() {
  const { address, isConnected, isConnecting } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  // Auto-connect when in Farcaster (injected wallet is available)
  useEffect(() => {
    if (!isConnected && !isConnecting) {
      const injectedConnector = connectors.find(c => c.id === 'injected' || c.name.toLowerCase().includes('injected'))
      
      if (injectedConnector) {
        // Small delay to ensure connector is ready
        setTimeout(() => {
          console.log('🔌 Auto-connecting to injected wallet (Farcaster)...')
          connect({ connector: injectedConnector })
        }, 100)
      }
    }
  }, [isConnected, isConnecting, connectors, connect])

  // Format address for display
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (isConnecting) {
    return (
      <Button disabled className="flex items-center gap-2">
        <Wallet className="w-4 h-4 animate-pulse" />
        Connecting...
      </Button>
    )
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="glass px-4 py-2 rounded-xl flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="font-mono text-sm">{formatAddress(address)}</span>
        </div>
        <Button
          onClick={() => disconnect()}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="text-center text-sm text-gray-600 mb-2">
        Connect Your Wallet
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        {connectors.map((connector) => (
          <Button
            key={connector.id}
            onClick={() => connect({ connector })}
            className="flex items-center gap-2"
            variant={connector.id === 'injected' ? 'default' : 'outline'}
          >
            <Wallet className="w-4 h-4" />
            {connector.name}
          </Button>
        ))}
      </div>
    </div>
  )
}
