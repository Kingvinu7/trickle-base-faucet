import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
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
          eligible: response.status === 500 ? true : false, // If server error, assume eligible to avoid false cooldown
          message: response.status === 500 ? 'Unable to verify cooldown status. Please try again.' : errorData.message
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Check eligibility API error:', error)
    
    return NextResponse.json(
      {
        error: 'Failed to check eligibility',
        eligible: false,
      },
      { status: 500 }
    )
  }
}