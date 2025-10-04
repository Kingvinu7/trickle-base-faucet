import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { address } = body
    
    if (!address) {
      return NextResponse.json(
        { 
          error: 'Address is required',
          eligible: false
        },
        { status: 400 }
      )
    }
    
    // For now, always return eligible since we don't have a database connection
    // In a real deployment, you would check the database for recent claims here
    // The blockchain contract will enforce the cooldown anyway
    
    console.log('Eligibility check for address:', address)
    
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