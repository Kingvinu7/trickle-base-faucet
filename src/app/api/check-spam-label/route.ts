import { NextRequest, NextResponse } from 'next/server'

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY || ''
const MINIMUM_SCORE = 0.2 // Minimum Neynar score required to claim

/**
 * Check if a user meets the minimum Neynar score requirement
 * Endpoint: POST /api/check-spam-label
 * Body: { fid: number }
 * Returns: { hasSpamLabel2: boolean, score?: number }
 * 
 * Note: We're reusing the spam label endpoint name for backward compatibility,
 * but now it checks Neynar score instead of spam labels.
 * 
 * Neynar score ranges from 0 to 1, where higher scores indicate more reputable accounts.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fid } = body

    if (!fid) {
      return NextResponse.json(
        { error: 'FID is required', hasSpamLabel2: false },
        { status: 400 }
      )
    }

    console.log(`🔍 Checking Neynar score for FID ${fid}`)

    // Check if Neynar API key is configured
    if (!NEYNAR_API_KEY) {
      console.warn('⚠️ NEYNAR_API_KEY not configured, allowing claim for development')
      return NextResponse.json({ 
        hasSpamLabel2: true,
        development: true,
        message: 'Score check bypassed (no API key configured)'
      })
    }

    // Fetch user data from Neynar API
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
      const status = response.status
      console.error('❌ Neynar API error:', status, response.statusText)
      
      // Handle specific error codes
      if (status === 402) {
        console.error('💳 Neynar API quota exceeded (402). Allowing claims to continue.')
        return NextResponse.json({ 
          hasSpamLabel2: true,
          quotaExceeded: true,
          message: 'Score check quota exceeded, allowing claim'
        })
      }
      
      // If API fails, be lenient to avoid blocking users
      return NextResponse.json({ 
        hasSpamLabel2: true,
        apiError: true,
        message: 'Score check unavailable, allowing claim'
      })
    }

    const data = await response.json()
    
    // Extract user data and score
    const user = data.users?.[0]
    const score = user?.experimental?.neynar_user_score || 0
    
    // Check if score meets minimum requirement
    const meetsRequirement = score >= MINIMUM_SCORE
    
    console.log(`✅ Neynar score check result: FID ${fid} has score ${score.toFixed(2)} (minimum: ${MINIMUM_SCORE}) - ${meetsRequirement ? 'PASSES' : 'FAILS'}`)

    return NextResponse.json({ 
      hasSpamLabel2: meetsRequirement,
      score: score,
      minimumScore: MINIMUM_SCORE,
      message: meetsRequirement 
        ? `User score ${score.toFixed(2)} meets minimum requirement`
        : `User score ${score.toFixed(2)} is below minimum ${MINIMUM_SCORE}`
    })
  } catch (error) {
    console.error('❌ Check Neynar score error:', error)
    
    // Be lenient on errors to avoid blocking legitimate users
    return NextResponse.json({ 
      hasSpamLabel2: true,
      error: true,
      message: 'Score check failed, allowing claim'
    })
  }
}
