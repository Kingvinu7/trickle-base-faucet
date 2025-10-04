import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { address, txHash } = body
    
    if (!address || !txHash) {
      return NextResponse.json(
        { 
          error: 'Address and transaction hash are required',
          success: false 
        },
        { status: 400 }
      )
    }
    
    // For now, just log the claim locally since we don't have a database connection
    // In a real deployment, you would save this to your database here
    console.log('Claim logged:', { address, txHash, timestamp: new Date().toISOString() })
    
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