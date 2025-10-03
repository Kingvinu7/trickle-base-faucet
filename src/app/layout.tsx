import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

import { headers } from 'next/headers' // Import headers function
import ContextProvider from '@/context' // Adjust import path if needed

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Trickle - Base Faucet',
  description: 'Get $0.025 worth of ETH for gas fees on Base mainnet. A Farcaster miniapp for seamless crypto transactions.',
  keywords: ['Base', 'faucet', 'ETH', 'gas fees', 'crypto', 'web3', 'Farcaster', 'miniapp', 'Base network'],
  authors: [{ name: 'Trickle Team' }],
  openGraph: {
    title: 'Trickle - Base Faucet',
    description: 'Get $0.025 worth of ETH for gas fees on Base mainnet. A Farcaster miniapp for seamless crypto transactions.',
    type: 'website',
    locale: 'en_US',
    url: 'https://trickle-base-faucet.vercel.app',
    siteName: 'Trickle Base Faucet',
    images: [
      {
        url: 'https://trickle-base-faucet.vercel.app/tp.png',
        width: 1200,
        height: 630,
        alt: 'Trickle Base Faucet - Get ETH for gas fees',
      },
      {
        url: 'https://trickle-base-faucet.vercel.app/th.png',
        width: 800,
        height: 600,
        alt: 'Trickle Base Faucet Hero',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trickle - Base Faucet',
    description: 'Get $0.025 worth of ETH for gas fees on Base mainnet. A Farcaster miniapp for seamless crypto transactions.',
    images: ['https://trickle-base-faucet.vercel.app/tp.png'],
  },
  other: {
    'farcaster:frame': 'vNext',
    'farcaster:frame:image': 'https://trickle-base-faucet.vercel.app/tp.png',
    'farcaster:frame:button:1': 'Get ETH',
    'farcaster:frame:button:1:action': 'link',
    'farcaster:frame:button:1:target': 'https://trickle-base-faucet.vercel.app',
    'farcaster:frame:button:2': 'View Stats',
    'farcaster:frame:button:2:action': 'link',
    'farcaster:frame:button:2:target': 'https://trickle-base-faucet.vercel.app',
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
        <link rel="icon" href="/ti.png" />
        <link rel="apple-touch-icon" href="/ti.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="canonical" href="https://trickle-base-faucet.vercel.app" />
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image" content="https://trickle-base-faucet.vercel.app/tp.png" />
        <meta property="og:image:secure_url" content="https://trickle-base-faucet.vercel.app/tp.png" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:alt" content="Trickle Base Faucet - Get ETH for gas fees" />
        <meta name="twitter:site" content="@tricklefaucet" />
        <meta name="twitter:creator" content="@tricklefaucet" />
        <meta name="application-name" content="Trickle Base Faucet" />
        <meta name="apple-mobile-web-app-title" content="Trickle Faucet" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#0052FF" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
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