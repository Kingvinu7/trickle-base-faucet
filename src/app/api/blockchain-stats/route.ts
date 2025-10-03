import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.API_BASE_URL || 'https://trickle-base-faucet.vercel.app'

export async function GET(request: NextRequest) {
  try {
    // Forward request to backend API
    const response = await fetch(`${API_BASE_URL}/blockchain-stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add cache control
      next: { revalidate: 60 }, // Cache for 60 seconds (blockchain data changes slower)
    })

    if (!response.ok) {
      // If blockchain stats fail, try database stats as fallback
      const fallbackResponse = await fetch(`${API_BASE_URL}/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json()
        return NextResponse.json({
          ...fallbackData,
          source: 'database',
          fallback: true,
        })
      }

      throw new Error(`Backend API responded with ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=120',
      },
    })
  } catch (error) {
    console.error('Blockchain stats API error:', error)
    
    // Return fallback data
    return NextResponse.json(
      {
        totalClaims: 0,
        claimsLast24h: 0,
        source: 'error',
        error: 'Failed to fetch blockchain stats',
      },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-cache',
        },
      }
    )
  }
}