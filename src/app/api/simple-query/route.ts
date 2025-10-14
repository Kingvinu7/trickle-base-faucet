import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FAUCET_CONTRACT_ADDRESS = '0x52dA60097d20F5AE30a3A620095139B10a7B1734'

export async function GET(request: NextRequest) {
  try {
    const { ethers } = await import('ethers')
    
    const provider = new ethers.JsonRpcProvider('https://base-rpc.publicnode.com')
    const currentBlock = await provider.getBlockNumber()
    
    console.log(`Current block: ${currentBlock}`)
    
    // Query last 1 day with exact event signature from BaseScan
    const blocksPerDay = 43200
    const fromBlock = Math.max(0, currentBlock - blocksPerDay)
    
    console.log(`Querying from ${fromBlock} to ${currentBlock}`)
    
    // Try the exact event signature
    const contractABI = [
      "event FundsDripped(address indexed recipient, uint256 amount)"
    ]
    
    const contract = new ethers.Contract(FAUCET_CONTRACT_ADDRESS, contractABI, provider)
    const filter = contract.filters.FundsDripped()
    
    console.log('Filter:', filter)
    
    const events = await contract.queryFilter(filter, fromBlock, currentBlock)
    
    console.log(`Found ${events.length} FundsDripped events`)
    
    // Also try querying all logs without filter
    const allLogs = await provider.getLogs({
      address: FAUCET_CONTRACT_ADDRESS,
      fromBlock,
      toBlock: currentBlock
    })
    
    console.log(`Found ${allLogs.length} total logs`)
    
    return NextResponse.json({
      contractAddress: FAUCET_CONTRACT_ADDRESS,
      currentBlock,
      queryRange: {
        from: fromBlock,
        to: currentBlock,
        blocks: currentBlock - fromBlock
      },
      fundsDrippedEvents: events.length,
      totalLogs: allLogs.length,
      fundsDrippedSamples: events.slice(0, 5).map(e => ({
        blockNumber: e.blockNumber,
        transactionHash: e.transactionHash,
        recipient: (e as any).args?.recipient,
        amount: (e as any).args?.amount?.toString(),
        rawData: e.data,
        topics: e.topics
      })),
      allLogsSamples: allLogs.slice(0, 5).map(log => ({
        blockNumber: log.blockNumber,
        transactionHash: log.transactionHash,
        topics: log.topics,
        data: log.data
      }))
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
