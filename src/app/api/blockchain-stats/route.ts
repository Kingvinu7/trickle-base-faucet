import { NextRequest, NextResponse } from 'next/server'

// Use the correct contract address from the frontend constants
const FAUCET_CONTRACT_ADDRESS = '0xED4BDAb6870B57aB80a163cEe39196cA440C25a6'

export async function GET(request: NextRequest) {
  try {
    // Import ethers dynamically
    const { ethers } = await import('ethers')
    
    console.log('Fetching blockchain stats for contract:', FAUCET_CONTRACT_ADDRESS)
    
    // Contract ABI for the FundsDripped event
    const contractABI = [
      "event FundsDripped(address indexed recipient, uint256 amount)"
    ]
    
    // Try multiple RPC providers for reliability
    const rpcUrls = [
      'https://mainnet.base.org',
      'https://base.llamarpc.com',
      'https://base-rpc.publicnode.com',
      'https://base-mainnet.public.blastapi.io',
      'https://developer-access-mainnet.base.org'
    ]
    
    let provider = null
    let lastError = null
    
    for (const rpcUrl of rpcUrls) {
      try {
        console.log('Trying RPC:', rpcUrl)
        provider = new ethers.JsonRpcProvider(rpcUrl)
        
        // Test the connection
        const network = await provider.getNetwork()
        console.log('Connected to network:', network.name, 'Chain ID:', network.chainId)
        break
      } catch (rpcError) {
        const errorMessage = rpcError instanceof Error ? rpcError.message : String(rpcError)
        console.log('RPC failed:', rpcUrl, errorMessage)
        lastError = rpcError
        continue
      }
    }
    
    if (!provider) {
      const lastErrorMessage = lastError instanceof Error ? lastError.message : String(lastError)
      throw new Error(`All RPC providers failed. Last error: ${lastErrorMessage}`)
    }
    
    // Create contract instance
    const contract = new ethers.Contract(FAUCET_CONTRACT_ADDRESS, contractABI, provider)
    
    try {
      // Get the current block number
      const currentBlock = await provider.getBlockNumber()
      console.log('Current block:', currentBlock)
      
      // Try to query events in smaller chunks to avoid RPC limits
      const blocksPerDay = 43200 // 86400 seconds / 2 seconds per block
      const chunkSize = 10000 // Query 10k blocks at a time
      let allEvents: any[] = []
      let querySuccess = false
      
      try {
        // Strategy 1: Query all events from contract deployment to get ALL TIME claims
        // Base mainnet started at block 0, but the contract was deployed later
        // We'll query from a reasonable starting block or 0 to get all historical data
        const contractDeploymentBlock = 0 // Start from block 0 to get all claims
        const fromBlock = contractDeploymentBlock
        
        console.log(`Attempting to query all-time events from block ${fromBlock} to ${currentBlock}`)
        
        // Query in chunks to avoid RPC limits
        for (let start = fromBlock; start < currentBlock; start += chunkSize) {
          const end = Math.min(start + chunkSize - 1, currentBlock)
          console.log(`Querying blocks ${start} to ${end}...`)
          
          try {
            const filter = contract.filters.FundsDripped()
            const events = await contract.queryFilter(filter, start, end)
            allEvents = allEvents.concat(events)
            console.log(`Found ${events.length} events in this chunk`)
          } catch (chunkError) {
            const chunkErrorMessage = chunkError instanceof Error ? chunkError.message : String(chunkError)
            console.log(`Chunk failed: ${chunkErrorMessage}`)
            // Continue with other chunks
          }
        }
        
        querySuccess = true
        console.log(`Total events found: ${allEvents.length}`)
        
      } catch (strategyError) {
        const strategyErrorMessage = strategyError instanceof Error ? strategyError.message : String(strategyError)
        console.log('Strategy 1 failed:', strategyErrorMessage)
        
        // Strategy 2: Just try the last 1000 blocks
        try {
          console.log('Trying fallback: last 1000 blocks only')
          const filter = contract.filters.FundsDripped()
          allEvents = await contract.queryFilter(filter, currentBlock - 1000, currentBlock)
          querySuccess = true
          console.log(`Found ${allEvents.length} recent events`)
        } catch (fallbackError) {
          const fallbackErrorMessage = fallbackError instanceof Error ? fallbackError.message : String(fallbackError)
          console.log('Fallback also failed:', fallbackErrorMessage)
        }
      }
      
      if (!querySuccess || allEvents.length === 0) {
        // If we can't get real events, return placeholder data
        console.log('Unable to fetch events, returning placeholder data')
        
        return NextResponse.json({
          totalClaims: 0,
          claimsLast24h: 0,
          source: 'blockchain',
          contractAddress: FAUCET_CONTRACT_ADDRESS,
          status: 'no-events',
          message: 'Contract deployed but no events found or RPC limits exceeded',
          currentBlock
        }, {
          headers: {
            'Cache-Control': 'public, max-age=10, stale-while-revalidate=20',
          },
        })
      }
      
      // Count total claims
      const totalClaims = allEvents.length
      
      // Count claims in last 24 hours
      const last24HoursBlock = currentBlock - blocksPerDay
      let claimsLast24h = 0
      
      for (const event of allEvents) {
        if (event.blockNumber >= last24HoursBlock) {
          claimsLast24h++
        }
      }
      
      console.log(`Claims in last 24h: ${claimsLast24h}`)
      
      return NextResponse.json({
        totalClaims,
        claimsLast24h,
        source: 'blockchain',
        contractAddress: FAUCET_CONTRACT_ADDRESS,
        currentBlock,
        eventsQueried: allEvents.length
      }, {
        headers: {
          'Cache-Control': 'public, max-age=10, stale-while-revalidate=20',
        },
      })
      
    } catch (queryError) {
      const queryErrorMessage = queryError instanceof Error ? queryError.message : String(queryError)
      console.error('Error querying events:', queryErrorMessage)
      
      // If querying events fails, try a simpler approach
      try {
        const code = await provider.getCode(FAUCET_CONTRACT_ADDRESS)
        if (code === '0x') {
          throw new Error('Contract not found at address')
        }
        
        console.log('Contract exists but event query failed, returning placeholder data')
        return NextResponse.json({
          totalClaims: 0,
          claimsLast24h: 0,
          source: 'blockchain',
          contractAddress: FAUCET_CONTRACT_ADDRESS,
          status: 'partial',
          message: 'Contract found but unable to query events'
        }, {
          headers: {
            'Cache-Control': 'public, max-age=10, stale-while-revalidate=20',
          },
        })
      } catch (codeError) {
        const codeErrorMessage = codeError instanceof Error ? codeError.message : String(codeError)
        throw new Error(`Contract verification failed: ${codeErrorMessage}`)
      }
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error('Blockchain stats error:', errorMessage)
    console.error('Full error stack:', errorStack)
    
    // Return error but don't fail completely
    return NextResponse.json({ 
      error: "Blockchain stats failed",
      message: errorMessage,
      fallback: true,
      timestamp: new Date().toISOString()
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-cache',
      },
    })
  }
}