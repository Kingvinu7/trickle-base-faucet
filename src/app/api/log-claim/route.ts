import { NextRequest, NextResponse } from 'next/server'
import { saveClaim, getRecentClaims, initializeDatabase } from '@/lib/db'

// Initialize database schema on first request
let dbInitialized = false

async function ensureDatabase() {
  if (!dbInitialized) {
    try {
      await initializeDatabase()
      dbInitialized = true
      console.log('Database initialized')
    } catch (error) {
      console.error('Database initialization failed:', error)
      // Don't throw - let the request continue and it will fail with a clear error
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureDatabase()
    
    const body = await request.json()
    const { address, txHash, farcasterUser } = body
    
    if (!address || !txHash) {
      return NextResponse.json(
        { 
          error: 'Address and transaction hash are required',
          success: false 
        },
        { status: 400 }
      )
    }
    
    // Save to database
    const savedClaim = await saveClaim({
      address: address.toLowerCase(),
      txHash,
      farcasterUser
    })
    
    console.log('Claim logged to database:', {
      address: address.toLowerCase(),
      txHash,
      farcasterUser: farcasterUser ? {
        fid: farcasterUser.fid,
        username: farcasterUser.username
      } : null
    })
    
    // Return success response
    return NextResponse.json({ 
      success: true,
      message: 'Claim logged successfully',
      claim: savedClaim
    })
  } catch (error) {
    console.error('Log claim API error:', error)
    
    return NextResponse.json(
      {
        error: 'Failed to log claim',
        success: false,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET endpoint to fetch recent claims
export async function GET(request: NextRequest) {
  try {
    await ensureDatabase()
    
    // Get limit from query params (default 20)
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    
    // Get recent claims (Farcaster only)
    const claims = await getRecentClaims(limit, true)
    
    console.log(`Fetched ${claims.length} Farcaster claims from database`)
    
    return NextResponse.json({
      success: true,
      claims
    })
  } catch (error) {
    console.error('Get claims API error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch claims',
        success: false,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}