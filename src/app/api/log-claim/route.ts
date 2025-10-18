import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// In-memory storage for claims (resets on server restart)
// In production, use a proper database
let recentClaims: Array<{
  address: string
  txHash: string
  timestamp: string
  farcasterUser?: {
    fid: number
    username: string
    displayName: string
  }
}> = []

// Initialize from file if exists
async function loadClaims() {
  try {
    const dataDir = join(process.cwd(), 'data')
    const filePath = join(dataDir, 'claims.json')
    
    if (existsSync(filePath)) {
      const data = await readFile(filePath, 'utf-8')
      recentClaims = JSON.parse(data)
      console.log(`Loaded ${recentClaims.length} claims from storage`)
    }
  } catch (error) {
    console.error('Error loading claims:', error)
  }
}

// Save claims to file
async function saveClaims() {
  try {
    const dataDir = join(process.cwd(), 'data')
    if (!existsSync(dataDir)) {
      await mkdir(dataDir, { recursive: true })
    }
    const filePath = join(dataDir, 'claims.json')
    await writeFile(filePath, JSON.stringify(recentClaims, null, 2))
  } catch (error) {
    console.error('Error saving claims:', error)
  }
}

// Initialize claims on module load
loadClaims().catch(console.error)

export async function POST(request: NextRequest) {
  try {
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
    
    const claim = {
      address: address.toLowerCase(),
      txHash,
      timestamp: new Date().toISOString(),
      ...(farcasterUser && { farcasterUser })
    }
    
    // Add to recent claims (keep last 100)
    recentClaims.unshift(claim)
    recentClaims = recentClaims.slice(0, 100)
    
    // Save to file for persistence
    await saveClaims()
    
    console.log('Claim logged:', claim)
    
    // Return success response
    return NextResponse.json({ 
      success: true,
      message: 'Claim logged successfully'
    })
  } catch (error) {
    console.error('Log claim API error:', error)
    
    return NextResponse.json(
      {
        error: 'Failed to log claim',
        success: false,
      },
      { status: 500 }
    )
  }
}

// GET endpoint to fetch recent claims
export async function GET() {
  try {
    // Return last 20 claims with Farcaster users only
    const farcasterClaims = recentClaims
      .filter(claim => claim.farcasterUser)
      .slice(0, 20)
    
    return NextResponse.json({
      success: true,
      claims: farcasterClaims
    })
  } catch (error) {
    console.error('Get claims API error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch claims',
        success: false,
      },
      { status: 500 }
    )
  }
}