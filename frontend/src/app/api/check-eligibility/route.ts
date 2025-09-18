import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    if (!body.address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      )
    }

    // Forward request to backend API
    const response = await fetch(`${API_BASE_URL}/check-eligibility`, {
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
          error: errorData.error || 'Failed to check eligibility',
          eligible: false 
        },
        { status: response.status }
      )
    }

    const data = await response.json()

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'private, no-cache', // Don't cache eligibility checks
      },
    })
  } catch (error) {
    console.error('Check eligibility API error:', error)
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        eligible: false,
        message: 'Failed to check eligibility. Please try again.',
      },
      { status: 500 }
    )
  }
}