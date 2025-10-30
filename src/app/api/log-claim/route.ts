import { NextRequest, NextResponse } from 'next/server'
import { getPool, saveClaim, getRecentClaims, initializeDatabase } from '@/lib/db'

// Initialize database on first request
let dbInitialized = false

async function ensureDbInitialized() {
  if (!dbInitialized) {
    try {
      await initializeDatabase()
      dbInitialized = true
      console.log('✅ Database initialized for log-claim API')
    } catch (error) {
      console.error('❌ Failed to initialize database:', error)
      throw error
    }
  }
}

// GET - Retrieve recent claims for Hall of Fame
export async function GET(request: NextRequest) {
  try {
    // Ensure database is initialized
    await ensureDbInitialized()
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '20')
    const farcasterOnly = searchParams.get('farcasterOnly') !== 'false' // Default true
    
    console.log('📊 Fetching recent claims:', { limit, farcasterOnly })
    
    // Fetch claims from database
    const claims = await getRecentClaims(limit, farcasterOnly)
    
    console.log(`✅ Retrieved ${claims.length} claims from database`)
    
    return NextResponse.json({
      success: true,
      claims,
      count: claims.length
    })
  } catch (error) {
    console.error('❌ Failed to fetch claims:', error)
    
    // Check if it's a database connection error
    if (error instanceof Error && error.message.includes('DATABASE_URL')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Database not configured',
          message: 'DATABASE_URL environment variable is not set',
          claims: []
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch claims',
        message: error instanceof Error ? error.message : 'Unknown error',
        claims: []
      },
      { status: 500 }
    )
  }
}

// POST - Log a new claim
export async function POST(request: NextRequest) {
  try {
    // Ensure database is initialized
    await ensureDbInitialized()
    
    const body = await request.json()
    const { address, txHash, network, farcasterUser } = body
    
    if (!address || !txHash) {
      return NextResponse.json(
        {
          success: false,
          error: 'Address and txHash are required'
        },
        { status: 400 }
      )
    }
    
    console.log('💾 Logging claim:', {
      address: address.toLowerCase(),
      txHash,
      network,
      hasFarcasterData: !!farcasterUser
    })
    
    // Save claim to database
    const claim = await saveClaim({
      address,
      txHash,
      network,
      farcasterUser
    })
    
    console.log('✅ Claim logged successfully:', claim)
    
    return NextResponse.json({
      success: true,
      claim
    })
  } catch (error) {
    console.error('❌ Failed to log claim:', error)
    
    // Check if it's a duplicate transaction (conflict)
    if (error instanceof Error && error.message.includes('duplicate')) {
      return NextResponse.json(
        {
          success: true,
          message: 'Claim already logged'
        },
        { status: 200 }
      )
    }
    
    // Check if it's a database connection error
    if (error instanceof Error && error.message.includes('DATABASE_URL')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Database not configured',
          message: 'DATABASE_URL environment variable is not set'
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to log claim',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
