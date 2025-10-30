import { NextRequest, NextResponse } from 'next/server'
import { ethers } from 'ethers'

// Environment variables needed:
// MON_FAUCET_OWNER_PRIVATE_KEY - The private key that owns the MON faucet contract
// NEXT_PUBLIC_MON_FAUCET_CONTRACT_ADDRESS - The deployed MON faucet contract address

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { address } = body
    
    if (!address) {
      return NextResponse.json(
        { 
          error: 'Address is required',
          success: false
        },
        { status: 400 }
      )
    }

    // Validate address format
    if (!ethers.isAddress(address)) {
      return NextResponse.json(
        { 
          error: 'Invalid Ethereum address',
          success: false
        },
        { status: 400 }
      )
    }

    // Check for required environment variables
    const privateKey = process.env.MON_FAUCET_OWNER_PRIVATE_KEY || process.env.FAUCET_OWNER_PRIVATE_KEY
    const contractAddress = process.env.NEXT_PUBLIC_MON_FAUCET_CONTRACT_ADDRESS
    
    if (!privateKey || !contractAddress) {
      console.error('Missing environment variables: MON_FAUCET_OWNER_PRIVATE_KEY or NEXT_PUBLIC_MON_FAUCET_CONTRACT_ADDRESS')
      return NextResponse.json(
        { 
          error: 'Server configuration error',
          success: false
        },
        { status: 500 }
      )
    }

    // Rate limiting by IP address
    const ip = request.headers.get('x-forwarded-for') || 
                request.headers.get('x-real-ip') || 
                'unknown'
    
    // TODO: Implement IP-based rate limiting with Redis or similar
    // For now, we rely on the contract's cooldown mechanism
    
    // Generate a unique nonce (prevents replay attacks)
    const nonce = ethers.hexlify(ethers.randomBytes(32))
    
    // Set deadline to 30 minutes from now (signatures expire)
    // Longer deadline for Monad testnet which can have delays
    const deadline = Math.floor(Date.now() / 1000) + (30 * 60)
    
    // Create the message hash (same as contract's getMessageHash)
    const messageHash = ethers.solidityPackedKeccak256(
      ['address', 'bytes32', 'uint256', 'address'],
      [address, nonce, deadline, contractAddress]
    )
    
    // Sign the message hash with owner's private key
    const wallet = new ethers.Wallet(privateKey)
    const signature = await wallet.signMessage(ethers.getBytes(messageHash))
    
    console.log('MON Signature generated for:', {
      address,
      nonce,
      deadline: new Date(deadline * 1000).toISOString(),
      ip,
      signer: wallet.address
    })
    
    // Return the signature and parameters
    return NextResponse.json({
      success: true,
      signature,
      nonce,
      deadline,
      message: 'Signature generated successfully'
    })
    
  } catch (error) {
    console.error('Request MON signature API error:', error)
    
    return NextResponse.json(
      {
        error: 'Failed to generate MON signature',
        success: false,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
