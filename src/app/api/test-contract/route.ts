import { NextRequest, NextResponse } from 'next/server'

const FAUCET_CONTRACT_ADDRESS = '0x52dA60097d20F5AE30a3A620095139B10a7B1734'

// Force dynamic to ensure this runs at request time
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { ethers } = await import('ethers')
    
    // Use a more reliable RPC provider
    const rpcUrls = [
      'https://base-rpc.publicnode.com',
      'https://base.llamarpc.com',
      'https://mainnet.base.org'
    ]
    
    let provider = null
    for (const rpcUrl of rpcUrls) {
      try {
        provider = new ethers.JsonRpcProvider(rpcUrl)
        await provider.getBlockNumber() // Test connection
        console.log('Connected to:', rpcUrl)
        break
      } catch (e) {
        console.log('Failed to connect to:', rpcUrl)
        continue
      }
    }
    
    if (!provider) throw new Error('All RPC providers failed')
    
    const currentBlock = await provider.getBlockNumber()
    
    // Test 1: Check if contract exists
    const code = await provider.getCode(FAUCET_CONTRACT_ADDRESS)
    const contractExists = code !== '0x'
    
    // Test 2: Try to get events from last 45k blocks (under 50k limit)
    const contractABI = ["event FundsDripped(address indexed recipient, uint256 amount)"]
    const contract = new ethers.Contract(FAUCET_CONTRACT_ADDRESS, contractABI, provider)
    
    const fromBlock = Math.max(0, currentBlock - 45000)
    const filter = contract.filters.FundsDripped()
    const events = await contract.queryFilter(filter, fromBlock, currentBlock)
    
    // Test 3: Query just last 3 days (to avoid timeout)
    console.log('Testing query for last 3 days...')
    const blocksPerDay = 43200
    const daysToQuery = 3
    const totalBlocks = blocksPerDay * daysToQuery
    const widerFrom = Math.max(0, currentBlock - totalBlocks)
    
    let widerEvents: any[] = []
    try {
      widerEvents = await contract.queryFilter(filter, widerFrom, currentBlock)
    } catch (e) {
      console.log('3-day query failed:', e)
    }
    
    return NextResponse.json({
      contractAddress: FAUCET_CONTRACT_ADDRESS,
      contractExists,
      currentBlock,
      test1: {
        description: 'Last 45,000 blocks (single query, under 50k limit)',
        fromBlock,
        toBlock: currentBlock,
        eventsFound: events.length,
        sampleEvents: events.slice(0, 3).map(e => ({
          blockNumber: e.blockNumber,
          recipient: (e as any).args?.recipient,
          amount: (e as any).args?.amount?.toString()
        }))
      },
      test2: {
        description: 'Last 3 days (single query to avoid timeout)',
        fromBlock: widerFrom,
        toBlock: currentBlock,
        blocksQueried: totalBlocks,
        eventsFound: widerEvents.length,
        sampleEvents: widerEvents.slice(0, 5).map(e => ({
          blockNumber: e.blockNumber,
          recipient: (e as any).args?.recipient,
          amount: (e as any).args?.amount?.toString()
        }))
      }
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
