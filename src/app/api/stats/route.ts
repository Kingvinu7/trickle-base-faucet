import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // For now, return placeholder data since we don't have a database connection
    // In a real deployment, you would connect to your database here
    const stats = {
      totalClaims: 0, // This would be: await db.query('SELECT COUNT(*) FROM claims')
      claimsLast24h: 0, // This would be: await db.query('SELECT COUNT(*) FROM claims WHERE claim_timestamp > NOW() - INTERVAL 24 HOUR')
      source: 'database' as const,
    }

    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'public, max-age=30, stale-while-revalidate=60',
      },
    })
  } catch (error) {
    console.error('Stats API error:', error)
    
    // Return fallback data
    return NextResponse.json(
      {
        totalClaims: 0,
        claimsLast24h: 0,
        source: 'error' as const,
        error: 'Failed to fetch stats',
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