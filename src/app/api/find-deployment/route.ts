import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FAUCET_CONTRACT_ADDRESS = '0x52dA60097d20F5AE30a3A620095139B10a7B1734'

export async function GET(request: NextRequest) {
  try {
    const { ethers } = await import('ethers')
    
    const provider = new ethers.JsonRpcProvider('https://base-rpc.publicnode.com')
    const currentBlock = await provider.getBlockNumber()
    
    console.log(`Current block: ${currentBlock}`)
    
    // Binary search to find deployment block
    let low = 0
    let high = currentBlock
    let deploymentBlock = 0
    
    console.log('Searching for contract deployment block...')
    
    while (low <= high) {
      const mid = Math.floor((low + high) / 2)
      
      try {
        const code = await provider.getCode(FAUCET_CONTRACT_ADDRESS, mid)
        
        if (code !== '0x') {
          // Contract exists at this block, search earlier
          deploymentBlock = mid
          high = mid - 1
        } else {
          // Contract doesn't exist, search later
          low = mid + 1
        }
      } catch (e) {
        console.log(`Error at block ${mid}:`, e)
        low = mid + 1
      }
    }
    
    console.log(`Found deployment block: ${deploymentBlock}`)
    
    // Get block timestamp
    const block = await provider.getBlock(deploymentBlock)
    const deploymentDate = block ? new Date(block.timestamp * 1000) : null
    
    // Now query events from deployment to current
    const contractABI = ["event FundsDripped(address indexed recipient, uint256 amount)"]
    const contract = new ethers.Contract(FAUCET_CONTRACT_ADDRESS, contractABI, provider)
    
    console.log(`Querying events from deployment block ${deploymentBlock} to ${currentBlock}`)
    
    // Query in chunks of 45k blocks
    const chunkSize = 45000
    let allEvents: any[] = []
    
    for (let start = deploymentBlock; start < currentBlock; start += chunkSize) {
      const end = Math.min(start + chunkSize - 1, currentBlock)
      console.log(`Querying ${start} to ${end}`)
      
      try {
        const filter = contract.filters.FundsDripped()
        const events = await contract.queryFilter(filter, start, end)
        allEvents = allEvents.concat(events)
        console.log(`Found ${events.length} events in chunk`)
      } catch (e) {
        console.log('Chunk failed:', e)
      }
    }
    
    return NextResponse.json({
      contractAddress: FAUCET_CONTRACT_ADDRESS,
      deploymentBlock,
      deploymentDate: deploymentDate?.toISOString(),
      daysAgo: deploymentDate ? Math.floor((Date.now() - deploymentDate.getTime()) / (1000 * 60 * 60 * 24)) : null,
      currentBlock,
      totalBlocksQueried: currentBlock - deploymentBlock,
      eventsFound: allEvents.length,
      sampleEvents: allEvents.slice(0, 10).map(e => ({
        blockNumber: e.blockNumber,
        transactionHash: e.transactionHash,
        recipient: (e as any).args?.recipient,
        amount: (e as any).args?.amount?.toString()
      }))
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
