import { NextRequest, NextResponse } from 'next/server'

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY || ''
const TARGET_FID = 250869 // vinu07's FID

/**
 * Check if a user follows the target FID using Neynar API
 * Endpoint: POST /api/check-follow
 * Body: { fid: number }
 * Returns: { isFollowing: boolean }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fid } = body

    if (!fid) {
      return NextResponse.json(
        { error: 'FID is required', isFollowing: false },
        { status: 400 }
      )
    }

    console.log(`🔍 Checking if FID ${fid} follows FID ${TARGET_FID}`)

    // Check if Neynar API key is configured
    if (!NEYNAR_API_KEY) {
      console.warn('⚠️ NEYNAR_API_KEY not configured, allowing claim for development')
      // In development/testing, allow claims if no API key
      return NextResponse.json({ 
        isFollowing: true,
        development: true,
        message: 'Follow check bypassed (no API key configured)'
      })
    }

    // Use Neynar API to check follow status
    // Docs: https://docs.neynar.com/reference/relevant-followers
    const response = await fetch(
      `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`,
      {
        headers: {
          'accept': 'application/json',
          'api_key': NEYNAR_API_KEY,
        },
      }
    )

    if (!response.ok) {
      console.error('❌ Neynar API error:', response.status, response.statusText)
      
      // If API fails, be lenient in production to avoid blocking users
      return NextResponse.json({ 
        isFollowing: true,
        apiError: true,
        message: 'Follow check unavailable, allowing claim'
      })
    }

    const data = await response.json()
    
    // Now check if the user follows the target
    const followCheckResponse = await fetch(
      `https://api.neynar.com/v2/farcaster/following?fid=${fid}&limit=100`,
      {
        headers: {
          'accept': 'application/json',
          'api_key': NEYNAR_API_KEY,
        },
      }
    )

    if (!followCheckResponse.ok) {
      console.error('❌ Follow check API error:', followCheckResponse.status)
      return NextResponse.json({ 
        isFollowing: true,
        apiError: true,
        message: 'Follow check unavailable, allowing claim'
      })
    }

    const followData = await followCheckResponse.json()
    const following = followData.users || []
    
    // Check if TARGET_FID is in the following list
    const isFollowing = following.some((user: any) => user.fid === TARGET_FID)
    
    console.log(`✅ Follow check result: FID ${fid} ${isFollowing ? 'IS' : 'IS NOT'} following FID ${TARGET_FID}`)

    return NextResponse.json({ 
      isFollowing,
      message: isFollowing ? 'User follows vinu07' : 'User does not follow vinu07'
    })
  } catch (error) {
    console.error('❌ Check follow error:', error)
    
    // Be lenient on errors to avoid blocking legitimate users
    return NextResponse.json({ 
      isFollowing: true,
      error: true,
      message: 'Follow check failed, allowing claim'
    })
  }
}
