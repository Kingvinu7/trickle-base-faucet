import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    if (!body.address || !body.txHash) {
      return NextResponse.json(
        { error: 'Address and transaction hash are required' },
        { status: 400 }
      )
    }

    // Validate transaction hash format
    if (!/^0x[a-fA-F0-9]{64}$/.test(body.txHash)) {
      return NextResponse.json(
        { error: 'Invalid transaction hash format' },
        { status: 400 }
      )
    }

    // Validate address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(body.address)) {
      return NextResponse.json(
        { error: 'Invalid address format' },
        { status: 400 }
      )
    }

    // Forward request to backend API
    const response = await fetch(`${API_BASE_URL}/log-claim`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { 
          error: errorData.error || 'Failed to log claim',
          success: false 
        },
        { status: response.status }
      )
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      message: 'Claim logged successfully',
      ...data,
    })
  } catch (error) {
    console.error('Log claim API error:', error)
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        success: false,
        message: 'Failed to log claim. This does not affect your transaction.',
      },
      { status: 500 }
    )
  }
}