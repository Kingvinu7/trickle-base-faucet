import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

import { headers } from 'next/headers' // Import headers function
import ContextProvider from '@/context' // Adjust import path if needed

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Trickle - Base Faucet',
  description: 'Get $0.025 worth of ETH for gas fees on Base mainnet',
  keywords: ['Base', 'faucet', 'ETH', 'gas fees', 'crypto', 'web3'],
  authors: [{ name: 'Trickle Team' }],
  openGraph: {
    title: 'Trickle - Base Faucet',
    description: 'Get $0.025 worth of ETH for gas fees on Base mainnet',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trickle - Base Faucet',
    description: 'Get $0.025 worth of ETH for gas fees on Base mainnet',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0052FF',
}

// ATTENTION!!! RootLayout must be an async function to use headers() 
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Retrieve cookies from request headers on the server
  const headersObj = await headers() // IMPORTANT: await the headers() call
  const cookies = headersObj.get('cookie')

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        {/* Wrap children with ContextProvider, passing cookies */}
        <ContextProvider cookies={cookies}>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'hsl(var(--background))',
                color: 'hsl(var(--foreground))',
                border: '1px solid hsl(var(--border))',
              },
            }}
          />
        </ContextProvider>
      </body>
    </html>
  )
}