import { NextRequest, NextResponse } from 'next/server'

/**
 * Check if a user has spam label 2 using Merkle Team labels API
 * Endpoint: POST /api/check-spam-label
 * Body: { fid: number }
 * Returns: { hasSpamLabel2: boolean }
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

    console.log(`🔍 Checking spam label for FID ${fid}`)

    // Call Merkle Team labels API
    // API endpoint: https://api.merkle.team/v1/labels/{fid}
    const response = await fetch(
      `https://api.merkle.team/v1/labels/${fid}`,
      {
        headers: {
          'accept': 'application/json',
        },
      }
    )

    if (!response.ok) {
      const status = response.status
      console.error('❌ Merkle Team labels API error:', status, response.statusText)
      
      // If API fails or user not found, be lenient to avoid blocking users
      if (status === 404) {
        // User not found in labels database - they don't have any spam labels
        console.log(`✅ FID ${fid} not found in labels database (no spam labels)`)
        return NextResponse.json({ 
          hasSpamLabel2: true, // Allow users not in the spam database
          message: 'User not in spam database'
        })
      }
      
      // For other errors, be lenient
      return NextResponse.json({ 
        hasSpamLabel2: true,
        apiError: true,
        message: 'Spam label check unavailable, allowing claim'
      })
    }

    const data = await response.json()
    
    console.log('📊 Merkle Team API response:', JSON.stringify(data))
    
    // Check if user has spam label 2
    // The API may return labels in different formats:
    // 1. Array of label objects: { labels: [{ label: 2 }, ...] }
    // 2. Array of label values: { labels: [2, 3, ...] }
    // 3. Direct label value: { label: 2 }
    // We're looking for label 2 (which indicates non-spam/legitimate user)
    let hasSpamLabel2 = false
    
    if (Array.isArray(data?.labels)) {
      // Check if labels array contains label 2
      hasSpamLabel2 = data.labels.some((label: any) => {
        // Handle both object format { label: 2 } and primitive format (2)
        return (typeof label === 'object' && (label.label === 2 || label.value === 2 || label.id === 2)) ||
               label === 2
      })
    } else if (data?.label === 2) {
      // Handle single label format
      hasSpamLabel2 = true
    }
    
    console.log(`✅ Spam label check result: FID ${fid} ${hasSpamLabel2 ? 'HAS' : 'DOES NOT HAVE'} spam label 2`)

    return NextResponse.json({ 
      hasSpamLabel2,
      message: hasSpamLabel2 ? 'User has spam label 2' : 'User does not have spam label 2'
    })
  } catch (error) {
    console.error('❌ Check spam label error:', error)
    
    // Be lenient on errors to avoid blocking legitimate users
    return NextResponse.json({ 
      hasSpamLabel2: true,
      error: true,
      message: 'Spam label check failed, allowing claim'
    })
  }
}
