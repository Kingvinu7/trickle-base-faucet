import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { address, isAllowedPlatform } = body
    
    if (!address) {
      return NextResponse.json(
        { 
          error: 'Address is required',
          eligible: false
        },
        { status: 400 }
      )
    }
    
    // Check if the request is from an allowed platform (Farcaster only)
    // Also check server-side headers for additional verification
    const userAgent = request.headers.get('user-agent') || ''
    const referer = request.headers.get('referer') || ''
    const host = request.headers.get('host') || ''
    
    const isFromFarcaster = referer.includes('farcaster') || userAgent.toLowerCase().includes('farcaster')
    
    // Development mode bypass
    const isDevelopment = process.env.NODE_ENV === 'development' || 
                          host.includes('localhost') || 
                          host.includes('127.0.0.1') ||
                          referer.includes('localhost') ||
                          referer.includes('vercel.app')
    
    const serverSideAllowed = isFromFarcaster || isDevelopment
    
    // Combine client-side and server-side checks (require at least one to be true)
    const isAllowed = isAllowedPlatform || serverSideAllowed
    
    if (!isAllowed) {
      console.log('Access denied - not from Farcaster:', { address, userAgent, referer })
      return NextResponse.json({
        eligible: false,
        message: 'This faucet is only available for Farcaster users. Please access it through the Farcaster app.'
      })
    }
    
    // For now, always return eligible since we don't have a database connection
    // In a real deployment, you would check the database for recent claims here
    // The blockchain contract will enforce the cooldown anyway
    
    console.log('Eligibility check for address:', address, '- Platform allowed:', isAllowed)
    
    return NextResponse.json({
      eligible: true,
      message: 'Address is eligible to claim'
    })
  } catch (error) {
    console.error('Check eligibility API error:', error)
    
    // For network/connection errors, assume eligible to avoid false cooldown messages
    // This prevents showing "Cooldown Active" for new wallets when backend is unreachable
    return NextResponse.json(
      {
        error: 'Network connection failed',
        eligible: true, // Default to eligible when we can't verify (fail-open approach)
        message: 'Unable to verify cooldown status. Please try claiming - if you are in cooldown, the blockchain will prevent the transaction.'
      },
      { status: 500 }
    )
  }
}