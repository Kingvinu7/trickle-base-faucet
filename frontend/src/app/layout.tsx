import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Toaster } from 'sonner'

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
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#0052FF',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        <Providers>
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
        </Providers>
      </body>
    </html>
  )
}