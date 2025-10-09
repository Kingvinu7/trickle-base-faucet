'use client'

import React, { ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, type Config } from 'wagmi'
// Import config and queryClient from the new root config file
import { config, queryClient } from '../../config'

export default function ContextProvider({
  children,
  cookies,
}: {
  children: ReactNode
  cookies: string | null // Keep cookies in signature but don't use it
}) {
  return (
    <WagmiProvider config={config as Config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}