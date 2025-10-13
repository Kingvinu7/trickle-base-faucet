import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FAUCET_CONTRACT_ADDRESS = '0xED4BDAb6870B57aB80a163cEe39196cA440C25a6'

export async function GET(request: NextRequest) {
  try {
    const { ethers } = await import('ethers')
    
    // Use the most reliable provider
    const provider = new ethers.JsonRpcProvider('https://base-rpc.publicnode.com')
    const currentBlock = await provider.getBlockNumber()
    
    // Query just last 1 day (under 50k block limit)
    const blocksPerDay = 43200
    const last1Day = blocksPerDay * 1
    const fromBlock = Math.max(0, currentBlock - last1Day)
    
    const contractABI = ["event FundsDripped(address indexed recipient, uint256 amount)"]
    const contract = new ethers.Contract(FAUCET_CONTRACT_ADDRESS, contractABI, provider)
    
    console.log(`Quick test: Querying from block ${fromBlock} to ${currentBlock}`)
    
    const filter = contract.filters.FundsDripped()
    const events = await contract.queryFilter(filter, fromBlock, currentBlock)
    
    console.log(`Found ${events.length} events in last 1 day`)
    
    return NextResponse.json({
      success: true,
      currentBlock,
      queryRange: {
        from: fromBlock,
        to: currentBlock,
        blocks: currentBlock - fromBlock,
        days: 1
      },
      eventsFound: events.length,
      events: events.map(e => ({
        blockNumber: e.blockNumber,
        transactionHash: e.transactionHash,
        recipient: (e as any).args?.recipient,
        amount: (e as any).args?.amount?.toString()
      }))
    })
  } catch (error) {
    console.error('Quick test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
