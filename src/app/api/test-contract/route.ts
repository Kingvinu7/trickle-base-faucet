import { NextRequest, NextResponse } from 'next/server'

const FAUCET_CONTRACT_ADDRESS = '0xED4BDAb6870B57aB80a163cEe39196cA440C25a6'

export async function GET(request: NextRequest) {
  try {
    const { ethers } = await import('ethers')
    
    const provider = new ethers.JsonRpcProvider('https://mainnet.base.org')
    const currentBlock = await provider.getBlockNumber()
    
    // Test 1: Check if contract exists
    const code = await provider.getCode(FAUCET_CONTRACT_ADDRESS)
    const contractExists = code !== '0x'
    
    // Test 2: Try to get events from last 100k blocks (about 23 days)
    const contractABI = ["event FundsDripped(address indexed recipient, uint256 amount)"]
    const contract = new ethers.Contract(FAUCET_CONTRACT_ADDRESS, contractABI, provider)
    
    const fromBlock = Math.max(0, currentBlock - 100000)
    const filter = contract.filters.FundsDripped()
    const events = await contract.queryFilter(filter, fromBlock, currentBlock)
    
    // Test 3: Get a wider range - last 500k blocks (about 115 days)
    const widerFrom = Math.max(0, currentBlock - 500000)
    const widerEvents = await contract.queryFilter(filter, widerFrom, currentBlock)
    
    return NextResponse.json({
      contractAddress: FAUCET_CONTRACT_ADDRESS,
      contractExists,
      currentBlock,
      test1: {
        description: 'Last 100,000 blocks (~23 days)',
        fromBlock,
        toBlock: currentBlock,
        eventsFound: events.length,
        sampleEvent: events[0] || null
      },
      test2: {
        description: 'Last 500,000 blocks (~115 days)',
        fromBlock: widerFrom,
        toBlock: currentBlock,
        eventsFound: widerEvents.length,
        sampleEvents: widerEvents.slice(0, 5).map(e => ({
          blockNumber: e.blockNumber,
          recipient: e.args?.recipient,
          amount: e.args?.amount?.toString()
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
